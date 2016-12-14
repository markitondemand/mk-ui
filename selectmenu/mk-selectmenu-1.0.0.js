
!function ($) {

	'use strict';

	$.Mk.create('Selectmenu', {

		// can we select multiple options?
		multiple: false,
		// do we have the ability to reset 
		// the standalone menu?
		resetable: false,
		//bool for syncing flush width between
		//trugger and menu
		smartwidth: false,
		// container property
		$container: null,
		// native select property
		$select: null,
		// menu/list property
		$list: null,

		_define: function() {
			
			this._name = 'mk-selectmenu';

			this._templates = {
				//This is what the access element will look like
				//The access element is the 'trigger' for the menu
				trigger: [
					'<a href="javascript: void(0);">',
						'<span class="value" aria-hidden="true">{{value}}</span>',
						'<span class="icon" aria-hidden="true" />',
					'</a>'
				],
				// This is what an optgroup will look like...
				group: [
					'<li tabindex="-1" >',
						'<span class="mk-selectmenu-label">',
							'<span class="sr-only">Option group heading. Select all options for </span>',
							'<span class="value">{{label}}</span>',
						'</span>',
					'</li>'
				],
				// This is what an option will look like...
				option: [
					'<li data-value="{{value}}" tabindex="-1" >',
						'<span class="mk-selectmenu-label">',
							'<span class="value">',
								'{{name}}',
							'</span>',
						'</span>',
					'</li>'
				],
				//If we have a 'reset' button, this is what it will look like...
				reset: [
					'<div>',
						'<a href="javascript: void(0);" role="button" data-action="reset">Clear All</a>',
						'<span></span>',
					'</div>'
				],
				// alternate text for option labels.
				// these get injected into options later
				alt: ['<span>{{text}}</span>'],
				// default markup for the dropdown list...
				menu: ['<ul tabindex="0" />'],
				// live region for extra screen reader information.
				// important element for telling the user selected values, etc.
				live: ['<div class="sr-only" />'],
				//This is our wrapper for the list, reset, and live markup
				wrapper: ['<div />'],
				//used in _format()
				no_selected: 'No options selected',
				//used in _format()
				single_selected: '{{option}} is currently selected',
				//used in _format()
				multiple_selected: '{{options}} are currently selected',
				//used in _format()
				live_seperator: ' and ',

				reset_label: '({{count}} of {{total}})'
			};
		},

		// Init
		// constructor method
		_init: function($select, options) {

			this.$select = $($select);
			this.$container = this.$select.parent();

			this.multiple = this.$select.attr('multiple') !== undefined;
			this.resetable = this.$select.data('reset') !== undefined;
			this.smartwidth = this.$select.data('smartwidth') !== undefined;

			this._define();
			this._setOptions(options);
			this._build();
			this._bind();
		},

		_setOptions: function(options) {

			options = options || {};

			if (options.multiple === true) {
				this.multiple = true;
			}

			if (options.reset === true) {
				this.resetable = true;
			}

			if (options.smartwidth) {
				this.smartwidth = true;
			}

			for (var t in this._templates) {
				 this._template[t] = options['template_' + t] || this._templates[t];
			}
		},

		// Build
		// Build out the different parts of the UI 
		_build: function() {

			//build and inject the trigger
			this.$trigger = this._buildTrigger();
			this.$trigger.insertAfter(this.$select);

			//build and inject the menu wrapper
			this.$wrapper = this._buildWrapper();
			this.$wrapper.insertAfter(this.$trigger);

			//build and inject the live region
			this.$live = this._buildLiveRegion();
			this.$wrapper.append(this.$live);

			//build and inject menu...
			this.$menu = this._buildMenu();
			this.$wrapper.append(this.$menu);

			this._buildOptions();
			this._activate();

			//connect the different components together
			//with aria tags for accessibility...
			this._ariaConnect();

			if (this.resetable) {

				this.$reset = this._buildReset();
				this.$wrapper.append(this.$reset);

				this._updateReset();
			}
			this._width();
		},

		_width: function() {

			if (!this.smartwidth) {
				 return;
			}

			this.$wrapper.addClass('measure').removeClass('aria-hidden');

			var tw = this.$trigger.outerWidth(),
				mw = this.$menu.outerWidth();

			this.$wrapper.addClass('aria-hidden').removeClass('measure');

			if (tw > mw) {
				//width() does weird calcumation stuff
				this.$menu.css('width', tw);
			} 
			else if (mw > tw) {
				//width() does weird calculation stuff
				this.$trigger.css('width', mw);
			}
		},

		//Bind our events
		//TODO: can we make the body handler global?
		_bind: function() {

			var me = this;

			$(document.body).on(this._ns('click'), function (e) {
				me._clickoff(e);
			});

			this.$trigger.on(this._ns('click'), function (e) {
				me._toggleMenu();
			});

			this.$trigger.on(this._ns('keydown'), function (e) {
				me._keydown(e);
			});

			this.$menu.on(this._ns('click'), this._class('option', true), function (e) {
				me._click(e, this);
			});

			if (this.resetable) {
				this.$reset.find(this._class('reset-trigger', true))
					.on(this._ns('click'), function (e) {
						me._reset(e);
					});
			}
		},

		//Connect the different moving parts to one another
		//This is purely an Accessibility method 
		_ariaConnect: function() {

			//hide native select from screen reader
			this.aria(this.$select).hidden();

			//link trigger to live region via description
			//link trigger to the menu via owner
			this.aria(this.$trigger)
				.describedby(this.$live)
				.owns(this.$menu);

			//label the menu element with the trigger
			this.aria(this.$menu).labelledby(this.$trigger);
		},

		//Build our trigger element.
		//The triger is responsible for show/hide of the dropdown
		_buildTrigger: function() {

			var classes  = this.$select[0].className.replace(/(^|\s)mk-selectmenu(\s|$)/g, ''),
				disabled = this.$select.is(':disabled'),
				label = this._label(), $t;

			$t = this._template('trigger', {value: label});
			$t.addClass(classes);
			$t.addClass(this._class('trigger'));

			this.aria($t).role('combobox')
				.collapsed().disabled(disabled);

			return $t;
		},

		//We wrap the menu in a wrapper element
		//because it also contains the live element and additional
		//reset templating/any future templates we may inject but not list worthy.
		_buildWrapper: function() {

			var $w = this._template('wrapper');
				$w.addClass(this._class('wrapper') + ' aria-hidden');

			return $w;
		},

		//We have a live region hidden from the user but
		//usefuly for accessibility. It's responsible for readling
		//off selected elements in the dropdown list. Also customizable.
		_buildLiveRegion: function () {

			var $l = this._template('live');
				$l.addClass(this._class('live'));

			this.aria($l).assertive();
			return $l;
		},

		//Build out the menu/list element
		_buildMenu: function() {

			var $m = this._template('menu');
				$m.addClass(this._class('menu'));

			this.aria($m).role('listbox').hidden();
			return $m;
		},

		//Build out our options/optgroups
		_buildOptions: function($o) {

			var $options = $o || this.$select.find('option'),
				 me = this;

			if (!$o && this.$select.find('optgroup').length) {
				this.$select.find('optgroup').each(function() {
					me._buildOptionGroup($(this));
				});
				return;
			}

			$options.each(function() {
				me._buildOption($(this));
			});
		},

		//Helper for _buildOptins. Builds individual option elements
		_buildOption: function($o) {

			var alt = $o.data('alt-text') || '',
				disabled = $o.is(':disabled'),
				active = $o.is(':selected'),

				$option = this._template('option', {
					value: $o.val(),
					name: $o.text()
				});

				$option.addClass($o[0].className);

			if (alt) {
				var $alt = this._template('alt', {text: alt});
					$alt.addClass('alt-text');

				$option.append($alt);
			}

			$option.addClass(this._class('option'));
			$option.attr('id', this._uid());

			this.aria($option).role('option')
				.disabled(disabled).selected(active);

			this.$menu.append($option);
		},

		//Build optgroup elements
		_buildOptionGroup: function($o) {

			var label  = $o.attr('label'),
				$group = this._template('group', {
					label: label
				});

			$group.addClass(this._class('option'))
				.addClass(this._class('group'))
				.attr('id', this._uid());

			this.$menu.append($group);
			this._buildOptions($o.find('option'));
		},

		//Build our reset UI
		//This element gets injected in the wrapper
		_buildReset: function() {

			var $r = this._template('reset');
				$r.addClass(this._class('reset'));
				$r.find('[data-action="reset"]').addClass(this._class('reset-trigger'));

			return $r;
		},

		//Label the trigger element.
		//Labeling is based off of if the element is a multiple selector
		//single select or has no values
		_label: function (values) {

			if (this.multiple) {
				return this.$select.data('label') || '[[ error: set data-label ]]';
			}

			values = values || this._values();
			return values[0].text;
		},

		//Get the native sleect values as an array.
		//We work with arrays because of the multiple capability
		_values: function () {

			var $options = this.$select.find('option'),
				 svalues = [].concat(this.$select.val()),
				 values  = [], o;

			for (var i = 0, c = svalues.length; i < c; i++) {

				o = { value: svalues[i], text: '' };
				values.push(o);
				 
				$options.each(function () {
					if (this.value == o.value) {
						o.text = $(this).text();
						return false;
					}
				});
			}
			return values;
		},

		//Determine which element to 'activate' which is basically
		//finding where we start to use arrow keys and where the screen reader
		//starts reading off elements.
		_activate: function() {

			var $li = this.$menu.find(this._class('option', true)),
				$ad = this.aria(this.$trigger).activedescendant(),
				 la = [];

			if (!$ad.length) {
				 $ad = $li.filter('.aria-selected:first');

				if (!$ad.length) {
					 $ad = $li.filter(':first');
				}
			}

			$li.removeClass('activated');
			$ad.addClass('activated');

			$li.filter('.aria-selected').each(function() {
				la.push($(this).find('.value').text());
			});

			this._updateLiveRegion(la);
			this.aria(this.$trigger).activedescendant($ad);
		},

		//Basically reset the activated.
		_deactivate: function() {

			this.$menu.find('.activated')
				.removeClass('activated');

			this.aria(this.$trigger).activedescendant(null);
		},

		//Update the live region with selected element labels (not values)
		//read off to the user. Default is assertive.
		_updateLiveRegion: function(labels) {

			var txt = this._template.no_selected;

			if (labels.length == 1) {
				txt = this._format('single_selected', {
					option: labels[0]
				});
			}
			else {
				txt = this._format('multiple_selected', {
					options: labels.join(this._templates.live_seperator)
				});
			}
			this.$live.text(txt);
		},

		//Update the text of the reset UI.
		//Text is controlled by a template.
		//Default functionality is to show the user the number
		//of elements selected vs. total number of elements possible.
		_updateReset: function () {

			if (!this.resetable) return;

			var $li = this.$menu.find(this._class('option', true)).not(this._class('group', true)),
				$s  = $li.filter('.aria-selected'),
				txt = this._format('reset_label', {
					count: $s.length,
					total: $li.length
				});

			this.$wrapper.find(this._class('reset', true) + ' span')
				.text($s.length ? txt : '');
		},

		//Helper method to update the trigger label.
		_updateLabel: function(value) {

			this.$trigger.find('.value').text(
				this._label(value));
		},

		//toggle between show/hide
		_toggleMenu: function(e) {

			if (e) { e.preventDefault(); }

			if (this.$wrapper.hasClass('aria-hidden')) {
				return this.show();
			}
			this.hide();
		},
		//keydown handler
		_keydown: function(e) {

			switch (e.which) {

				case 38:
				case 40:
					this._keyArrows(e);
					break;

				case 13:
					this._keyEnter(e);
					break;

				case 9:
					this._keyTab(e);
					break;

				case 32:
					this._keySpace(e);
					break;

				case 27:
					this._keyEsc(e);
					break;
			}
		},
		//Toggle through options, optgroups, and reset
		_keyArrows: function (e) {

			e.preventDefault();

			if (this.$menu.hasClass('aria-hidden')) {
				return this.show();
			}

			var me = this,
				f  = false,
				$os = this.$menu.find(this._class('option', true)),
				$c  = this.aria(this.$trigger).activedescendant(),
				$o;

			if (!$c.length) {

				$c = $os.filter('.aria-selected:first');

				if (!$c.length) {

					$c = $os.filter(':first');
					f = true;
				}
			}

			var s  = e.which == 38 ? -1 : 1,
				i  = f ? 0 : $c.index() + s;

			$o = $($os[i]);

			if (this._resetfocused) {

				if (e.which != 38) {
					return;
				}

				$o = $os.filter(':last');
				i = $o.index();
				this._blurreset();
			}

			if ($o.hasClass('aria-disabled')) {
				i += s;
				$o = $($os[i]);
			}

			if (i >= $os.length && this.resetable) {
				return this._focusreset();
			}

			if ((i < 0 || i >= $os.length)) {
				i = $c.index();
				$o = $c;
			}

			$os.removeClass('activated');
			$o.addClass('activated');

			this.aria(this.$trigger).activedescendant($o);

			this._updateLabel([{
				text: $o.find(this._class('label', true) + ' .value').text()
			}]);
		},
		//open menu if closed
		//select option if focused on one
		//trigger reset if focused on it
		//close menu if single select, keep open for multiple
		_keyEnter: function (e) {

			e.preventDefault();

			if (this.$menu.hasClass('aria-hidden')) {
				return this.show();
			}

			var $o = this.$menu.find('.activated');

			if ($o.length) {

				if ($o.hasClass('aria-disabled')) return;

				if (($o.hasClass('aria-selected') && this.multiple) || !$o.hasClass('aria-selected')) {
					 $o.trigger(this._ns('click'));
				}

				//no toggle
				if (this.$menu.hasClass('aria-visible') && !$o.hasClass(this._class('group')) && !this.multiple) {
					$o.removeClass('activated');
					this.hide();
				}
			}
			else if (this._resetfocused) {
				return this.$reset.find(this._class('reset-trigger', true))
					.trigger(this._ns('click'));
			}
			else { this.hide(); }
		},
		//close menu if open,
		//if we're focused on an element, select it automatically
		_keyTab: function (e) {

			if (this.$menu.hasClass('aria-visible')) {

				e.preventDefault();

				var $o = this.$menu.find('.activated');

				if ($o.length && !$o.hasClass('aria-selected')) {

					var event = jQuery.Event(this._ns('click'));
						event.target = $o[0];

					this.$menu.trigger(event);

					if (this.multiple) {
						this.show();
					}
				}
				else {
					this.hide();
				}
			}
		},
		//Open menu on spacebar if hidden,
		//Select an element if space pressed while
		//toggling through menu
		_keySpace: function (e) {

			e.preventDefault();

			if (this.$menu.hasClass('aria-hidden')) {
				this.show();
				return;
			}
			this._keyEnter(e);
		},
		//Shut down the menu if it's open and
		//escape is pressed
		_keyEsc: function(e) {

			e.preventDefault();

			if (this.$menu.hasClass('aria-visible')) {
				this.hide();
			}
		},

		//Clicking/Enter on an element
		_click: function(e, a) {

			e.preventDefault();

			var $el = $(a),
				$options = this.$menu.find(this._class('option', true)),
				 value = $el.attr('data-value'),
				 values = value;

			//disabled selects get no functionality
			if ($el.hasClass('aria-disabled')) {
				return;
			}
			//Selecting an entire group of options
			if ($el.hasClass(this._class('group'))) {

				if (!this.multiple) {
					return;
				}
				this._group($el);
				values = this.$select.val();
			}
			//multi select behavior
			else if (this.multiple) {

				values = this.$select.val();

				if ($el.hasClass('aria-selected')) {
					values.splice(values.indexOf(value), 1);
				}
				else {
					values = (values || []).concat(value);
				}
			}
	
			this.$select.val(values);
			this.aria($options).deselected();

			var values = this._values();

			for (var i = 0, c = values.length; i < c; i++) {
				 this.aria(
				 	$options.filter('[data-value="' + values[i].value + '"]')).selected();
			}

			this.aria(this.$trigger).activedescendant($el);
			this._activate();

			this._updateLabel(values);
			this.$select.trigger(this._ns('change'));

			if (!this.multiple) {
				 this.hide();
			}
			this._updateReset();
		},

		//Click any element that is not the trigger/menu
		//Basically hide the dropdown smartly.
		_clickoff: function(e) {

			var $t = $(e.target);
				$t = $t.is(this.$trigger) ? $t : $t.closest(this._class('trigger', true));

			if ($t.length && $t.is(this.$trigger)) return;

			$t = $(e.target);
			$t = $t.is(this.$menu) ? $t : $t.closest(this._class('menu', true));

			if ($t.length && $t.is(this.$menu)) return;

			this.hide();
		},

		//Reset behavior for clicking the reset link
		_reset: function(e) {

			e.preventDefault();

			this.$select.find('option').each(function () {
				this.selected = false;
			});

			this.update();
			this._updateLabel();
			this._updateReset();
			this._blurreset();
			this.$select.trigger(this._ns('change'));
		},

		//take focus away from the reset link
		//toggle returns back to option focus (see keyArrows)
		_blurreset: function() {

			this._resetfocused = false;
			this.$reset.removeClass('activated');
			this.aria(this.$trigger).activedescendant(null);
		},

		//remove keyboard toggling from options
		//and throw focus on the reset link.
		_focusreset: function() {

			this._resetfocused = true;

			this.$menu.find(this._class('option', true)).removeClass('activated');
			this.$reset.addClass('activated');

			this.aria(this.$trigger).activedescendant(
				this.$reset.find(this._class('reset-trigger', true)));
		},

		//Select and entire group of option elements.
		//This is only used when optgroup elements are present.
		_group: function ($option) {

			var $groups = this.$menu.find(this._class('group', true)),
				 index = 0;

			$groups.each(function (i) {
				if (this === $option[0]) {
					index = i;
					return false;
				}
			});
			
			var $optgroup = $(this.$select.find('optgroup')[index]),
				$options  = $optgroup.find('option');
			
			var selected = 0;

			$options.each(function () {
				if (this.selected) {
					selected++;
				}
			});

			$options.prop('selected', 
				selected === $options.length ? false : true);

			this.update();
		},

		//Show the dropdown
		show: function() {

			if (this.$trigger.hasClass('aria-disabled') 
				&& this.$wrapper.hasClass('aria-hidden')) {
				return;
			}

			this.$wrapper.removeClass('aria-hidden');

			this.aria(this.$trigger).expanded();
			this.aria(this.$menu).visible();
			this._activate();
			
			this.$select.trigger('show.mk-selectmenu');
		},

		//hide the dropdown
		hide: function() {
			var wasVisible = !this.$wrapper.hasClass('aria-hidden');

			this.$wrapper.addClass('aria-hidden');
			this.aria(this.$trigger).collapsed();
			this.aria(this.$menu).hidden();

			if (!this.multiple) {
				 this._updateLabel();
			}
			
			if(wasVisible) {
				this.$select.trigger('hide.mk-selectmenu');
			}
		},

		//Repaint the mkSelectmenu UI.
		//This is useful for if you add/remove option elements
		//or want to alter the select menu in any significant way.
		repaint: function() {

			if (this.$select.is(':disabled')) {
				this.aria(this.$trigger).disabled();
				this.hide();
			}
			else {
				this.aria(this.$trigger).enabled();
			}

			this.$menu.find(this._class('option', true)).remove();

			this._deactivate();
			this._buildOptions();
			this._updateLabel();
			this._updateReset();
			this._activate();
			this._width();
		},

		//Make changes to the native select: disable, enable, select new elements,
		//disable, enable or select new options, etc.
		//and apply change to the custom mkSelectmenu UI.
		update: function() {

			var me = this,
				changed = true,
				values = [].concat(this.$select.val());

			this._deactivate();
			
			if (this.$select.is(':disabled')) {
				this.aria(this.$trigger).disabled();
				this.hide();
				return;
			}
			
			this.aria(this.$trigger).enabled();

			var $options = this.$select.find('option'),
				$items   = this.$menu.find(this._class('option', true));

			for (var i = 0, c = $options.length, $o, $i; i < c; i++) {

				 var $o = $($options[i]),
				 	 $i = $items.filter('[data-value="' + $o.val() + '"]')

				 this.aria($i)
				 	.disabled($o.is(':disabled'))
				 	.selected($o.is(':selected'));
			}
		}
	});

	$.fn.mkselectmenu = function (options) {
		return this.each(function () {
			var $el = $(this);
			$el.data('mk-selectmenu') || $el.data('mk-selectmenu', new $.Mk.Selectmenu($el, options));
		});
	};

}(window.jQuery);
