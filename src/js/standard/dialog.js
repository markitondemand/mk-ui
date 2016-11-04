
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

	mk.create('Dialog', mk.Tooltip, {

		name: 'mk-di',

		_bindRootEvents: function () {

			var thiss = this;

			this.root
			.on('click.mk', function (e) {
				e.preventDefault();
				thiss._click(this);
			})
			.on('mouseover.mk, focus.mk', function (e) {
				e.preventDefault();
				thiss._over(this);
			})
			.on('mouseout.mk, blur.mk', function (e) {
				e.preventDefault();
				thiss._out(this);
			});
		},

		modal: function () {
			return this.super(this.root);
		},

		show: function () {
			return this.super(this.root);
		},

		hide: function () {
			return this.super(this.root);
		},

		toggle: function () {

			var m = this.modal(),
				isHidden = modal.attr('aria-hidden') === 'true';

			if (isHidden) {
				return this.show();
			}
			return this.hide();
		}
	});

	return mk.get('Dialog');
});