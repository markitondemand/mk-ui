
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

		name: 'mk-dg',

		modal: null,

		get _locked () {
			return this.root.hasClass('--locked');
		},

		get _unlocked () {
			return this.root.hasClass('--locked') !== true;
		},

		get locked () {
			return this.root.hasClass('locked');
		},

		get unlocked () {
			return this.root.hasClass('locked') !== true;
		},

		get isOpen () {
			return this.modal.attr('aria-hidden') !== 'true';
		},

		get isHidden () {
			return this.modal.attr('aria-hidden') !== 'false';
		},

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

		link: function () {
			return this.super(this.root);
		},

		position: function () {
			return this.super(this.modal, this.root);
		},

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
					this.emit('show');
				});
			}
			return this;
		},

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

					this.emit('hide');

				}, d);
			}
			return this;
		},

		hideAll: function () {
			return this.hide(true);
		},

		toggle: function () {

			if (this.isOpen) {
				return this.hide();
			}
			return this.show();
		},

		lock: function () {

			if (this.root.hasClass('locked') !== true) {
				this.root.addClass('locked');
				this.emit('lock', t, true);
			}
			return this;
		},

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