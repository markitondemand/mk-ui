(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( [ 'mknasty' ], function ( mk ) {
			return factory( root, mk );
		});
	}
	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {

		module.exports = factory( root, require( 'mknasty' ));
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		return factory( root, root.mkNasty );
	}

})( typeof window !== "undefined" ? window : this, function ( root, mk ) { 

	mk.create('Loader', {

		name: 'mk-loader',

		templates: {
			shadow: [
				'<div class="{{$key}}-shadow">',
					'{{template:overlay}}',
					'{{template:alert}}',
				'</div>'
			],
			overlay: [
				'<div class="{{$key}}-overlay" aria-hidden="true">',
					'{{loop:6}}',
						'<div class="disk disk-{{$index}}" />',
					'{{/loop:6}}',
				'</div>'
			],
			alert: '<div role="alert" class="{{$key}}-alert">{{message}}</div>',
			focus: '<button role="presentation" />'
		},

		formats: { 
			message: 'Loading content, please wait.'
		},

		get version () {
			return 'v1.0.0';
		},

		show: function () {

			var r = this.root,
				b = r.attr('aria-busy'),
				o;

			if (b !== 'true') {

				this.shadow = this.html('shadow', {
					message: this.config.formats.message
				}).appendTo(r);

				o = this.node('overlay', this.shadow);

				if (this.transitions) {
					o.addClass('transition');
				}

				this.delay(function () {
					o.addClass('in');
					r.attr('aria-busy', 'true');
				});
			}
			return this;
		},

		hide: function () {

			var r = this.root,
				b = r.attr('aria-busy'),
				o;

			if (b === 'true') {

				o = this.node('overlay', this.shadow);
				o.removeClass('in');

				this.transition(o, function () {

					this.shadow.remove();
					this.shadow = null;

					r.attr('aria-busy', 'false');
				});
			}
			
			if (this.config.focus === true) {
				return this.focus();
			}
			return this;
		},

		toggle: function () {

			if (this.root.attr('aria-busy') === 'true') {

				return this.hide();
			}
			return this.show();
		},

		focus: function () {

			this.html('focus')
				.appendTo(this.root)
				.focus()
				.remove();

			return this;
		}
	});

	return mk.get('Loader');
});