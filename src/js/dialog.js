/*
	<depedency:Core>
		<src>/dist/js/core.js</src>
		<docs>../</docs>
	</depedency:Core>
	<depedency:Tooltip>
		<src>/dist/js/tooltip.js</src>
		<docs>./docs/tooltip.html</docs>
	</depedency:Tooltip>
	<file:js>
		<src>/dist/js/dialog.js</src>
	</file:js>
	<file:css>
		<src>/dist/css/dialog.css</src>
	</file:css>
	<file:less>
		<src>/dist/less/dialog.less</src>
	</file:less>
	<file:scss>
		<src>/dist/scss/dialog.scss</src>
	</file:scss>

	<event:show>
		<desc>Fires when dialog is shown.</desc>
		<example>
			instance.on('show', function (tip, modal) {
				console.info('Showing for:', tip, modal);
			});
		</example>
	</event:show>

	<event:hide>
		<desc>Fired when dialog is hidden.</desc>
		<example>
			instance.on('show', function (tip, modal) {
				console.info('Hiding for:', tip, modal);
			});
		</example>
	</event:hide>

	<event:connect>
		<desc>Fired when a connection is being made between a trigger and it's modal.</desc>
		<example>
			instance.on('connect', function (tip, modal) {
				console.info('Connection being made for:', tip, modal);
			});
		</example>
	</event:connect>

	<event:position>
		<desc>Fired when positioning is invoked for a dialog modal.</desc>
		<example>
			instance.on('position', function (tip, modal, coords) {
				console.info('Coors for positioning are:', coords);
			});
		</example>
	</event:position>

	<event:lock>
		<desc>Fires when dialog is locked or unlocked.</desc>
		<example>
			instance.on('lock', function (tip, isLocked) {
				console.info('This tooltip is now ', isLocked && 'locked' || 'unlocked');
			});
		</example>
	</event:lock>
*/
(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {
		define( ['mk'], function ( mk ) {
			return factory( root, mk );
		});
	}
	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {
		module.exports = factory( root, require('mk'));
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		return factory( root, root.Mk );
	}

})( typeof window !== "undefined" ? window : this, function ( root, mk ) {

	mk.create('Dialog', mk.Tooltip, {

		name: 'mk-dg',

		modal: null,

		get _locked () {
			return this.root.hasClass('--locked');
		},

		get _unlocked () {
			return this.root.hasClass('--locked') !== true;
		},

		/*
			<property:locked>
				<desc>Boolean representing if the dialog is locked.</desc>
			</property:locked>
		*/

		get locked () {
			return this.root.hasClass('locked');
		},

		/*
			<property:unlocked>
				<desc>Boolean representing if the dialog is unlocked.</desc>
			</property:unlocked>
		*/

		get unlocked () {
			return this.root.hasClass('locked') !== true;
		},

		/*
			<property:isOpen>
				<desc>Boolean representing if the dialog is open.</desc>
			</property:isOpen>
		*/

		get isOpen () {
			return this.modal.attr('aria-hidden') !== 'true';
		},

		/*
			<property:isHidden>
				<desc>Boolean representing if the dialog is closed.</desc>
			</property:isHidden>
		*/

		get isHidden () {
			return this.modal.attr('aria-hidden') !== 'false';
		},

		/*
			<property:focusable>
				<desc>Boolean representing if the dialog has focusable content.</desc>
			</property:focusable>
		*/

		get focusable () {
			return this.isFocusable(this.modal);
		},

		_config: function (o) {

			o = o || {};
			o.position = o.position || 'bottom-left';

			this.super(o);
		},

		_build: function () {

			this.link();
			this.modal = this.$('#' + this.root.attr('aria-describedby'));
		},

		_bind: function () {

			var thiss = this;

			this.root
			.on('click.mk', function (e) {
				e.preventDefault();
				thiss._click();
			})
			.on('mouseenter.mk, focus.mk', function (e) {
				e.preventDefault();
				thiss._over(e.type !== 'mouseenter');
			})
			.on('mouseleave.mk, blur.mk', function (e) {
				e.preventDefault();
				thiss._out(e.type !== 'mouseleave');
			})
			.on('keyup.mk', function (e) {
				thiss._keyup(e);
			});

			this.$(document.documentElement)
			.off('mousedown.mk-dg')
			.on ('mousedown.mk-dg', function (e) {
				thiss._down(e);
			});
		},

		_keyup: function (e) {

			if (e.which === this.keycode.esc) {
				this._unlock().hide();
			}
		},

		_click: function () {

			if (this.root.data('action') === 'click') {
				this.toggle();
			}
		},

		_over: function (keyboard) {

			if (this.root.data('action') !== 'click') {

				this.show();

				if (keyboard === true && this.focusable) {
					this._lock();
				}
			}
		},

		_out: function (keyboard) {

			if (this.root.data('action') !== 'click') {

				if (keyboard !== true && this.focusable) {
					this._unlock();
				}
				this.hide();
			}
		},

		_lock: function () {
			this.root.addClass('--locked');
			return this;
		},

		_unlock: function () {
			this.root.removeClass('--locked');
			return this;
		},

		/*
			<method:link>
				<invoke>.link()</invoke>
				<desc>Links the root to the modal element.</desc>
			</method:link>
		*/

		link: function () {
			return this.super(this.root);
		},

		/*
			<method:position>
				<invoke>.position()</invoke>
				<desc>Positions the modal with the root element.</desc>
			</method:position>
		*/

		position: function () {
			return this.super(this.modal, this.root);
		},

		/*
			<method:focus>
				<invoke>.focus()</invoke>
				<desc>Injects the focusable killswitch inside the modal for tab focus functionality.</desc>
			</method:focus>
		*/

		focus: function () {

			var t = this.root,
				k = this.modal.find(this.selector('kill'));

			if (k.length < 1) {

				k = this.html('kill');

				k.on('focus.mk', function () {
					t.focus();
				});

				this.modal.append(k);
			}

			return this;
		},

		/*
			<method:show>
				<invoke>.show()</invoke>
				<desc>Shows the modal.</desc>
			</method:show>
		*/

		show: function () {

			if (this._unlocked && this.unlocked) {

				this.hideAll();

				this.transition(this.modal, function () {
					this.modal.removeClass('in');
				})
				.delay(function () {

					this.modal.addClass('in')
						.attr('aria-hidden', 'false');

					this.position();

					if (this.focusable) {
						this.focus();
					}
					this.emit('show', this.root, this.modal);
				});
			}
			return this;
		},

		/*
			<method:hide>
				<invoke>.hide([immediate])</invoke>
				<param:immediate>
					<type>Boolean</type>
					<desc>Set as true to close the modal without delay.</desc>
				</param:immediate>
				<desc>Hides the modal.</desc>
			</method:hide>
		*/

		hide: function (immediate) {

			var a = this.root.attr('data-action'), d;

			if (this._unlocked && this.unlocked) {

				d = immediate !== true
					&& a !== 'click'
					&& this.focusable
					&& this.config.delay || 0;

				this.transition(this.modal, function () {
					this.modal.removeClass('out');
				})
				.delay(function () {

					this.modal.addClass('out')
						.attr('aria-hidden', 'true');

					if (immediate || this.transitions !== true) {

						this.clearTransitions(this.modal);
						this.modal.removeClass('out');
					}

					this.emit('hide', this.root, this.modal);

				}, d);
			}
			return this;
		},

		/*
			<method:hideAll>
				<invoke>.hideAll()</invoke>
				<desc>Hides all associated dialogs with an element in "immediate" mode.</desc>
			</method:hideAll>
		*/

		hideAll: function () {
			return this.hide(true);
		},

		/*
			<method:toggle>
				<invoke>.toggle()</invoke>
				<desc>Toggles the modal between show() and hide().</desc>
			</method:toggle>
		*/

		toggle: function () {

			if (this.isOpen) {
				return this.hide();
			}
			return this.show();
		},

		/*
			<method:lock>
				<invoke>.lock()</invoke>
				<desc>Locks the modal from being shown or hidden.</desc>
			</method:lock>
		*/

		lock: function () {

			if (this.root.hasClass('locked') !== true) {
				this.root.addClass('locked');
				this.emit('lock', t, true);
			}
			return this;
		},

		/*
			<method:unlock>
				<invoke>.unlock()</invoke>
				<desc>Unlocks the modal, enabling the modal to be shown and hidden.</desc>
			</method:unlock>
		*/

		unlock: function () {

			if (this.root.hasClass('locked')) {
				this.root.removeClass('locked');
				this.emit('lock', t, false);
			}
			return this;
		}
	});

	return mk.get('Dialog');
});
