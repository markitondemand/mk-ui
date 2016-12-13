
!function ($) {

	//'use strict';

	$.Mk.create('Tooltip', {

		_spacer: 10,

		_rtl: /\s?rtl\s?/i,
		_rev: /\s?reverse\s?/i,

		_init: function ($container, options) {

			this.$container = $($container);

			this._setOptions(options);
			this._define();
			this.bind();
		},

		_setOptions: function (options) {

			options = options || {};
			options.position = options.position || null;

			this.options = options;
		},

		_define: function () {

			this._name = 'mk-tooltip';

			this._templates = {

				container: [
					'<div />'
				],

				tooltip: [
					'<div>{{text}}</div>'
				],

				killswitch: [
					'<button class="sr-only"></button>'
				]
			};
		},

		_click: function (e) {

			var $t = $(e.target), $tt;

			if ($t.data('toggle') == 'click') {

				$tt = this._findTooltip($t);

				e.preventDefault();
				this._trackDialogFocus($t, $tt);
				this.show($t, e);
			}
		},

		_down: function (e) {

			var $t = $(e.target),
				ns = '.' + this._name;

			if ($t.is(ns)
				|| $t.closest(ns).length) {
				return;
			}

			if (!$t.is(this._class('trigger', true))) {
				$t = $t.closest(this._class('trigger', true));
			}

			if ($t.length && $t.data('toggle') === 'click') {
				return;
			}

			this.hide();
		},

		_over: function (e) {

			var $t = $(e.currentTarget);

			if ($t.data('toggle') === 'click') {
				return;
			}

			this.hide();
			this.show($t, e);
		},

		_out: function (e) {

			var $t = $(e.currentTarget),
				$o = $(e.toElement);

			if ($o.length && $o.closest(this._class('trigger', true)).length) {
				return;
			}

			if ($t.data('toggle') == 'click') {
				return;
			}
			this.hide($t);
		},

		_keypress: function (e, $t) {

			if (e.which == 13 || e.which == 32) {

				e.preventDefault();

				this.hide();
				this.show($t);

				var $tip = this._findTooltip($t);
				this._trackDialogFocus($t, $tip);
			}
		},

		_trackDialogFocus: function ($t, $tip) {

			var $killer = $tip.find(this._class('killswitch', true));

			if (!$killer.length) {

				$killer = this._template('killswitch');
				$killer.addClass(this._class('killswitch'));

				this.aria($killer).role('presentation');

				var me = this;

				$killer.on(this._ns('focus'), function () {
					me.hide($t);
					$t.focus();
				});
				$tip.append($killer);
			}
		},

		_getContainer: function () {

			if (!this.$tipsContainer) {

				var $c = this.$container.find(this._class('container', true));

				if (!$c.length) {
					$c = this._template('container');
					$c.addClass(this._class('container'));
					$c.appendTo(this.$container);
				}
				this.$tipsContainer = $c;
			}
			return this.$tipsContainer;
		},

		_getParent: function ($t) {

			var  parent = $t.data('parent'),
				$parent = this._getContainer();

			if (parent) {
				$parent = $(parent);
			}
			return $parent;
		},

		_findTrigger: function (el) {

			if (typeof el == 'number') {
				return $(this.$container.find(this._class('trigger', true))[parseInt(el, 10)]);
			}
			return $(el);
		},

		_findTooltip: function ($t) {

			var $tip = this.aria($t).describedby();

			if (!$tip.length) {

				if ($t.data('title')) {
					$tip = this._template('tooltip', { text: $t.data('title') });
					$tip.addClass(this._name);
				}
				else {

					$tip = $t.find('.' + this._name);

					if (!$tip.length) {
						$tip = $t.parent().find('.' + this._name);
					}
				}

				if ($.Mk.transitions()) {
					$tip.addClass(this._class('transitions'));
				}

				this._applyAria($tip, $t);
				this._getParent($t).append($tip);
			}

			this._bindTooltipEvents($tip, $t);

			return $tip;
		},

		_bindTooltipEvents: function ($tip, $t) {

			var me = this,
				ev = this._ns('click');

			$tip.off(ev).on(ev, '[data-action="close"]', function (e) {
				e.preventDefault();
				me.hide($t);
				$t.focus();
			});
		},

		_applyAria: function ($tip, $trigger) {

			if (!$tip.attr('id')) {
				this.aria($trigger).describedby($tip);
				this.aria($tip).hidden().role('tooltip');
			}

			if ($trigger.data('toggle') == 'click') {
				this._applyAriaDialog($tip, $trigger);
			}
		},

		_applyAriaDialog: function ($tip, $trigger) {

			this.aria($tip).labelledby($trigger).role('dialog').noindex();
			this.aria($trigger).haspopup(true);
		},

		_position: function ($tip, $trigger, xy) {

			var display = $tip.data('display') || '',
				rtl = this._rtl.test(display),
				rev = this._rev.test(display),
				win = $(window),

				tg = {
					width: $trigger.width(),
					height: $trigger.height(),
					offset: $trigger.offset()
				},
				tp = {
					width: $tip.outerWidth(),
					widthM: $tip.outerWidth(true),
					height: $tip.outerHeight(),
					heightM: $tip.outerHeight(true)
				};

			xy = xy || {};

			//set x if x is not being passed in directly
			if (!xy.x && xy.x !== 0) {
				this._positionX(rtl, tg, tp, xy, win, $tip);
			}
			//set Y if y is not being passed in directly
			if (!xy.y && xy.y !== 0) {
				this._positionY(rtl, rev, tg, tp, xy, win, $tip);
			}
			//apply
			$tip.css({ left: xy.x, top: xy.y });
		},

		_positionX: function (rtl, tg, tp, xy, win, $tip) {

			if (rtl) {
				//left/right vs. top bottom...
				return this._xRtl(tg, tp, xy, $tip);
			}
			//top/bottom positioning...
			this._xStandard(tg, tp, xy, win, $tip);
		},

		_xRtl: function (tg, tp, xy, $tip) {

			//position to the left of the trigger...
			xy.x = tg.offset.left - tp.widthM - ((tp.widthM - tp.width) / 2);
			$tip.addClass('rtl left');

			//position to the right if no room on the left...
			if (xy.x < this._spacer) {
				xy.x = tg.offset.left + tg.width + ((tp.widthM - tp.width) / 2);
				$tip.removeClass('left').addClass('right');
			}
		},

		_xStandard: function (tg, tp, xy, win, $tip) {

			//try centering...
			xy.x = tg.offset.left + (tg.width / 2);
			xy.x = xy.x - (tp.widthM / 2);

			//if not enough left space...
			if (xy.x <= this._spacer) {
				xy.x = tg.offset.left - ((tp.widthM - tp.width) / 2);
				$tip.addClass('left');
			}

			//if tooltip exceeds right space...
			if (xy.x + tp.width > win.width() - this._spacer) {
				xy.x = tg.offset.left + tg.width - (tp.width + ((tp.widthM - tp.width) / 2));
				$tip.removeClass('left').addClass('right');
			}
		},

		_positionY: function (rtl, rev, tg, tp, xy, win, $tip) {

			if (rtl) {
				//position completely different for right-to-left
				return this._yRtl(tg, tp, xy, win, $tip);
			}

			//if reverse, flip logic...
			if (rev) {
				//try bottom first...
				this._yBottom(tg, tp, xy, $tip);
				//fallback to top...
				if (win.height() <= xy.y + this._spacer) {
					this._yTop(tg, tp, xy, $tip);
				}
				return;
			}
			//try top first...
			this._yTop(tg, tp, xy, $tip);
			//fallback to bottom...
			if (win.scrollTop() >= xy.y + this._spacer) {
				this._yBottom(tg, tp, xy, $tip);
			}
		},

		_yTop: function (tg, tp, xy, $tip) {
			xy.y = tg.offset.top - tp.heightM;
			$tip.removeClass('reverse');
		},

		_yBottom: function (tg, tp, xy, $tip) {
			xy.y = tg.offset.top + tg.height;
			$tip.addClass('reverse');
		},

		_yRtl: function (tg, tp, xy, win, $tip) {

			//try center first...
			xy.y = tg.offset.top + (tg.height / 2) - (tp.heightM / 2);
			$tip.addClass('rtl');

			//try bottom...
			if (xy.y - window.scrollY <= this._spacer) {
				xy.y = tg.offset.top - (tp.heightM - tp.height);
				$tip.addClass('top');
			}

			//fallback to top...
			if ((xy.y - window.scrollY + tp.heightM) >= (win.height() - this._spacer)) {
				xy.y = tg.offset.top - tp.height + (tp.heightM - tp.height);
				$tip.removeClass('top').addClass('bottom');
			}
		},

		unmount: function () {

			this.$container.data('mk-tooltip', null);

			this.$container
				.off(this._ns('mouseover', 'focus'))
				.off(this._ns('mouseout', 'blur'))
				.off(this._ns('click'))
				.off(this._ns('mousedown'));

			this.$container = null;
			this.options = null;
		},

		bind: function () {

			var self = this;

			this.$container.on(
				this._ns('mouseover', 'focus'),
				this._class('trigger', true), function (e) {
					self._over(e);
				})
			.on(
				this._ns('mouseout', 'blur'),
				this._class('trigger', true), function (e) {
					self._out(e);
				})
			.on(
				this._ns('click'), this._class('trigger', true), function (e) {

					self._click(e);
				})
			.on(
				this._ns('mousedown'), function (e) {
					self._down(e);
				});
		},

		_fluid: function ($tip, $t, reset) {

			if ($tip.hasClass(this._class('fluid'))) {

				var $p = this._getParent($t);

				if (reset === true) {
					$p.removeAttr('style');
					$tip.removeAttr('style');
					return;
				}

				var tiph = $tip.outerHeight(),
					ph = $p.outerHeight();

				if (tiph > ph) {
					$p.height(tiph);
				}
				else {
					$tip.height(ph);
				}
			}
		},

		lock: function (el, xy) {
			var me = this,
				$t = this._findTrigger(el),
				$tip = this._findTooltip($t);
			$tip.addClass('lock');
			return this;

		},

		unlock: function (el, xy) {
			var me = this,
				$t = this._findTrigger(el),
				$tip = this._findTooltip($t);
			$tip.removeClass('lock');
			return this;

		},

		show: function (el, xy) {

			var me = this,
				$t = this._findTrigger(el),
				$tip = this._findTooltip($t);

			this.aria($tip).visible();

			if (this.options.position) {
				this.options.position.call(this, $t, $tip, xy);
			}
			else {
				this._position($tip, $t, xy);
			}

			$tip.removeClass('transition');

			$(window).one(this._ns('resize'), function () {
				me.hide();
			});

			this._fluid($tip, $t);
			this.$container.trigger(this._ns('show'), [$t, $tip]);

			this.clearTransitions($tip);

			$tip.addClass('show');

			this.transition($tip, function () {
				if ($t.data('toggle') === 'click') {
					$tip.focus();
				}
			});

			return this;
		},

		hide: function (el) {

			$(window).off(this._ns('resize'));

			if (!el) return this.hideAll();

			var $trigger = this._findTrigger(el),
				$tip = this.aria($trigger).describedby(),
				me = this;

			if ($tip.hasClass('lock')) { return; }

			this.clearTransitions($tip);

			this.transition($tip, function () {

				$tip.removeClass('reverse left right rtl top bottom');
				$tip.removeAttr('style');

				me._fluid($tip, $trigger, true);
				me.aria($tip).hidden();
				me.$container.trigger(me._ns('hide'), [$trigger, $tip]);
			});

			//kicks off transition event
			$tip.removeClass('show');

			return this;
		},

		hideAll: function () {

			var me = this;
			this.$container.find(this._class('trigger', true)).each(function() {
				if ( $(this).hasClass('lock') ) { return; }
				me.hide(this);
			});
			return this;
		}
	});

	$.fn.mktooltip = function (options) {
		return this.each(function () {

			var $container = $(this);

			$container.data('mk-tooltip',
				$container.data('mk-tooltip') || new $.Mk.Tooltip($container, options));
		});
	};

}(window.jQuery);
