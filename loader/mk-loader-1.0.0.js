
!function( $ ) {

	'use strict';

	$.Mk.create('Loader', {

		_focus: false,

		_define: function() {

			this._name = 'mk-loader';

			this._templates = {
				container: ['<div />'],
				loader: ['<div />'],
				focus: ['<button class="sr-only"></button>'],
				alert: [
					'<span class="sr-only">',
						'Loading content, please wait.',
					'</span>'
				]
			};
		},

		_init: function($container, focus) {

			this.$container = $($container);

			this._focus = focus === true || false;

			this._define();
			this._applyAria();
		},

		_applyAria: function() {

			this.aria(this.$container)
				.live().relevantAdditions();
		},

		_buildAlert: function() {

			var id = this._uid(),
				$a = this._template('alert');

			$a.addClass(this._class('alert'));
			$a.attr('id', id);

			this.$container.data(
				this._class('alert-id'), id);

			this.aria($a).role('alert');

			return $a;
		},

		_buildFocus: function() {

			var $f = this._template('focus');
				$f.addClass(this._class('focus'));

			this.aria($f).role('presentation').hidden();

			return $f;
		},

		_build: function() {

			var $c = this._template('container'),
				$l = this._template('loader')

			$l.addClass(this._name);
			$c.addClass(this._class('container'));
			$c.append($l);

			return $c;
		},

		show: function() {

			var $c = this.$container;

        	if (this.aria($c).busy() != 'true') {

        		this.aria($c).busy(true);

				$('body').append(this._buildAlert());
				$c.append(this._build());
			}
			return this;
		},

		hide: function() {

			var $c = this.$container,
				id = $c.data(this._class('alert-id'));

			$c.find(this._class('container', true)).remove();
			$('#' + id).remove();

			this.aria(this.$container).busy(false);

			if (this._focus) {
				return this.focus();
			}
			return this;
		},

		focus: function() {

			var $f = this._buildFocus();
			
			this.$container.prepend($f);

			$f.focus();
			$f.remove();

			return this;
		},

		toggle: function() {

			if (this.$container.find(this._class('container', true)).length < 1) {
				return this.hide();
			}
			return this.show();
		}
	});

	$.fn.mkloader = function (show, focus) {

		return this.each(function() {

			var $el = $(this),
				loader = $el.data('mk-loader') || null;

			if (loader) {
				loader = null;
			}

			loader = new $.Mk.Loader($el, focus);
			$el.data('mk-loader', loader);

			if (show) { loader.show(); }
			else { loader.hide(); }
		});
	};

}(window.jQuery);