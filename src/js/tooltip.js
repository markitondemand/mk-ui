/*
	<depedency:Core>
		<src>dist/js/core.js</src>
		<docs>/</docs>
	</depedency:Core>

	<file:js>
		<src>dist/js/tooltip.js</src>
	</file:js>
	<file:css>
		<src>dist/css/tooltip.css</src>
	</file:css>
	<file:less>
		<src>dist/less/tooltip.less</src>
	</file:less>
	<file:scss>
		<src>dist/scss/tooltip.scss</src>
	</file:scss>
	<event:show>
		<desc>Fires when tooltip is shown.</desc>
		<example>
			instance.on('show', function (tip, modal) {
				console.info('Showing for:', tip, modal);
			});
		</example>
	</event:show>
	<event:hide>
		<desc>Fired when tooltip is hidden.</desc>
		<example>
			instance.on('show', function (tip, modal) {
				console.info('Hiding for:', tip, modal);
			});
		</example>
	</event:hide>
	<event:connect>
		<desc>Fired when a connection is being made between a tip and it's modal.</desc>
		<example>
			instance.on('connect', function (tip, modal) {
				console.info('Connection being made for:', tip, modal);
			});
		</example>
	</event:connect>
	<event:position>
		<desc>Fired when positioning is invoked for a tooltip modal.</desc>
		<example>
			instance.on('position', function (tip, modal, coords) {
				console.info('Coors for positioning are:', coords);
			});
		</example>
	</event:position>
	<event:lock>
		<desc>Fires when tooltip is locked or unlocked.</desc>
		<example>
			instance.on('lock', function (tip, isLocked) {
				console.info('This tooltip is now ', isLocked && 'locked' || 'unlocked');
			});
		</example>
	</event:lock>
*/

(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(['mk'], function (mk) {
			return factory(root, mk);
		});
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory(root, require('mk'));
	}
	else {
		return factory(root, root.Mk);
	}

})(typeof window !== "undefined" && window || this, function (root, mk) {

	/*
		map
		big ol map for positioning elements next to their tips.
		The map accounts for each of 12 possible positions. You can also
		add to the map by passing in new values via Tooltip contstruction (config object).
	*/

	mk.create('Tooltip', {

		name: 'mk-tt',

		relexp: /^relative|absolute|fixed$/i,

		templates: {
			modal: '<span class="{{$key}}-modal">{{html}}</span>',
			kill: '<button class="{{$key}}-kill" role="presentation"></button>'
		},

		/*
			<property:map>
				<desc>Holds the different calculations used for positioning the tooltip. There are 12 possible positions, each of which can be overriden by you or new positions added to through the config object.</desc>
			</property:map>
		*/

		map: {

			'left-center': function (mo, to) {
				return {
					left: to.left - mo.width - mo.box.left - mo.box.right,
					top: (to.top + (to.height / 2)) - (mo.height / 2) - mo.box.top
				};
			},

			'left-top': function (mo, to) {
				return {
					left: to.left - mo.width - mo.box.left - mo.box.right,
					top: to.top - mo.box.top
				};
			},

			'left-bottom': function (mo, to) {
				return {
					left: to.left - mo.width - mo.box.left - mo.box.right,
					top: to.top + to.height - mo.height - mo.box.top
				};
			},

			'right-center': function (mo, to) {
				return {
					left: to.left + to.width,
					top: (to.top + (to.height / 2)) - (mo.height / 2) - mo.box.top
				};
			},

			'right-top': function (mo, to) {
				return {
					left: to.left + to.width,
					top: to.top - mo.box.top
				};
			},

			'right-bottom': function (mo, to) {
				return {
					left: to.left + to.width,
					top: to.top + to.height - mo.height - mo.box.top
				};
			},

			'top-left': function (mo, to) {
				return {
					left: to.left - mo.box.left,
					top: to.top - mo.height - (mo.box.bottom + mo.box.top)
				};
			},

			'top-center': function (mo, to) {
				return {
					left: (to.left + (to.width / 2)) - (mo.width / 2) - mo.box.left,
					top: to.top - mo.height - (mo.box.bottom + mo.box.top)
				};
			},

			'top-right': function (mo, to) {
				return {
					left: to.left + to.width - mo.width - mo.box.right,
					top: to.top - mo.height - (mo.box.bottom + mo.box.top)
				};
			},

			'bottom-left': function (mo, to) {
				return {
					left: to.left - mo.box.left,
					top: to.top + to.height
				};
			},

			'bottom-center': function (mo, to) {
				return {
					left: (to.left + (to.width / 2)) - (mo.width / 2) - mo.box.left,
					top: to.top + to.height
				};
			},

			'bottom-right': function (mo, to) {
				return {
					left: to.left + to.width - mo.width - mo.box.right,
					top: to.top + to.height
				};
			}
		},
		//
		// setup maps and a couple other per-element features
		// to run through and build the config object from
		//
		_config: function (o) {

			this.config.map = {};

			this.each(this.map, function (fn, n) {
				this.config.map[n] = fn;
			});

			o = o || {};
			o.position = o.position || 'top-center';
			o.delay = parseInt(o.delay || '200', 10) || 200;

			return this.super(o);
		},

		//
		// bind all events to the root element
		// and off-focus listeners to the documentElement
		//

		_bind: function () {

			var thiss = this,
				tt = this.selector(),
				md = this.selector('modal');

			this.root
			.on('mousedown.mk', tt, function (e) {
				e.preventDefault();
				thiss._click(this);
			})
			.on('mouseover.mk, focus.mk', tt, function (e) {
				e.preventDefault();
				thiss._over(this, e.type !== 'mouseenter');
			})
			.on('mouseout.mk, blur.mk', tt, function (e) {
				e.preventDefault();
				thiss._out(this, e.type !== 'mouseleave');
			})
			.on('keyup.mk', tt, function (e) {
				thiss._keyup(e, this);
			});

			this.$(document.documentElement)
			.off('mousedown' + tt)
			.on ('mousedown' + tt, function (e) {
				thiss._down(e);
			});
		},

		// when mousedown is tiped
		// on the document element
		//
		_down: function (e) {

			var t = this.$(e.target),
				tt = this.selector(),
				tm = this.selector('modal');

			if ((t.is(tt) || t.closest(tt).length > 0)
				|| (t.is(tm) || t.closest(tm).length > 0)) {
				return false;
			}

			return this.hideAll();
		},
		//
		// handler for the escape key
		//
		_keyup: function (e, tip) {

			if (e.which === this.keycode.esc) {
				this._unlock(tip).hide(tip);
			}
		},
		//
		// when mousedown is trigered on a tip
		// we use mousedown instead of click for speed
		//
		_click: function (tip) {

			var t = this.$(tip);

			if (t.data('action') === 'click') {
				this.toggle(tip);
			}
		},
		//
		// mouseenter/mouseover a tip element
		// tips with a data-toggle of click will be ignored
		//
		_over: function (tip, keyboard) {

			var t = this.$(tip);

			if (t.data('action') !== 'click') {

				this.show(tip);

				if (keyboard === true
					&& this.isFocusable(this.modal(tip))) {

					this._lock(tip);
				}
			}
		},
		//
		// mouseleave/mouseout of a tip element
		// tip elements with a data-toggle of click will be ignored
		//
		_out: function (tip, keyboard) {

			var t = this.$(tip);

			if (t.data('action') !== 'click') {

				if (keyboard !== true
					&& this.isFocusable(this.modal(tip))) {

					this._unlock(tip);
				}
				this.hide(tip);
			}
		},
		//
		// inernal locking function. For *internal* use only.
		// Use lock() for external usage.
		//
		_lock: function (tip) {

			this.$(tip).addClass('-locked');
			return this;
		},
		//
		// inernal locking function. For *internal* use only.
		// Use lock() for external usage.
		//
		_unlock: function (tip) {

			this.$(tip).removeClass('-locked');
			return this;
		},
		//
		// check if a triger is locked.
		// returns boolean.
		//
		_locked: function (tip) {
			return this.$(tip).hasClass('-locked');
		},
		//
		// check if a tip is unlocked.
		// returns boolean.
		//
		_unlocked: function (tip) {
			return this.$(tip).hasClass('-locked') !== true;
		},
		//
		// Get relative offset all the way up
		// the dom tree to the body.
		//
		_relative: function (o, x, y) {

			var r = {left: x, top: y}, p;

			if (o.parent) {

				p = this.offset(o.parent);

				r.left = x + p.left;
				r.top  = y + p.top;

				if (p.parent) {
					return this._relative(p, r.left, r.top);
				}
			}
			return r;
		},
		//
		// if relative parents are not the same
		// then the tooltip and tip do not share a common parent of measurement,
		// so we must go out and find the parents to calculate the offsets.
		//
		_adjust: function (mOffset, tOffset) {

			if (!tOffset.ajusted
				&& mOffset.parent !== tOffset.parent) {

				var tNewOffset = this._relative(tOffset, tOffset.left, tOffset.top);

				tOffset.left = tNewOffset.left;
				tOffset.top  = tNewOffset.top;

				tOffset.ajusted = true;
			}
		},
		//
		// Ths bulk of the positioning is done here. We'll grab the map entry,
		// run the offset/adjust calculation methods, and check positions against
		// what the map methods wants to set the modal as. We'll attempt up to 5 different
		// positions if for some reason the modal cannot fit in the position initially requested.
		//
		_position: function (key, mOffset, tOffset, frame, attempt) {

			key = key.toLowerCase();
			attempt = attempt || 0;

			// only try to smart position 5 times
			// before commitment to the final coords.
			if (attempt < 5) {

				// get the map function
				var fn = this.config.map.hasOwnProperty(key)
					&& this.config.map[key] || null;

				if (fn) {
					// try adjusting any offsets. for instance, if our
					// tooltip and tip do not live in the same relative parent.
					this._adjust(mOffset, tOffset);

					var coords = fn(mOffset, tOffset),
						key2 = key,
						left = coords.left,
						top  = coords.top,
						rp;

					// if we're dealing with elements positioned in a
					// relative, absolute, or fixed container we have a little extra work to do.
					if (tOffset.parent && mOffset.parent === tOffset.parent) {

						rp = this._relative(tOffset, left, 0);

						left = rp.left;
						top  = rp.top + tOffset.top - mOffset.height;
					}

					// basically if left < 0
					// but could be a negative value in x-scrollbar situations
					if (left < frame.left) {
						key2 = /^left/i.test(key) && key2.replace(/left/, 'right')
							|| key2.replace(/center/, 'left');
					}
					// if left is greater than our entire stage of real estate
					// we want to position right-based instead
					else if (left > frame.width) {
						key2 = /^right/.test(key) && key2.replace(/right/, 'left')
							|| key2.replace(/center/, 'right');
					}
					// if the top is going to be cutoff,
					// we want to try positioning on the bottom
					if (top < frame.top) {
						key2 = key2.replace(/top/, 'bottom');
					}
					// reverse of top. If positioning bottom cuts off the modal,
					// we want to try positioning at the top.
					else if (top > frame.height) {
						key2 = key2.replace(/bottom/, 'top');
					}

					if (key2 !== key) {
						return this._position(
							key2, mOffset, tOffset, frame, ++attempt);
					}

					coords.key = key;

					return coords;
				}
			}

			return null;
		},

		/*
			<method:isFocusable>
				<invoke>.isFocusable(modal)</invoke>
				<param:modal>
					<type>Node</type>
					<desc>Modal element (.mk-tt-modal)</desc>
				</param:modal>
				<desc>Checks modal to see if it has focusable elements or not. Returns boolean.</desc>
			</method:isFocusable>
		*/

		isFocusable: function (modal) {

			var focusable = this.$(
				'a, button, input, select, textarea, table, iframe', modal).length > 0;

			if (focusable !== true) {

				this.each(this.$('[tabindex]', modal), function(n) {

					if (n.tabindex > -1) {
						focusable = true;
						return false;
					}
				});
			}

			return focusable;
		},

		/*
			<method:link>
				<invoke>.link(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Links a tip element to a modal element.</desc>
			</method:link>
		*/

		link: function (tip) {

			var t = this.$(tip),
				m = this.$('#' + t.attr('aria-describedby')),
				h;

			// if we don't have a modal
			if (m.length < 1) {

				// check to see if we have an aria-label
				// if we do, we're going to create the tooltip from it
				var id = this.uid(),
					htm = t.attr('aria-label');

				if (htm) {
					m = this.html('modal', {html: htm}).appendTo(t);
					t.attr('aria-label', '');
				}
				else {
					// if we don't have a label, we're going to
					// look for a child/sibling element with an mk-tt-modal class
					// to link the two elements together
					m = t.find(this.selector('modal'));

					if (m.length < 1) {
						m = t.parent().find(this.selector('modal'));
					}

					id = m.attr('id') || id;
				}
				// set the id so we don't have to run through this code again
				m.attr('id', id);
			}

			// check to see if aria-hidden attribute exists on the modal
			h = m.attr('aria-hidden');

			// if aria hidden has not been set ever, set it
			if (!h) {
				m.attr('aria-hidden', 'true');
			}

			return this.connect(t, m);
		},
		//
		// connects the tip with the modal
		// sets the proper role, aria-describedby and aria-labelledby
		// adds transition classes if enabled
		//
		connect: function (tip, modal) {

			var t = this.$(tip),
				m = this.$(modal),
				i = t.attr('id'),
				r = 'tooltip';

			// if we've previously been connected, leave
			if (m.data(this.name + '-connected')) {
				return this;
			}
			// if the modal has focusable (tabbable) content,
			// change the role to dialog (tooltip is default)
			if (this.isFocusable(modal)) {

				r = 'dialog';

				if (!i) {
					i = this.uid();
					t.attr('id', i);
				}

				m.attr('aria-labelledby', i);
			}

			m.attr('role', r);
			t.attr('aria-describedby', m.attr('id'));

			// if transitions are enabled, set animation class hooks
			if (this.transitions) {
				m.addClass('transitions');
			}

			m.data(this.name + '-connected', true);

			this.emit('connect', t, m);

			return this;
		},
		//
		// get boxmodel values directly from css
		// adds margin and borders together for accurate measurements
		//
		box: function (n) {

			var node = this.$(n)[0],
				box = {top: 0, left: 0, right: 0, bottom: 0};

			if (node) {

				var css = getComputedStyle(node);

				this.each(box, function (v, n) {
					box[n] =
						parseFloat(css.getPropertyValue('margin-' + n), 10) +
						parseFloat(css.getPropertyValue('border-' + n + '-width'), 10)
				});
			}

			return box;
		},
		//
		// get all offset data for an element
		// pulls top, left, height, width recursively.
		// also provides a parent and box properties
		//
		offset: function (n, box) {

			var node = this.$(n)[0],
				reg  = this.relexp,
				obj  = {left: 0, top: 0, width: 0, height: 0, box: this.box(node)},
				css;

			if (node) {

				obj.left   = node.offsetLeft;
				obj.top    = node.offsetTop;
				obj.width  = node.offsetWidth;
				obj.height = node.offsetHeight;

				while (node = node.offsetParent) {

					css = getComputedStyle(node);

					// if a parent is relative, absolute, or fixed positioning
					// add their left and top values to our offset measurements
					if (reg.test(css.getPropertyValue('position')) !== true) {
						obj.left += node.offsetLeft;
						obj.top  += node.offsetTop;
					}
					// else provide a relative parent to measure off of
					else {
						obj.parent = node;
					}
				}
			}
			return obj;
		},
		//
		// get the dimentions of the frame we are working with
		// The frame is our containing element with scroll (overflow).
		// usually this is just the body, but it could also be a div with
		// a scrolling overflow.
		//
		frame: function (n) {

			var node = this.$(n)[0];

			if (node) {

				while (node.scrollTop <= 0 && node.tagName !== 'BODY') {
					node = node.parentNode;
				}

				return {
					node:   node,
					top:    node.scrollTop,
					left:   node.scrollLeft,
					scroll: node.scrollTop,
					width:  node.offsetWidth,
					height: node.offsetHeight
				};
			}
			return {node: null};
		},

		/*
			<method:position>
				<invoke>.position(modal, tip)</invoke>
				<param:modal>
					<type>Node</type>
					<desc>Modal element (.mk-tt-modal)</desc>
				</param:modal>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Positions a modal next to a tip.</desc>
			</method:position>
		*/

		position: function (modal, tip) {

			var t = this.$(tip),
				p = t.attr('data-position') || this.config.position,
				coords = this._position(p,
					this.offset(modal, true), this.offset(tip), this.frame(modal));

			if (coords) {

				var m = this.$(modal);

				this.each(this.config.map, function (fn, key) {
					m.removeClass(key);
				});

				m.addClass(coords.key);

				this.emit('position', t, m, coords);

				m.css({
					left: coords.left,
					top: coords.top
				});
			}
			return this;
		},

		/*
			<method:modal>
				<invoke>.modal(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Finds the modal associated with the tip.</desc>
			</method:modal>
		*/

		modal: function (tip) {

			var t  = this.$(tip),
				id = t.attr('aria-describedby') || '', m;

			if (!id) {

				this.link(tip);

				id = t.attr('aria-describedby') || '';
			}

			if (id) {
				id = '#' + id;
			}

			m = this.$(id);

			this.connect(t, m);

			return m;
		},
		//
		// appends a focusable element to the modal
		// if the modal has content. This allows us to 'trap'
		// focus between the modal and tip until escape is pressed
		// or focus is taken away by mouse events
		//
		focus: function (tip, modal) {

			var m = this.$(modal),
				k = m.find(this.selector('kill'));

			if (k.length < 1) {

				k = this.html('kill');

				k.on('focus.mk', function () {
					tip.focus();
				});

				m.append(k);
			}

			return this;
		},

		/*
			<method:show>
				<invoke>.show(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Shows the modal associated with the tip.</desc>
			</method:show>
		*/

		show: function (tip) {

			var t = this.$(tip), m;

			if (this._unlocked(t) && this.unlocked(t)) {

				this.hideAll();

				m = this.modal(tip);

				this.delay(function () {

					m.removeClass('out');
					m.addClass('in');

					m.attr('aria-hidden', 'false');

					this.position(m, tip);

					if (this.isFocusable(m)) {
						this.focus(t, m);
					}
					this.emit('show', t, m);
				});

				this.transition(m, function (e, el) {
					el.removeClass('in');
				});
			}
			return this;
		},

		/*
			<method:hide>
				<invoke>.hide(tip[, immediate])</invoke>
				<param:tip>
					<type>Node</type>
					<desc>Tip element (.mk-tt)</desc>
				</param:tip>
				<param:immediate>
					<type>Boolean</type>
					<desc>Forces hide without a delay or animation.</desc>
				</param:immediate>
				<desc>Hides the modal associated with the tip.</desc>
			</method:hide>
		*/

		hide: function (tip, immediate) {

			var t = this.$(tip),
				a = t.attr('data-action'),
				m, d;

			if (this._unlocked(t) && this.unlocked(t)) {

				m = this.modal(tip);

				d = immediate !== true
					&& a !== 'click'
					&& this.isFocusable(m)
					&& this.config.delay || 0;

				this.delay(function () {

					m.removeClass('in');
					m.addClass('out');

					m.attr('aria-hidden', 'true');

					if (immediate || this.transitions !== true) {
						m.removeClass('out');
						this.clearTransitions(m);
					}

					this.emit('hide', t, m);

				}, d);

				this.transition(m, function (e, el) {
					el.removeClass('out');
				});
			}

			return this;
		},

		/*
			<method:hideAll>
				<invoke>.hideAll()</invoke>
				<desc>Hides all tooltips in the given root context.</desc>
			</method:hideAll>
		*/

		hideAll: function () {

			var ms = this.$(this.selector('modal')).filter('[aria-hidden="false"]'),
				ts = this.$(this.selector(), this.element), t;

			return this.each(ms, function (m) {
				t = ts.filter('[aria-describedby="' + m.id + '"]');
				this._unlock(t).hide(t, true);
			});
		},

		/*
			<method:toggle>
				<invoke>.toggle(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Toggles between show() and hide().</desc>
			</method:toggle>
		*/

		toggle: function (tip) {

			var m = this.modal(tip),
				isOpen = m.attr('aria-hidden') === 'false';

			if (isOpen) {
				return this.hide(tip);
			}
			return this.show(tip);
		},

		/*
			<method:isOpen>
				<invoke>.isOpen(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Returns boolean value for if the modal is open or not.</desc>
			</method:isOpen>
		*/

		isOpen: function (tip) {
			return this.modal(tip).attr('aria-hidden') !== 'true';
		},

		/*
			<method:isHidden>
				<invoke>.isHidden(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Returns boolean value for if the modal is hidden or not.</desc>
			</method:isHidden>
		*/

		isHidden: function (tip) {
			return this.modal(tip).attr('aria-hidden') !== 'false';
		},

		/*
			<method:lock>
				<invoke>.lock(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Lock the modal. This diables show() and hide().</desc>
			</method:lock>
		*/

		lock: function (tip) {

			var t = this.$(tip);

			if (t.hasClass(this.name) && !t.hasClass('locked')) {
				t.addClass('locked');
				this.emit('lock', t, true);
			}
			return this;
		},

		/*
			<method:unlock>
				<invoke>.unlock(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Unlock the modal. This enables show() and hide().</desc>
			</method:unlock>
		*/

		unlock: function (tip) {

			var t = this.$(tip);

			if (t.hasClass(this.name) && t.hasClass('locked')) {
				t.removeClass('locked');
				this.emit('lock', t, false);
			}
			return this;
		},

		/*
			<method:locked>
				<invoke>.locked(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Returns boolean value for if the modal is locked or not.</desc>
			</method:locked>
		*/

		locked: function (tip) {
			return this.$(tip).hasClass('locked');
		},

		/*
			<method:unlocked>
				<invoke>.unlocked(tip)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<desc>Returns boolean value for if the modal is unlocked or not.</desc>
			</method:unlocked>
		*/

		unlocked: function (tip) {
			return this.$(tip).hasClass('locked') !== true;
		}
	});

	return mk.get('Tooltip');
});
