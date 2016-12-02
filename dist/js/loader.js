/*
	<depedency:Core>
		<src>/dist/js/core.js</src>
		<docs>../</docs>
	</depedency:Core>
	<file:js>
		<src>dist/js/loader.js</src>
	</file:js>
	<file:css>
		<src>dist/css/loader.css</src>
	</file:css>
	<file:less>
		<src>dist/less/loader.less</src>
	</file:less>
	<file:scss>
		<src>dist/scss/loader.scss</src>
	</file:scss>
	<event:show>
		<desc>Fires when the loader is shown.</desc>
		<example>
			instance.on('show', function (data) {
				console.info('loader is visible!');
			});
		</example>
	</event:show>
	<event:hide>
		<desc>Fires when the loader is hidden.</desc>
		<example>
			instance.on('hide', function () {
				console.info('loader is now gone!');
			});
		</example>
	</event:hide>
	<event:focus>
		<desc>Fired when focus is re-shifted to the root.</desc>
		<example>
			instance.on('focus', function () {
				console.info('Focus reshifted!');
			});
		</example>
	</event:focus>
*/
(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(['mk'], function (mk) {
			return factory(root, mk);
		});
	}
	else if ( typeof module === 'object' && module.exports ) {
		module.exports = factory(root, require('mk'));
	}
	else {
		return factory(root, root.Mk);
	}

})(typeof window !== "undefined" && window || this, function (root, mk) {

	mk.create('Loader', {

		name: 'mk-ld',

		templates: {
			shadow:
				'<div class="{{$key}}-shadow">\
					{{template:overlay}}\
					{{template:alert}}\
				</div>',

			overlay: '<div class="{{$key}}-overlay" aria-hidden="true"></div>',

			spincycle: '<div class="spincycle-inner"></div>',

			bubble:
				'<div class="bubble-inner">\
					<div class="bubble-1"></div>\
					<div class="bubble-2"></div>\
				</div>',

			samsung:
					'{{loop:6}}\
						<div class="disk disk-{{$index}}"></div>\
					{{/loop:6}}',

			alert: '<div role="alert" class="{{$key}}-alert">{{message}}</div>',
			focus: '<button role="presentation"></button>'
		},

		formats: {
			message: 'Loading content, please wait.'
		},

		get version () {
			return 'v2.0.0';
		},

		/*
			<property:refocus>
				<desc>Boolean representing if focus shifting should occur after new results are loaded. Default is true.</desc>
			</property:refocus>
		*/

		get refocus () {
			return this.config.refocus;
		},

		_config: function (o) {

			o = o || {};

			this._param('refocus', 'boolean', o, true);
			this._param('type', 'string', o, 'default');

			this.super(o);
		},

		_buildShadow: function () {

			if (!this.shadow) {

				this.shadow = this.html('shadow', {
					message: this.config.formats.message
				}).appendTo(this.root);

				var overlay = this.node('overlay', this.shadow),
					type = this.config.type;

				if (this.config.templates.hasOwnProperty(type)) {
					overlay.append(this.html(type));
				}

				overlay.addClass(type);
			}

			return this.shadow;
		},

		/*
			<method:show>
				<invoke>.show()</invoke>
				<desc>Show the loader and notify screen readers.</desc>
			</method:show>
		*/

		show: function () {

			var b = this.root.attr('aria-busy'), o, s;

			if (b !== 'true') {

				s = this._buildShadow();
				o = this.node('overlay', s);

				if (this.transitions) {
					o.addClass('transition');
				}

				this.delay(function () {
					o.addClass('in');
					this.root.attr('aria-busy', 'true');
					this.emit('show');
				});
			}
			return this;
		},

		/*
			<method:hide>
				<invoke>.hide()</invoke>
				<desc>Hide loaders, notify screen readers, and shift focus back to the top of the module if focus flag is set to true.</desc>
			</method:hide>
		*/

		hide: function () {

			var b = this.root.attr('aria-busy'), o;

			if (this.shadow && b === 'true') {

				o = this.node('overlay', this.shadow);
				o.removeClass('in');

				this.transition(o, function () {

					this.root.attr('aria-busy', 'false');

					this.shadow.remove();
					this.shadow = null;

					this.emit('hide');
				});
			}

			if (this.refocus) {
				return this.focus();
			}

			return this;
		},

		/*
			<method:toggle>
				<invoke>.toggle()</invoke>
				<desc>Toggles between hide() and show().</desc>
			</method:toggle>
		*/

		toggle: function () {

			if (this.root.attr('aria-busy') === 'true') {
				return this.hide();
			}
			return this.show();
		},

		/*
			<method:focus>
				<invoke>.focus()</invoke>
				<desc>Refocuses screen reader context back to the top of the root element.</desc>
			</method:focus>
		*/

		focus: function () {

			var f = this.html('focus')
				.prependTo(this.root)
				.focus()
				.remove();

			this.emit('focus');

			return this;
		}
	});

	return mk.get('Loader');
});
