
!function ($) {

	'use strict';

	$.Mk.create('Tooltip', {

		_spacer: 10,

		_rtl: /\s?rtl\s?/i,
		_rev: /\s?reverse\s?/i,

		_init: function ($container) {

			this.$container = $($container);

			this._define();
			this.bind();
		},

		_define: function() {

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

		_click: function(e) {
			if ($(e.target).data('toggle') == 'click') {
				e.preventDefault();
			}
		},

		_down: function (e) {

			var $t = $(e.target),
				ns = '.' + this._name;

			if ($t.is(ns) 
				|| $t.closest(ns).length) {
				return;
			}

			this.hide();

			if (!$t.is(this._class('trigger', true))) {
				 $t = $t.closest(this._class('trigger', true));
			}

			if ($t.length && $t.data('toggle') == 'click') {
				this.show($t);
				this._trackDialogFocus($t, this._findTooltip($t));
			}
		},

		_over: function (e) {

			var $t = $(e.target);

			if ($t.data('toggle') == 'click') {

				this._findTooltip($t);

				if (e.type == 'focusin') {
					var me = this;
					$t.on(this._ns('keydown'), function(e) {
						me._keypress(e, $t);
					});
				}
				return;
			}
			this.hide();
			this.show($t);
		},

		_out: function (e) {

			var $t = $(e.target);

			if ($t.data('toggle') == 'click') {
				if (e.type == 'focusout') {
					$t.off(this._ns('keydown'));
				}
				return;
			}
			this.hide($t);
		},

		_keypress: function(e, $t) {

			if (e.which == 13 || e.which == 32) {

				e.preventDefault();

				this.hide();
				this.show($t);

				var $tip = this._findTooltip($t);
				this._trackDialogFocus($t, $tip);
			}
		},

		_trackDialogFocus: function($t, $tip) {

			var $killer = $tip.find(this._class('killswitch', true));

			if (!$killer.length) {

				$killer = this._template('killswitch');
				$killer.addClass(this._class('killswitch'));

				this.aria($killer).role('presentation');

				var me = this;

				$killer.on(this._ns('focus'), function() {
					 me.hide();
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

		_findTrigger: function (el) {

			if (typeof el == 'number') {
				return $(this.$container.find(this._class('trigger', true))[parseInt(el, 10)]);
			}
			return $(el);
		},

		_findTooltip: function($t) {

			var $tip = this.aria($t).describedby();

			if (!$tip.length) {

				 if ($t.data('title')) {
				 	 $tip = this._template('tooltip', {text: $t.data('title')});
				 	 $tip.addClass(this._name);
				 }
				 else {

					$tip = $t.find('.' + this._name);

					if (!$tip.length) {
						 $tip = $t.parent().find('.' + this._name);
					}
				}
				this._applyAria($tip, $t);
				this._getContainer().append($tip);
			}
			return $tip;
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

		_applyAriaDialog: function($tip, $trigger) {

			this.aria($tip).labelledby($trigger).role('dialog').noindex();
			this.aria($trigger).haspopup(true);
		},

		_position: function ($tip, $trigger, xy) {

			var display = $tip.data('display') || '',
				rtl = this._rtl.test(display),
				rev = this._rev.test(display),
				win = $(window),

				tg = {
				width:  $trigger.width(),
				height: $trigger.height(),
				offset: $trigger.offset()
			},
				tp = {
				width:   $tip.outerWidth(),
				widthM:  $tip.outerWidth(true),
				height:  $tip.outerHeight(),
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
			$tip.css({left: xy.x, top: xy.y});
		},

		_positionX: function(rtl, tg, tp, xy, win, $tip) {

			if (rtl) {
				//left/right vs. top bottom...
				return this._xRtl(tg, tp, xy, $tip);
			}
			//top/bottom positioning...
			this._xStandard(tg, tp, xy, win, $tip);
		},

		_xRtl: function(tg, tp, xy, $tip) {

			//position to the left of the trigger...
			xy.x = tg.offset.left - tp.widthM - ((tp.widthM - tp.width) / 2);
			$tip.addClass('rtl left');

			//position to the right if no room on the left...
			if (xy.x < this._spacer) {
				xy.x = tg.offset.left + tg.width + ((tp.widthM - tp.width) / 2);
				$tip.removeClass('left').addClass('right');
			}
		},

		_xStandard: function(tg, tp, xy, win, $tip) {

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

		_positionY: function(rtl, rev, tg, tp, xy, win, $tip) {

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

		_yTop: function(tg, tp, xy, $tip) {
			xy.y = tg.offset.top - tp.heightM;
			$tip.removeClass('reverse');
		},

		_yBottom: function(tg, tp, xy, $tip) {
			xy.y = tg.offset.top + tg.height;
			$tip.addClass('reverse');
		},

		_yRtl: function(tg, tp, xy, win, $tip) {

			//try center first...
			xy.y = tg.offset.top + (tg.height / 2) - (tp.heightM / 2);
			$tip.addClass('rtl');

			//try bottom...
			if (xy.y <= this._spacer) {
				xy.y = tg.offset.top - (tp.heightM - tp.height);
				$tip.addClass('top');
			}

			//fallback to top...
			if ((xy.y + tp.heightM) >= (win.height() - this._spacer)) {
				xy.y = tg.offset.top - tp.height + (tp.heightM - tp.height);
				$tip.removeClass('top').addClass('bottom');
			}
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
				this._ns('click'), this._class('trigger', true), function(e) {
					self._click(e);
				})
			.on(
				this._ns('mousedown'), function (e) {
					self._down(e);
				});
		},

		show: function (el, xy) {

			var $t = this._findTrigger(el),
				$tip = this._findTooltip($t);
				
			this.aria($tip).visible();
			this._position($tip, $t, xy);

			if ($t.data('toggle') == 'click') {
				$tip.focus();
			}

			var me = this;
			$(window).one(this._ns('resize'), function() {
				me.hide();
			});
			
			this.$container.trigger(this._ns('show'), [$t, $tip]);
		},

		hide: function(el) {

			$(window).off(this._ns('resize'));

			if (el == undefined) return this.hideAll();

			var $trigger = this._findTrigger(el), 
				$tip = this.aria($trigger).describedby();

			$tip.removeClass('reverse left right rtl top bottom');
			$tip.css({left: 'auto', top: 'auto'});

			this.aria($tip).hidden();
			this.$container.trigger(this._ns('hide'), [$trigger, $tip]);

			return this;
		},

		hideAll: function () {

			var me = this;
			this._getContainer().find('.' + this._name).each(function() {

				$(this).removeClass('reverse left right rtl top bottom')
					.css({left: 'auto', top: 'auto'});

				me.aria(this).hidden();
			});
			//TODO: add container trigger
			return this;
		}
	});

	$.fn.mktooltip = function () {
		return this.each(function () {

			var $container = $(this);

			$container.data('mk-tooltip',
				$container.data('mk-tooltip') || new $.Mk.Tooltip($container));
		});
	};

}(window.jQuery);