/*
	<depedency:Core>
		<src>/dist/js/core.js</src>
		<docs>../</docs>
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
		define(['mk-ui'], function (mk) {
			return factory(root, mk);
		});
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory(root, require('mk-ui'));
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

		xrel: /^relative|absolute|fixed$/i,

		xfocus: /^a|button|input|select|textarea$/i,

		focusSelector: 'a, button, input, select, textarea, table, iframe',

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

		get version () {
			return 'v2.0.0';
		},

		//
		// setup maps and a couple other per-element features
		// to run through and build the config object from
		//
		configure: function (o) {

			this.config.map = {};

			this.each(this.map, function (fn, n) {
				this.config.map[n] = fn;
			});

			o = o || {};
			o.position = o.position || 'top-center';
			o.delay = parseInt(o.delay || '200', 10) || 200;

			return this.super(o);
		},

		/*
			<method:unmount>
				<invoke>.unmount()</invoke>
				<desc>Teardown instance freeing event, data, and reference memory.</desc>
			</method:unmount>
		*/

		unmount: function () {

			var r = this.root

			this.each('click,mouseenter,mouseleave,focus,blur,keyup'.split(','), function (type) {
				r.off(type + '.mk');
			});

			this.root =
			this.config = null;
		},

		//
		// bind all events to the root element
		// and off-focus listeners to the documentElement
		//

		bind: function () {

			var thiss = this,
				tt = this.selector(),
				md = this.selector('modal');

			if (!this.device) {

				this.root
				.on('mouseenter.mk', tt, function (e) {
					e.preventDefault();
					thiss._focus(this, e, false);
				})
				.on('mouseleave.mk', tt, function (e) {
					e.preventDefault();
					thiss._blur(this, e, false);
				});
			}

			this.root
			.on('click.mk', tt, function (e) {
				e.preventDefault();
				thiss._click(this);
			})
			.on('focus.mk', tt, function (e) {
				e.preventDefault();
				thiss._focus(this, e, true);
			})
			.on('blur.mk', tt, function (e) {
				e.preventDefault();
				thiss._blur(this, e, true);
			})
			.on('keyup.mk', tt, function (e) {
				thiss._keyup(e, this);
			});
		},

		_keyup: function (e, tip) {

			if (e.which === this.keycode.esc) {
				this.hide(tip);
			}
		},

		_click: function (tip) {

			if (this.device || this.$(tip).data('action') === 'click') {
				this.toggle(tip);
			}
		},

		_focus: function (tip, e, keyboard) {

			if (this.$(tip).data('action') !== 'click') {
				this.show(tip);
			}
		},

		_blur: function (tip, e, keyboard) {

			var t = this.$(e.relatedTarget || document.activeElement);

			if (t.parent(this.selector('modal')).length) {
				this._bindModalBlur(tip);
				return;
			}
			if (keyboard || (!keyboard && this.$(tip).data('action') !== 'click')) {
				this.hide(tip);
			}
		},

		_bindModalBlur: function (tip) {

			var modal = this.modal(tip),
				thiss = this;

			modal.on('blur.mk', true, function (e) {

				var t = e.relatedTarget || document.activeElement;

				if (!t || thiss.$(t).parent(modal).length < 1) {

					modal.off('blur.mk');

					if (!t) {
						thiss.hide(tip);
					}
				}
			});
		},

		_bindModalDown: function (tip, modal) {

			var thiss = this;

			modal.on('mousedown.mk', function (e) {

				if (thiss.xfocus.test(e.target)) {
					return;
				}

				e.preventDefault();
				e.stopPropagation();
				return false;
			});

			modal.on('click.mk', '[data-action="close"]', function (e) {
				e.preventDefault();
				thiss.hide(tip);
			});
		},

		_unbindModalDown: function (modal) {

			modal.off('mousedown.mk');
			modal.off('click.mk');
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
				r.top = y + p.top;

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
		_adjust: function (mo, to) {

			if (!to.ajusted && mo.parent !== to.parent) {

				var o = this._relative(to, to.left, to.top);

				to.left = o.left;
				to.top = o.top;

				to.ajusted = true;
			}
		},
		//
		// Ths bulk of the positioning is done here. We'll grab the map entry,
		// run the offset/adjust calculation methods, and check positions against
		// what the map methods wants to set the modal as. We'll attempt up to 5 different
		// positions if for some reason the modal cannot fit in the position initially requested.
		//
		_position: function (key, mo, to, frame, attempt) {

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
					this._adjust(mo, to);

					var coords = fn(mo, to),
						left = coords.left,
						top  = coords.top,
						rp;

					coords.key = key;

					// if we're dealing with elements positioned in a
					// relative, absolute, or fixed container we have a little extra work to do.
					if (to.parent && mo.parent === to.parent) {

						rp = this._relative(to, left, 0);

						left = rp.left;
						top = rp.top + to.top - mo.height;
					}

					// basically if left < 0
					// but could be a negative value in x-scrollbar situations
					if (left < frame.left) {
						key = /^left/i.test(key) && key.replace(/left/, 'right')
							|| key.replace(/center/, 'left');
					}
					// if left is greater than our entire stage of real estate
					// we want to position right-based instead
					else if (left > frame.width) {
						key = /^right/.test(key) && key.replace(/right/, 'left')
							|| key.replace(/center/, 'right');
					}
					// if the top is going to be cutoff,
					// we want to try positioning on the bottom
					if (top < frame.top) {
						key = key.replace(/top/, 'bottom');
					}
					// reverse of top. If positioning bottom cuts off the modal,
					// we want to try positioning at the top.
					else if (top > frame.height) {
						key = key.replace(/bottom/, 'top');
					}

					if (key !== coords.key) {
						return this._position(key, mo, to, frame, ++attempt);
					}
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

			if (modal.attr('role') === 'dialog') {
				return true;
			}

			return modal.find(this.focusSelector).length > 0
				|| this.first(modal.find('[tabindex]'), function (n) {
					if (n.tabindex > -1) {
						return true;
					}
			});
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
				m = this.$('#' + t.attr('aria-describedby')), h;

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

			if (modal.data(this.name + '-connected')) {
				return this;
			}

			var r = 'tooltip', i;

			// if the modal has focusable (tabbable) content,
			// change the role to dialog (tooltip is default)
			if (this.isFocusable(modal)) {

				r = 'dialog';
				i = tip.attr('id');

				if (!i) {

					i = this.uid();
					tip.attr('id', i);
				}

				modal.attr('aria-labelledby', i);
			}

			modal.attr('role', r);
			tip.attr('aria-describedby', modal.attr('id'));

			// if transitions are enabled, set animation class hooks
			if (this.transitions) {
				modal.addClass('transitions');
			}

			modal.data(this.name + '-connected', true);

			this.emit('connect', tip[0], modal[0]);

			return this;
		},
		//
		// get boxmodel values directly from css
		// adds margin and borders together for accurate measurements
		//
		box: function (node) {

			var box = {top: 0, left: 0, right: 0, bottom: 0};

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
				reg  = this.xrel,
				obj  = {left: 0, top: 0, width: 0, height: 0, box: this.box(node)},
				css;

			if (node) {

				obj.left   = node.offsetLeft;
				obj.top    = node.offsetTop;
				obj.width  = node.offsetWidth;
				obj.height = node.offsetHeight;

				var scroll = node;

				while ((scroll = scroll.parentNode) && scroll.tagName !== 'BODY') {
					if (scroll.scrollTop) {
						obj.top -= scroll.scrollTop;
					}
					if (scroll.scrollLeft) {
						obj.left -= scroll.scrollLeft;
					}
				}

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

			var doc = document.documentElement,
				body = document.body,
				node = this.$(n)[0],
				scroll = node;

			if (node) {

				while (node.scrollTop <= 0 && node !== body) {
					node = node.parentNode;
					scroll = node;
				}

				// ridiculous check for IE and Firefox because
				// the body scroll positions are set on the documentElement
				if (node === body && (node.scrollTop < doc.scrollTop || node.scrollLeft < doc.scrollLeft)) {
					scroll = doc;
				}

				return {
					node:   node,
					top:    scroll.scrollTop,
					left:   scroll.scrollLeft,
					scroll: scroll.scrollTop,
					width:  node.offsetWidth,
					height: node.offsetHeight
				};
			}

			return {node: null};
		},

		/*
			<method:position>
				<invoke>.position(tip, modal)</invoke>
				<param:tip>
					<type>Node</type>
					<desc>tip element (.mk-tt)</desc>
				</param:tip>
				<param:modal>
					<type>Node</type>
					<desc>modal element (.mk-tt-modal)</desc>
				</param:modal>
				<desc>Position a modal to a tip.</desc>
			</method:position>
		*/

		position: function (tip, modal) {

			var p = tip.attr('data-position') || this.config.position,
				coords;

			if (p !== 'none') {

				coords = this._position(p, this.offset(modal, true), this.offset(tip), this.frame(modal));

				if (coords) {

					this.each(this.config.map, function (fn, key) {
						modal.removeClass(key);
					});

					modal.addClass(coords.key);

					this.emit('position', tip[0], modal[0], coords);

					modal.css({
						left: coords.left,
						top: coords.top
					});
				}
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

			var tt = this.$(tip),
				id = tt.attr('aria-describedby') || '', m;

			if (!id) {
				return this.link(tip).modal(tip);
			}

			m = this.$('#' + id);

			this.connect(tt, m);

			return m;
		},

		//
		// appends a focusable element to the modal
		// if the modal has content. This allows us to 'trap'
		// focus between the modal and tip until escape is pressed
		// or focus is taken away by mouse events
		//
		focus: function (tip, modal) {

			var k = modal.find(this.selector('kill'));

			if (k.length < 1) {

				k = this.html('kill');

				k.on('focus.mk', function () {
					tip.focus();
				});
				modal.append(k);
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

			if (this.unlocked(t) && this.isHidden(t)) {

				this.hideAll();

				m = this.modal(tip);

				this.delay(function () {

					m.removeClass('out')
						.addClass('in')
						.attr('aria-hidden', 'false');

					this.position(t, m);
					this._bindModalDown(t, m);

					if (this.isFocusable(m)) {
						this.focus(t, m);
					}

					t.addClass('active');
					this.emit('show', t[0], m[0]);
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
				a = t.attr('data-action'), m, d;

			if (this.unlocked(t) && this.isOpen(t)) {

				m = this.modal(tip);

				d = immediate !== true
					&& a !== 'click'
					&& this.isFocusable(m)
					&& this.config.delay || 1;

				this.delay(function () {

					m.removeClass('in')
						.addClass('out')
						.attr('aria-hidden', 'true');

					this._unbindModalDown(m);

					if (immediate === true || !this.transitions) {
						m.removeClass('out');
						this.clearTransitions(m);
					}

					t.removeClass('active');
					this.emit('hide', t[0], m[0]);

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

			var tt = this.$(this.selector());

			return this.each(tt, function (t) {
				if (this.isOpen(t)) {
					this.hide(t, true);
				}
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

			if (this.isOpen(tip)) {
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
			return !this.isHidden(tip);
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
				this.emit('lock', t[0], true);
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
				this.emit('lock', t[0], false);
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
