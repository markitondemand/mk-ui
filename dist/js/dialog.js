/*
	<depedency:Core>
		<src>/dist/js/core.js</src>
		<docs>../</docs>
	</depedency:Core>
	<depedency:Tooltip>
		<src>/dist/js/tooltip.js</src>
		<docs>./tooltip.html</docs>
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
			instance.on('show', function (dg, modal) {
				console.info('Showing for:', dg, modal);
			});
		</example>
	</event:show>

	<event:hide>
		<desc>Fired when dialog is hidden.</desc>
		<example>
			instance.on('show', function (dg, modal) {
				console.info('Hiding for:', dg, modal);
			});
		</example>
	</event:hide>

	<event:connect>
		<desc>Fired when a connection is being made between a trigger and it's modal.</desc>
		<example>
			instance.on('connect', function (dg, modal) {
				console.info('Connection being made for:', dg, modal);
			});
		</example>
	</event:connect>

	<event:position>
		<desc>Fired when positioning is invoked for a dialog modal.</desc>
		<example>
			instance.on('position', function (dg, modal, coords) {
				console.info('Coors for positioning are:', coords);
			});
		</example>
	</event:position>

	<event:lock>
		<desc>Fires when dialog is locked or unlocked.</desc>
		<example>
			instance.on('lock', function (dg, isLocked) {
				console.info('This tooltip is now ', isLocked && 'locked' || 'unlocked');
			});
		</example>
	</event:lock>
*/
(function (root, factory) {

	if ( typeof define === 'function' && define.amd ) {
		define( ['mk-ui', 'mk-ui/tooltip'], function ( mk, Tooltip ) {
			return factory( root, mk, Tooltip );
		});
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory( root, require('mk-ui'), require('mk-ui/tooltip'));
	}
	else {
		return factory( root, root.Mk, root.Mk.Tooltip );
	}

})(typeof window !== "undefined" && window || this, function (root, mk, Tooltip) {

	if (typeof Tooltip === 'undefined') {
		throw new Error('Mk.Dialog: Tooltip base class not found.');
	}

	mk.create('Dialog', Tooltip, {

		name: 'mk-dg',

		modal: null,

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
			return !this.locked;
		},

		/*
			<property:isOpen>
				<desc>Boolean representing if the dialog is open.</desc>
			</property:isOpen>
		*/

		get isOpen () {
			return this.modal.attr('aria-hidden') === 'false';
		},

		/*
			<property:isHidden>
				<desc>Boolean representing if the dialog is closed.</desc>
			</property:isHidden>
		*/

		get isHidden () {
			return !this.isOpen;
		},

		/*
			<property:focusable>
				<desc>Boolean representing if the dialog has focusable content.</desc>
			</property:focusable>
		*/

		get focusable () {
			return this.isFocusable(this.modal);
		},

		configure: function (o) {

			o = o || {};
			o.position = o.position || 'none';

			this.param('arrow', 'boolean', o, false);

			this.super(o);
		},

		mount: function () {

			this.link();

			this.modal = this.$('#' + this.root.attr('aria-describedby'));

			if (this.config.arrow) {
				this.modal.addClass('arrow');
			}
		},

		/*
			<method:unmount>
				<invoke>.unmount()</invoke>
				<desc>Teardown instance freeing event, data, and reference memory.</desc>
			</method:unmount>
		*/

		unmount: function () {

			this.super();
			this.modal = null;
		},

		bind: function () {

			var thiss = this,
				root  = this.root;

			if (!this.device) {

				this.root.
				on('mouseenter.mk', function (e) {
					e.preventDefault();
					thiss._focus(this, e, false);
				})
				.on('mouseleave.mk', function (e) {
					e.preventDefault();
					thiss._blur(this, e, false);
				});
			}

			this.root
			.on('focus.mk', true, function (e) {
				e.preventDefault();
				thiss._focus(this, e, true);
			})
			.on('blur.mk', true, function (e) {
				e.preventDefault();
				thiss._blur(this, e, true);
			})
			.on('click.mk', function (e) {
				e.preventDefault();
				thiss._click();
			})
			.on('keyup.mk', function (e) {
				thiss._keyup(e);
			});
		},

		_keyup: function (e) {

			if (e.which === this.keycode.esc) {
				this.hide();
			}
		},

		_click: function () {

			if (this.device || this.root.data('action') === 'click') {
				this.toggle();
			}
		},

		_bindModalBlur: function () {

			var modal = this.modal,
				thiss = this;

			modal.on('blur.mk', true, function (e) {

				var t = e.relatedTarget || document.activeElement;

				if (!t || thiss.$(t).parent(modal).length < 1) {

					modal.off('blur.mk');

					if (!t) {
						thiss.hide();
					}
				}
			});
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
			return this.super(this.root, this.modal);
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
				<invoke>.show([silent])</invoke>
				<desc>Shows the modal.</desc>
				<param:silent>
					<type>Boolean</type>
					<desc>Set as true to keep show event from triggering.</desc>
				</param:silent>
			</method:show>
		*/

		show: function (silent) {

			if (this.unlocked && this.isHidden) {

				this.hideAll();

				this.delay(function () {

					this.modal.removeClass('out')
						.addClass('in')
						.attr('aria-hidden', 'false');


					this.position();
					this._bindModalDown(this.root, this.modal);

					if (this.focusable) {
						this.focus();
					}
					this.root.addClass('active');

					if (!silent) {
						this.emit('show', this.root[0], this.modal[0]);
					}
				});

				this.transition(this.modal, function (e, el) {
					el.removeClass('in');
				});
			}
			return this;
		},

		/*
			<method:hide>
				<invoke>.hide([immediate, silent])</invoke>
				<param:immediate>
					<type>Boolean</type>
					<desc>Set as true to close the modal without delay or animations.</desc>
				</param:immediate>
				<param:silent>
					<type>Boolean</type>
					<desc>Set as true to keep hide event from triggering.</desc>
				</param:silent>
				<desc>Hides the modal.</desc>
			</method:hide>
		*/

		hide: function (immediate, silent) {

			var a = this.root.attr('data-action'), d;

			if (this.unlocked && this.isOpen) {

				d = immediate !== true
					&& a !== 'click'
					&& this.focusable
					&& this.config.delay || 0;

				this.delay(function () {

					this.modal.removeClass('in')
						.addClass('out')
						.attr('aria-hidden', 'true');

					this._unbindModalDown(this.modal);

					if (immediate === true || !this.transitions) {
						this.modal.removeClass('out');
						this.clearTransitions(this.modal);
					}
					this.root.removeClass('active');

					if (!silent) {
						this.emit('hide', this.root[0], this.modal[0]);
					}

				}, d);

				this.transition(this.modal, function (e, el) {
					el.removeClass('out');
				});
			}
			return this;
		},

		/*
			<method:hideAll>
				<invoke>.hideAll()</invoke>
				<desc>Hides all page dialogs in root context with "immediate" mode on (no delay or animations).</desc>
			</method:hideAll>
		*/

		hideAll: function () {
			return this.hide();
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

			if (!this.root.hasClass('locked')) {
				this.root.addClass('locked');
				this.emit('lock', this.root[0], true);
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
				this.emit('lock', this.root[0], false);
			}
			return this;
		}
	});

	return mk.get('Dialog');
});
