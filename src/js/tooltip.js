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

			'left-center': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left - mo.width - mo.box.left - mo.box.right + leftOffset,
					top: (to.top + (to.height / 2)) - (mo.height / 2) - mo.box.top + topOffset
				};
			},

			'left-top': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left - mo.width - mo.box.left - mo.box.right + leftOffset,
					top: to.top - mo.box.top + topOffset
				};
			},

			'left-bottom': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left - mo.width - mo.box.left - mo.box.right + leftOffset,
					top: to.top + to.height - mo.height - mo.box.top + topOffset
				};
			},

			'right-center': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left + to.width + leftOffset,
					top: (to.top + (to.height / 2)) - (mo.height / 2) - mo.box.top + topOffset
				};
			},

			'right-top': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left + to.width + leftOffset,
					top: to.top - mo.box.top + topOffset
				};
			},

			'right-bottom': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left + to.width + leftOffset,
					top: to.top + to.height - mo.height - mo.box.top + topOffset
				};
			},

			'top-left': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left - mo.box.left + leftOffset,
					top: to.top - mo.height - (mo.box.bottom + mo.box.top) + topOffset
				};
			},

			'top-center': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: (to.left + (to.width / 2)) - (mo.width / 2) - mo.box.left + leftOffset,
					top: to.top - mo.height - (mo.box.bottom + mo.box.top) + topOffset
				};
			},

			'top-right': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left + to.width - mo.width - mo.box.right + leftOffset,
					top: to.top - mo.height - (mo.box.bottom + mo.box.top) + topOffset
				};
			},

			'bottom-left': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left - mo.box.left + leftOffset,
					top: to.top + to.height + topOffset
				};
			},

			'bottom-center': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: (to.left + (to.width / 2)) - (mo.width / 2) - mo.box.left + leftOffset,
					top: to.top + to.height + topOffset
				};
			},

			'bottom-right': function (mo, to, offset) {
				var leftOffset = offset && offset.left || 0;
				var topOffset = offset && offset.top || 0;
				return {
					left: to.left + to.width - mo.width - mo.box.right + leftOffset,
					top: to.top + to.height + topOffset
				};
			}
		},

		//
		// used to get left and/or top offset when you want position
		// arrow onto the center of your trigger element
		//
		getArrowOffset: function(mo, to, key) {
			var arrowOffset = { left: 0, top: 0};
			if (this.config.useArrowCenter) {
				switch (key) {
					case 'top-left':
					case 'bottom-left':
						arrowOffset.left = -this.config.arrowOffsets.horz + (to.width / 2) ;
						break;
					case 'top-right':
					case 'bottom-right':
						arrowOffset.left = this.config.arrowOffsets.horz - (to.width / 2)
						break;
					case 'right-top':
					case 'left-top':
						arrowOffset.top = -this.config.arrowOffsets.vert + (to.height / 2);
						break;
					case 'right-bottom':
					case 'left-bottom':
						arrowOffset.top = this.config.arrowOffsets.vert - (to.height / 2)
						break;
					default:
						// No arrowOffset
				}
			}
			return arrowOffset;
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

			// config to center arrow on your trigger element
			// MUST pass in the arrow offsets
			o.useArrowCenter = o.useArrowCenter || false;
			o.arrowOffsets = o.arrowOffsets || { };
			o.arrowOffsets.horz = o.arrowOffsets.horz || 0;
			o.arrowOffsets.vert = o.arrowOffsets.vert || 0;

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

			var t = this.$(e.relatedTarget);

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

				var t = e.relatedTarget;

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
		// so we must go out and find the parents to calculate the trigger's adjusted offsets.
		//
		_adjust: function (mo, to) {

			if (!to.ajusted && mo.parent !== to.parent) {

				var moParentOffset = this.offset(mo.parent, true);
				var toParentOffset = this.offset(to.parent, true);

				to.top = toParentOffset.top - moParentOffset.top + to.top;
				to.left = toParentOffset.left - moParentOffset.left + to.left;

				to.ajusted = true;
			}
		},

		//
		// These cycles are used to attempt multiple positions to determine the best fit
		//
		_cycles: {
			topBottom: ['top-center', 'bottom-center', 'top-left', 'bottom-left', 'top-right', 'bottom-right'],
			rightLeft: ['right-center', 'left-center', 'right-top', 'left-top', 'right-bottom', 'left-bottom']
		},

		//
		// Ths bulk of the positioning is done here. We'll grab the map entry,
		// run the offset/adjust calculation methods, and check positions against
		// what the map methods wants to set the modal as. We'll attempt up to 5 different
		// positions if for some reason the modal cannot fit in the position initially requested.
		//

		_position: function (key, mo, to, frame, recurseData) {

			key = key.toLowerCase();

			// Initialize recurseData which will be used when finding best fit position
			if (!recurseData) {
				var favorTopBottom = /^top-/i.test(key) || /^bottom-/i.test(key);
				var favorLeftRight = /^left-/i.test(key) || /^right-/i.test(key);

				recurseData = {
					bestFit: {
						lowest: 9000,
						coords: null
					},
					count: 0,
					origKey: key,
					items: {},
					favorTopBottom: favorTopBottom,
					favorLeftRight: favorLeftRight,
					cycle: favorLeftRight
						? this._cycles.leftRight
						: this._cycles.topBottom
				};

				var cycleIndex = recurseData.cycle.indexOf(key);
				recurseData.cycleIndex = cycleIndex >= 0 ? cycleIndex : 0;
			}

			// only try to smart position max 6 times
			// before commitment to the final coords.
			var stopCount = Math.min(recurseData.cycle.length, 6);
			if (recurseData.count < stopCount) {

				// get the map function
				var fn = this.config.map.hasOwnProperty(key)
					&& this.config.map[key] || null;

				if (fn) {
					// try adjusting any offsets. for instance, if our
					// tooltip and tip do not live in the same relative parent.
					this._adjust(mo, to);

					var arrowOffset = this.getArrowOffset(mo, to, key);

					var coords = fn(mo, to, arrowOffset),
						left = coords.left,
						top  = coords.top,
						width = mo.width,
						height = mo.height,
						rp;

					coords.key = key;

					// this is used to track the amount of pixels past sides of the viewport
					// which is used in the calculation to determine bestfit
					var amountOver;

					// if we're dealing with elements positioned in a
					// relative, absolute, or fixed container we have a little extra work to do.
					if (to.parent && mo.parent === to.parent) {

						rp = this._relative(mo, left, top);

						amountOver = {
							top: Math.max(frame.top - rp.top, 0),
							left: Math.max(frame.left - rp.left, 0),
							right: Math.max((rp.left + width) - frame.width, 0),
							bottom: Math.max((rp.top + height) - frame.height, 0),
						};
					} else {
						amountOver = {
							top: Math.max(frame.top - top, 0),
							left: Math.max(frame.left - left, 0),
							right: Math.max((left + width) - frame.width, 0),
							bottom: Math.max((top + height) - frame.height, 0),
						};
					}

					recurseData.items[key] = {
						amountOver: amountOver,
						coords: coords
					};
					recurseData.count++;

					// Determine bestFit score based on the amount the tooltip goes out of the viewport
					var aoTotal = amountOver.top +  amountOver.right + amountOver.bottom;
					if (amountOver.left <= 0 && aoTotal < recurseData.bestFit.lowest) {
						recurseData.bestFit.lowest = aoTotal;
						recurseData.bestFit.coords = coords;
					} else if (!recurseData.bestFit.coords) {
						// Set a fallback as the bestFit but add a large
						// value for lowest to account for left side collision
						recurseData.bestFit.lowest = aoTotal + amountOver.left + 5000;
						// adjust left position so it isn't cut off on left side
						recurseData.bestFit.coords = coords;
						recurseData.bestFit.coords.left += amountOver.left;
					}

					// attempt another position if bestfit been found (hasn't gotten to 0)
					if (recurseData.bestFit.lowest > 0) {
						var nextIndex = ++recurseData.cycleIndex % recurseData.cycle.length;
						key = recurseData.cycle[nextIndex];
						return this._position(key, mo, to, frame, recurseData);
					}
					return coords;
				}
			}

			// If nothing fits just fallback to original key as was done before
			// NOTE: We should add better fallback for collision detection or at least option
			//   to use dynamic position with custom arrow element (instead of :before styling)
			return recurseData.bestFit.coords;
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
		// Changed to just margin since offsetWidth/offsetHeight includes border
		//
		box: function (node) {

			var box = {top: 0, left: 0, right: 0, bottom: 0};

			if (node) {

				var css = getComputedStyle(node);

				this.each(box, function (v, n) {
					box[n] =
						parseFloat(css.getPropertyValue('margin-' + n), 10)// +
						//parseFloat(css.getPropertyValue('border-' + n + '-width'), 10)
				});
			}

			return box;
		},
		//
		// get all offset data for an element relative to closest positioned parent (unless body specified)
		// goToBody = true, this will pulls offsets for top, left, height, width recursively up the dom tree
		// also provides a parent and box properties
		//
		offset: function (n, goToBody) {

			var node = this.$(n)[0],
				reg  = this.xrel,
				obj  = {left: 0, top: 0, width: 0, height: 0, box: this.box(node)},
				css;

			if (node) {

				var origNode = node;

				obj.node   = node;
				obj.left   = node.offsetLeft;
				obj.top    = node.offsetTop;
				obj.width  = node.offsetWidth;
				obj.height = node.offsetHeight;

				obj.parent = node.offsetParent;

				while (node.offsetParent && goToBody) {
					node = node.offsetParent
					css = getComputedStyle(node);

					// if a parent is relative, absolute, or fixed positioning
					// add their left and top values to our offset measurements
					if (reg.test(css.getPropertyValue('position')) === true) {
						obj.left += node.offsetLeft;
						obj.top  += node.offsetTop;
					}
					obj.parent = node;
				}

				var scroll = origNode.parentNode;

				// Get offset based on all scrolling offsets for parent nodes
				// NOTE: If we are not traversing up to body, stop at parent closest positioned parent node if goToBody
				while (scroll && (scroll.tagName !== 'BODY' && scroll.tagName !== 'HTML') && (goToBody || scroll !== obj.parent)) {
					if (scroll.scrollTop) {
						obj.top -= scroll.scrollTop;
					}
					if (scroll.scrollLeft) {
						obj.left -= scroll.scrollLeft;
					}
					scroll = scroll.parentNode;
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

				// Reset width/top/left to get the largest width that fits in current viewport
				modal.css({
					width: '',
					left: '',
					top: ''
				});

				var moOffset = this.offset(modal);
				var toOffset = this.offset(tip);
				var moframe = this.frame(modal);

				// Set modal to the width that fits in positioned parent (or body)
				if (this.config.useFixedWidth) {
					modal.css({
						width: moOffset.width + 1 // plus 1 due to weird FireFox behavior
					});
				}

				coords = this._position(p, moOffset, toOffset, moframe);

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


					var topAdjust = moOffset.node.offsetHeight - moOffset.height;

					if (topAdjust !== 0 && /^top-/i.test(coords.key)) {
						modal.css({
							top: coords.top - topAdjust
						});
					}
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
