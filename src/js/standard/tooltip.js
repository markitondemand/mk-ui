
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

		templates: {
			modal: `<span class="{{$key}}-modal">{{html}}</span>`,
			killswitch: `<button role="presentation" class="sr-only" data-action="kill"></button>`
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

		_click: function (n) {
			
			var node = this.$(n);

			if (node.data('action') === 'click') {
				this.toggle(n);
			}
		},

		_over: function (n) {
			
			var node = this.$(n);

			if (node.data('action') !== 'click') {
				this.show(n);
			}
		},

		_out: function (n) {
			
			var node = this.$(n);

			if (node.data('action') !== 'click') {
				this.hide(n);
			}
		},

		link: function (n) {

			var node = this.$(n),
				html = node.data('label'),
				role = 'tooltip',
				uid  = this.uid(),
				tip;

			if (html) {
				tip = this.html('modal', {html: html}).appendTo(node);
			}
			else {

				tip = node.find(this.selector('modal'));

				if (tip.length < 1) {
					tip = node.parent().find(
						this.selector('modal'));
				}

				uid = tip.attr('id') || uid;
			}

			if (tip.find('a, button, input, textarea, select').length) {
				role = 'dialog';
			}

			tip.attr({
				'id': uid,
				'role': role,
				'aria-hidden': 'true'
			});

			node.attr('aria-describedby', uid);

			return this;
		},

		modal: function (n) {

			var node = this.$(n),
				uid  = node.attr('aria-describedby');

			if (node.length > 0) {

				if (!uid) {
					return this.link(n).modal(n);
				}
				return this.$('#' + uid);
			}
			return this.$('');
		},

		show: function (trigger) {

			var m = this.modal(trigger);
				m.attr('aria-hidden', 'false');

			return this;
		},

		hide: function (trigger) {

			var m = this.modal(trigger);
				m.attr('aria-hidden', 'true');

			return this;			
		},

		toggle: function (trigger) {

			var m = this.modal(trigger),
				isHidden = m.attr('aria-hidden') === 'true';

			if (isHidden) {
				return this.show(trigger);
			}
			return this.hide(trigger);
		}
	});

	return mk.get('Tooltip');
});