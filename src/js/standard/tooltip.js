

// TODO:
//		rework testing for focus() elements and add killswitch + event

(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( ['mknasty'], function ( mk ) {
			return factory( root, mk );
		});
	}
	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {

		module.exports = factory( root, require('mknasty'));
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		return factory( root, root.mkNasty );
	}

})( typeof window !== "undefined" ? window : this, function ( root, mk ) {

	mk.create('Tooltip', {

		name: 'mk-tt',

		relexp: /^relative|absolute|fixed$/i,

		templates: {
			modal: `<span class="{{$key}}-modal">{{html}}</span>`,
			killswitch: `<button role="presentation" class="sr-only" data-action="kill"></button>`
		},

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
					top: to.top - mo.height + mo.box.top + mo.box.bottom
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

		get frame () {

			var n = this.element;

			while (n.scrollTop <= 0 && n.tagName !== 'BODY') {
				n = n.parentNode;
			}

			return {
				node:   n,
				top:    n.scrollTop, 
				left:   n.scrollLeft,
				scroll: n.scrollTop, 
				width:  n.offsetWidth,
				height: n.offsetHeight
			};
		},

		_config: function (o) {

			this.config.map = {};

			this.each(this.map, function (n, fn) {
				this.config.map[n] = fn;
			});

			o = o || {};
			o.position = o.position || 'top-center';

			return this.super(o);
		},

		_bind: function () {
			
			var thiss = this;

			this.root
			.on('click.mk', '.mk-tt', function (e) {
				e.preventDefault();
				thiss._click(this);
			})
			.on('mouseover.mk, focus.mk', '.mk-tt', function (e) {
				e.preventDefault();
				thiss._over(this);
			})
			.on('mouseout.mk, blur.mk', '.mk-tt', function (e) {
				e.preventDefault();
				thiss._out(this);
			});
		},

		_click: function (trigger) {
			
			var t = this.$(trigger);

			if (t.data('action') === 'click') {
				this.toggle(trigger);
			}
		},

		_over: function (trigger) {
			
			var t = this.$(trigger);

			if (t.data('action') !== 'click') {
				this.show(trigger);
			}
		},

		_out: function (trigger) {
			
			var t = this.$(trigger);

			if (t.data('action') !== 'click') {
				this.hide(trigger);
			}
		},

		_relativePosition: function (o, x, y) {

			var r = {left: x, top: y}, p;

			if (o.relativeParent) {

				p = this.offset(o.relativeParent);

				r.left = p.left - x;
				r.top  = p.top - y;

				if (p.relativeParent) {
					return this._relativePosition(
						p, r.left, r.top);
				}
			}

			return r;
		},

		_position: function (key, mOffset, tOffset, frame, attempt) {

			key = key.toLowerCase();
			attempt = attempt || 0;

			if (attempt < 5) {

				var fn = this.config.map.hasOwnProperty(key) 
					&& this.config.map[key] || null;

				if (fn) {

					var coords = fn(mOffset, tOffset),
						key2 = key,
						left = coords.left,
						top  = coords.top,
						rp;

					if (tOffset.relativeParent) {

						rp = this._relativePosition(tOffset, left, top);
						left = rp.left + coords.left;
						top  = rp.top + coords.top - frame.scroll;
					}

					if (left < frame.left) {
						key2 = /^left/i.test(key) && key2.replace(/left/, 'right') 
							|| key2.replace(/center/, 'left');
					}

					else if (left > frame.width) {
						key2 = /^right/.test(key) && key2.replace(/right/, 'left')
							|| key2.replace(/center/, 'right');
					}

					if (top < frame.top) {
						key2 = key2.replace(/top/, 'bottom');
					}

					else if (top > frame.height) {
						key2 = key2.replace(/bottom/, 'top');
					}

					if (key2 !== key) {
						return this._position(
							key2, mOffset, tOffset, frame, attempt++);
					}

					coords.key = key;

					return coords;
				}
			}

			return null;
		},

		isFocusable: function (dialog) {

			var focusable = this.$(
				'a, button, input, select, textarea, table, iframe', dialog).length > 0;

			if (focusable !== true) {

				this.each(this.$('[tabindex]'), function(i, n) {

					if (n.tabindex > -1) {
						focusable = true;
						return false;
					}
				});
			}

			return focusable;
		},

		link: function (trigger) {

			var t = this.$(trigger),
				m = this.$('#' + t.attr('aria-describedby'));

			if (m.length < 1) {

				var id = this.uid(),
					htm = t.data('label');
				
				if (htm) {
					m = this.html('modal', {html: htm}).appendTo(t);
				}
				else {

					m = t.find(this.selector('modal'));

					if (m.length < 1) {
						m = t.parent().find(this.selector('modal'));
					}

					id = m.attr('id') || id;
				}
				m.attr('id', id);
			}

			return this.connect(t, m);
		},

		connect: function (trigger, modal) {

			var t = this.$(trigger),
				m = this.$(modal),
				i = t.attr('id'),
				r = 'tooltip';

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

			return this;
		},

		box: function (n) {

			var node = this.$(n)[0], 
				box = {top: 0, left: 0, right: 0, bottom: 0};

			if (node) {

				var css = getComputedStyle(node);

				this.each(box, function (n, v) {
					box[n] = 
						parseFloat(css.getPropertyValue('margin-' + n), 10) + 
						parseFloat(css.getPropertyValue('border-' + n + '-width'), 10)
				});
			}

			return box;
		},

		offset: function (n, box) {

			var node = this.$(n)[0],
				reg  = this.relexp,
				obj  = {};

			if (node) {

				obj.left   = node.offsetLeft;
				obj.top    = node.offsetTop;
				obj.width  = node.offsetWidth;
				obj.height = node.offsetHeight;
				obj.box    = this.box(node);

				while (node = node.offsetParent) {

					if (reg.test(node.style.position) !== true) {
						obj.left += node.offsetLeft;
						obj.top  += node.offsetTop;
					} 
					else {
						obj.relativeParent = node;
					}
				}
			}
			return obj;
		},

		position: function (modal, trigger) {

			var t = this.$(trigger),
				p = t.data('position') || this.config.position,

				coords = this._position(p,
					this.offset(modal, true), this.offset(trigger), this.frame);

			if (coords) {

				var m = this.$(modal);

				this.each(this.config.map, function (key) {
					m.removeClass(key);
				});

				m.addClass(coords.key);

				m.css({
					left: coords.left,
					top: coords.top
				});
			}

			return this;
		},

		modal: function (trigger) {

			var t  = this.$(trigger),
				id = t.attr('aria-describedby'), m;

			if (!id) {
				return this.link(trigger).modal(trigger);
			}
				
			m = this.$('#' + id);

			this.connect(t, m);

			return m;
		},

		show: function (trigger) {

			var t = this.$(trigger), m;

			if (t.hasClass('locked') !== true) {

				m = this.modal(trigger);
				m.attr('aria-hidden', 'false');

				return this.position(m, trigger);
			}
			return this;
		},

		hide: function (trigger) {

			var t = this.$(trigger), m;

			if (t.hasClass('locked') !== true) {

				m = this.modal(trigger);
				m.attr('aria-hidden', 'true');
			}
			return this;			
		},

		toggle: function (trigger) {

			var m = this.modal(trigger),
				isOpen = m.attr('aria-hidden') === 'false';

			if (isOpen) {
				return this.hide(trigger);
			}
			return this.show(trigger);
		},

		isOpen: function (trigger) {
			return this.modal(trigger).attr('aria-hidden') !== 'true';
		},

		isHidden: function (trigger) {
			return this.modal(trigger).attr('aria-hidden') !== 'false';
		},

		lock: function (trigger) {

			var t = this.$(trigger);

			if (t.hasClass('.' + this.name)) {
				t.addClass('locked');
			}
			return this;
		},

		unlock: function (trigger) {

			var t = this.$(trigger);

			if (t.hasClass('.' + this.name)) {
				t.removeClass('locked');
			}
			return this;
		},

		isLocked: function (trigger) {
			return this.$(trigger).hasClass('locked');
		},

		isUnlocked: function (trigger) {
			return this.$(trigger).hasClass('locked') !== true;
		}
	});

	return mk.get('Tooltip');
});