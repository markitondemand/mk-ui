

// TODO:
//		calculate padding/margins into positioning
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

		get stage () {

			var n = this.element;

			while (n.scrollTop <= 0 && n.tagName !== 'BODY') {
				n = n.parentNode;
			}

			return {
				node:   n
				top:    n.scrollTop, 
				left:   n.scrollLeft,
				scroll: n.scrollTop, 
				width:  n.offsetWidth,
				height: n.offsetHeight
			};
		},

		map: {

			'left center': function (mo, to) {
				return {
					left: to.left - mo.width,
					top: (to.top + (to.height / 2)) - (mo.height / 2)
				};
			},

			'left top': function (mo, to) {
				return {
					left: to.left - mo.width,
					top: to.top - mo.height
				};
			},

			'left bottom': function (mo, to) {
				return {
					left: to.left - mo.width,
					top: to.top + to.height
				};
			},

			'right center': function (mo, to) {
				return {
					left: to.left + to.width,
					top: (to.top + (to.height / 2)) - (mo.height / 2)
				};
			},

			'right top': function (mo, to) {
				return {
					left: to.left + to.width,
					top: to.top - mo.height
				};
			},

			'right bottom': function (mo, to) {
				return {
					left: to.left + to.width,
					top: to.top + to.height
				};
			},

			'top left': function (mo, to) {
				return {
					left: to.left,
					top: to.top - mo.height
				};
			},

			'top center': function (mo, to) {
				return {
					left: (to.left + (to.width / 2)) - (mo.width / 2),
					top: to.top - mo.height
				};
			},

			'top right': function (mo, to) {
				return {
					left: to.left + to.width - mo.width,
					top: to.top - mo.height
				};
			},

			'bottom left': function (mo, to) {
				return {
					left: to.left,
					top: to.top + to.height
				};
			},

			'bottom center': function (mo, to) {
				return {
					left: (to.left + (to.width / 2)) - (mo.width / 2),
					top: to.top + to.height
				};
			},

			'bottom right': function (mo, to) {
				return {
					left: to.left + to.width - mo.width,
					top: to.top + to.height
				};
			}
		},

		_bind: function () {
			this._bindRootEvents();
		},

		_bindRootEvents: function () {

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
			
			var node = this.$(trigger);

			if (node.data('action') === 'click') {
				this.toggle(trigger);
			}
		},

		_over: function (trigger) {
			
			var node = this.$(trigger);

			if (node.data('action') !== 'click') {
				this.show(trigger);
			}
		},

		_out: function (trigger) {
			
			var node = this.$(trigger);

			if (node.data('action') !== 'click') {
				this.hide(trigger);
			}
		},

		_getRelativePosition: function (o, x, y) {

			var result = {left: x, top: y};

			if (o.relativeParent) {
				var p = this.offset(o.relativeParent);

				result.left = p.left - x;
				result.top  = p.top - y;

				if (p.relativeParent) {
					return this._getRelativePosition(
						p, result.left, result.top);
				}
			}
			return result;
		},

		_tryPosition: function (k, mo, to, st, attempt) {

			attempt = attempt || 0;

			if (attempt < 5) {

				var fn = this.map.hasOwnProperty(k) 
					&& this.map[k] || null;

				if (fn) {

					var coords = fn(mo, to),
						left = coords.left,
						top = coords.top,
						k2  = k,
						rp;

					if (to.relativeParent) {
						rp = this._getRelativePosition(to, left, top);
						left = rp.left + coords.left;
						top  = rp.top + coords.top - st.scroll;
					}

					if (left < st.left) {
						k2 = /^left/i.test(k) && k2.replace(/left/, 'right') 
							|| k2.replace(/center/, 'left');
					}

					else if (left > st.width) {
						k2 = /^right/.test(k) && k2.replace(/right/, 'left')
							|| k2.replace(/center/, 'right');
					}

					if (top < st.top) {
						k2 = k2.replace(/top/, 'bottom');
					}

					else if (top > st.height) {
						k2 = k2.replace(/bottom/, 'top');
					}

					if (k2 !== k) {
						return this._tryPosition(
							k2, mo, to, st, attempt++);
					}
					return coords;
				}
			}
			return null;
		},

		link: function (trigger) {

			var node = this.$(trigger);

			if (node.data(this.name + '-linked') === 'true') {
				return this;
			}

			var html = node.data('label'),
				role = 'tooltip',
				uid  = this.uid(),
				tip  = this.$('#' + node.attr('aria-describedby'));

			if (html) {

				tip = this.html('modal', {
					html: html
				}).appendTo(node);
			}

			else {

				tip = node.find(this.selector('modal'));

				if (tip.length < 1) {
					tip = node.parent().find(
						this.selector('modal'));
				}

				uid = tip.attr('id') || uid;
			}

			if (tip.find('a, button, input, textarea, select, table').length) {
				role = 'dialog';
			}

			tip.attr({
				'id': uid,
				'role': role,
				'aria-hidden': 'true'
			});

			node.attr('aria-describedby', uid);
			node.data(this.name + '-linked', 'true');

			return this;
		},

		offset: function (node) {

			var reg = this.relexp,
				obj = {
					left: node.offsetLeft,
					top:  node.offsetTop,
					width: node.offsetWidth,
					height: node.offsetHeight
			};

			while ((node = node.offsetParent)) {

				if (!reg.test(node.style.position)) {
					obj.left += node.offsetLeft;
					obj.top  += node.offsetTop;
				} 
				else {
					obj.relativeParent = node;
				}
			}
			return obj;
		},

		position: function (modal, trigger) {

			var t = this.$(trigger),
				k = (t.data('position') || 'top center').toLowerCase(),

				coords = this._tryPosition(k,
					this.offset(modal), this.offset(trigger), this.stage);

			if (coords) {
				this.$(modal).css(coords);
			}
			return this;
		},

		modal: function (trigger) {

			var node = this.$(trigger),
				uid  = node.attr('aria-describedby');

			if (node.length > 0) {

				if (!uid) {
					return this.link(trigger).modal(trigger);
				}
				return this.$('#' + uid);
			}
			return this.$('');
		},

		show: function (trigger) {

			var t = this.$(trigger), m;

			if (t.hasClass('locked') !== true) {

				m = this.modal(trigger);
				m.attr('aria-hidden', 'false');
				return this.position(m[0], trigger);
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
				isHidden = m.attr('aria-hidden') === 'true';

			if (isHidden) {
				return this.show(trigger);
			}
			return this.hide(trigger);
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