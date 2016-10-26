/// mk-datepicker ///
/// v1.1.0       ///

!function($) {

	'use strict';

	$.Mk.create('Datepicker', {

		_strsplitter: /[\,\s|\/|\s|\.|\-]/,
		_datesplitter: /(\w+)(\,\s|\/|\s|\-|\.|$)/g,
		_nojq: /\//,

		_defaultFormat: 'mm/dd/yyyy',
		_defaultHeaderFormat: 'd',

		_months: [
			'january', 'february', 'march', 'april', 'may', 'june', 'july',
			'august', 'september', 'october', 'november', 'december'
		],

		_monthsshort: [
			'jan', 'feb', 'mar', 'apr', 'may', 'jun',
			'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
		],

		_days: [
			'sunday', 'monday', 'tuesday',
			'wednesday', 'thursday', 'friday', 'saturday'
		],

		_keys: {
			tab: 9, enter: 13, esc: 27, space: 32,
			pageup: 33, pagedown: 34, end: 35, home: 36,
			left: 37, up: 38, right: 39, down: 40
		},

		$target: null,

		_define: function() {

			this._name = 'mk-datepicker';

			this._templates = {

				container: ['<div />'],

				calendar: ['<table />'],

				calendar_head: ['<thead><tr>{{headers}}</tr></thead>'],

				calendar_body: ['<tbody />'],

				label: ['<caption>{{text}}</caption>'],

				weekday: [
					'<th class="{{class}}">',
						'<abbr aria-label={{ariaLabel}} title="{{title}}">{{day}}</abbr>',
					'</th>'
				],

				row: ['<tr>'],

				day: ['<td class="{{class}}">{{day}}</td>'],

				button_container: ['<div />'],

				button: ['<button tabindex="0"></button>'],

				button_labels_container: ['<div />'],

				button_labels: ['<p class="sr-only">{{text}}</p>'],

				prev_button_label: 'Go to previous month',
				next_button_label: 'Go to next month',
				prev_button_year_label: 'Go to previous year',
				next_button_year_label: 'Go to next year',
				table_label: '{{month}} {{year}}'
			};
		},

		dateToString: function(date, format) {

			var me = this;

			format = format || this.options.format;

			return format.replace(this._datesplitter, function(s, f, i) {

				switch(f) {
					case 'm':
						return (date.getMonth() + 1) + i;
					case 'mm':
						return (date.getMonth() + 1 < 10 && '0' || '') + (date.getMonth() + 1) + i;
					case 'mmm':
						return me._monthsshort[date.getMonth()] + i;
					case 'mmmm':
						return me._months[date.getMonth()] + i;
					case 'd':
						return date.getDate() + i;
					case 'dd':
						return (date.getDate() < 10 && '0' || '') + date.getDate() + i;
					case 'dddd':
						return me._days[date.getDay()] + i;
					case 'yyyy':
						return date.getFullYear() + i;
					case 'yy':
						return date.getFullYear().toString().slice(2) + i;
				}
			});
		},

		stringToDate: function(str) {

			var me = this,
				format = this.options.format.split(this._strsplitter),
				parts  = str.split(this._strsplitter),
				date   = new Date();

			for(var i = 0, l = parts.length; i < l; i++) {
				switch(format[i]) {
					case 'm':
					case 'mm':
						date.setMonth(parseInt(parts[i], 10) - 1); break;
					case 'mmm':
						date.setMonth(
							this._monthsshort.indexOf(parts[i].toLowerCase())); break;
					case 'mmmm':
						date.setMonth(
							this._months.indexOf(parts[i].toLowerCase())); break;
					case 'd':
					case 'dd':
						date.setDate(parseInt(parts[i], 10)); break;
					case 'yy':
						date.setFullYear(
							me._getYearFrom2Digits(parts[i])); break;
					case 'yyyy':
						date.setFullYear(parseInt(parts[i], 10)); break;
				}
			}
			return date;
		},

		_getYearFrom2Digits: function(last2) {

			var today  = new Date(),
				year   = today.getFullYear(),
				past   = new Date(),
				future = new Date();

			past.setFullYear(
				parseInt((year - 100).toString().slice(0, 2) + last2, 10));

			future.setFullYear(
				parseInt((year).toString().slice(0, 2) + last2, 10));

			var pastGap = year - past.getFullYear(),
				futureGap = future.getFullYear() - year;

			if (pastGap > futureGap) {
				return future.getFullYear();
			}
			return past.getFullYear();
		},

		_buildOptions: function(options) {

			var  o = this._copy(options || {}),
				$t = this.$target;

			if (!this.options) {
				 this.options = o;
			}

			//disable hide() show()
			o.inline = o.inline === true || $t.data('popup') === false;

			//date format
			o.format = o.format || $t.data('format') || this._defaultFormat;

			//weekday format
			o.headerFormat = o.headerFormat || $t.data('header-format') || this._defaultHeaderFormat;

			//initial date
			o.initial = o.initial || $t.data('initial') || $t.val() || null;
			o.initial = o.initial instanceof Date
				&& o.initial || o.initial
				&& this.stringToDate(o.initial) || new Date();

			o.max = o.max || $t.data('max') || null;
			o.min = o.min || $t.data('min') || null;

			var $max = this._nojq.test(o.max) ? null : $(o.max),
				$min = this._nojq.test(o.min) ? null : $(o.min);

			// active dates
			o.activeDates = o.activeDates || [];

			//jquery link
			if ($max && $max.length) {
				o.$max = $max;
				o.max  = null;
			}
			//string date, else Date object or unlimited
			if (typeof o.max == 'string') {
				o.max = this.stringToDate(o.max);
			}

			//jquery link
			if ($min && $min.length) {
				o.$min = $min;
				o.min  = null;
			}
			//string date, else Date object or unlimited
			if (typeof o.min == 'string') {
				o.min = this.stringToDate(o.min);
			}

			if (o.min && o.initial < o.min) {
				o.initial = new Date(o.min.getFullYear(), o.min.getMonth(), o.min.getDate());
			}

			if (o.max && o.initial > o.max) {
				o.initial = new Date(o.max.getFullYear(), o.max.getMonth(), o.max.getDate());
			}

			//override tempalte of options has any
			for(var t in this._templates) {
				this._templates[t] = options['template_' + t] || this._templates[t];
			}

			var i = o.initial,
				d = this.date = new Date(i.getFullYear(), i.getMonth(), i.getDate());

			this.year = d.getFullYear();
			this.month = d.getMonth();
			this.day = d.getDate();

			this.options = o;
		},

		_init: function($target, options) {

			this.$target = $($target);
			this.$target.attr('autocomplete', 'off');

			this.selected = null;

			this._buildOptions(options);


			this._define();
			this._build();
			this._bind();
		},

		_buildContainer: function() {

			var $c = this._template('container');
				$c.addClass(this._name);

			if (this.options.inline) {
				$c.addClass('inline');
				this.$target.addClass('inline');
			}
			else {
				this.aria($c).hidden();
			}
			return $c;
		},

		_buildControls: function() {

			var $c = this._template('button_container');
				$c.addClass(this._class('controls'));

			$c.append(
				this._buildControl(this._class('prev-y')),
				this._buildControl(this._class('prev-m')),
				this._buildControl(this._class('next-m')),
				this._buildControl(this._class('next-y')));

			return $c;
		},

		_buildControl: function(cls) {

			var $c = this._template('button');
				$c.addClass(this._class('control'))
					.addClass(cls);

			return $c;
		},

		_buildDisplay: function() {

			var $d = this._template('label', {text: this._label()});
				$d.addClass(this._class('label'));

			this.aria($d).role('heading').assertive();

			return $d;
		},

		_buildCalendar: function() {

			var $c = this._template('calendar'),
				$head = this._template('calendar_head', {headers: this._buildCalendarHeaders()}),
				$body = this._buildCalendarBody($c, this.day, this.month, this.year),
				$display = this._buildDisplay();

			$head.addClass(this._class('calendar-header'));
			$body.addClass(this._class('calendar-body'));

			$c.addClass(this._class('calendar'));
			$c.append($display, $head, $body);

			this._checkRange();

			this.aria($c).index(0).role('grid').labelledby(
				$c.find(this._class('label', true)));

			return $c;
		},

		_getHeaderLabel: function(day) {

			var format = this.options.headerFormat;

			switch(format) {
				case 'd': return day.substring(0, 1);
				case 'dd': return day.substring(0, 3);
				default: return day;
			}
		},

		_buildCalendarHeaders: function() {

			for(var i = 0, c = this._days.length, h = []; i < c; i++) {
				h.push(this._format('weekday', {
					'title': this._days[i],
					'day':  this._getHeaderLabel(this._days[i]),
					'class': this._class('header'),
					'ariaLabel': this._days[i]
				}));
			}
			return h.join('');
		},

		_buildCalendarBody: function($calendar, activeDay, month, year) {

			var min = this._getLimit(this.options.min, this.options.$min),
				max = this._getLimit(this.options.max, this.options.$max),
				now = new Date(year, month, activeDay);

			var days = this._daysInMonth(month, year),
				pastdays = this._daysInLastMonth(month, year),
				startday = this._startDayInMonth(month, year),

				weekday = 0,
				date    = 1,
				count   = 1,

			$c = this._template('calendar_body'),
			$row = this._buildCalendarRow(),
			$day;

			$c.append($row);

			//Past Month
			pastdays -= startday - 1;
			now.setFullYear(month == 0 ? year - 1 : year);
			now.setMonth(month == 0 ? 11 : month - 1);

			for (; weekday < startday; weekday++) {
				now.setDate(pastdays);
				$day = this._buildCalendarDay(now, pastdays, weekday, false, true, false, (min && now < min) || (max && now > max));
				$row.append($day);
				pastdays++;
			}

			if (activeDay > days) activeDay = days;

			//Current Month
			now.setDate(activeDay);
			now.setMonth(month);
			now.setFullYear(year);

			if (max && now > max) {
				activeDay = max.getDate();
			}

			for (date = 1; date <= days; date++) {

				now.setDate(date);

				$day = this._buildCalendarDay(
					now, date, weekday, this._isToday(date, month, year), false, false, (min && now < min) || (max && now > max));

				$row.append($day);

				if (date === activeDay && min && now < min) {
					activeDay++;
				}

				if (date === activeDay) {
					this.aria($calendar).activedescendant($day);
					this.aria($day).selected();
				}

				if (weekday == 6 && date < days) {

					$row = this._buildCalendarRow();
					$c.append($row);

					count++;
					weekday = 0;
				}
				else {
					weekday++;
				}
			}

			//Next Month
			now.setMonth(month == 11 ? 1 : month + 1);
			now.setFullYear(month == 11 ? year + 1 : year);

			for(var i = 1; weekday <= 6; weekday++) {
				now.setDate(i);
				$day = this._buildCalendarDay(now, i, weekday, false, false, true, (min && now < min) || (max && now > max));
				$row.append($day);
				i += 1;
			}
			$calendar.append($c);
			return $c;
		},

		_isToday: function(date, month, year) {

			var d = new Date();

			return d.getFullYear() === year
				&& d.getMonth() === month
				&& d.getDate() === date;
		},

		_daysInLastMonth: function(month, year) {

			month--;

			if (month < 0) {
				month = 11;
				year--;
			}
			return this._daysInMonth(month, year);
		},

		_buildCalendarRow: function() {

			var $row = this._template('row'), $day;
				$row.addClass(this._class('row'));

			return $row;
		},

		_buildCalendarDay: function(jsdate, date, day, isToday, previousMonth, nextMonth, disabled) {

			var $day = this._template('day', {'day': date});
			var active = this.options.activeDates.filter(function (date) { return +date == +jsdate; }).length; 

			$day.addClass(this._class('cell'));

			if (isToday) {
				$day.addClass('today');
			}
			if (previousMonth) {
				$day.addClass('previous');
			}
			if (nextMonth) {
				$day.addClass('next');
			}
			if (active) {
				$day.addClass('active');	
			}
			if (disabled) {
				this.aria($day).disabled();
			}

			this.aria($day).label(this.dateToString(jsdate, 'dddd mmmm dd, yyyy'));

			$day.attr({
				'id': this._uid(),
				'data-date': date,
				'data-day': this._days[day].toLowerCase()});

			this.aria($day).role('gridcell').deselected();
			return $day;
		},

		_buildLabels: function() {

			var $c = this._template('button_labels_container');
				$c.addClass(this._class('labels'));

			$c.append(
				this._buildLabel(this._class('prev-y'), 'prev_button_year_label'),
				this._buildLabel(this._class('prev-m'), 'prev_button_label'),
				this._buildLabel(this._class('next-m'), 'next_button_label'),
				this._buildLabel(this._class('next-y'), 'next_button_year_label'));

			return $c;
		},

		_buildLabel: function(cls, template) {

			var $label = this._template('button_labels', {text: this._templates[template]});
			this.aria(this.$controls.find('.' + cls)).labelledby($label);
			return $label;
		},

		_build: function() {

			this.$container = this._buildContainer();
			this.$container.insertAfter(this.$target);

			this.$controls = this._buildControls();
			this.$calendar = this._buildCalendar();

			this.$calendar.appendTo(this.$container);
			this.$controls.appendTo(this.$container);

			this.$labels = this._buildLabels();
			this.$labels.appendTo(this.$container);
		},

		_daysInMonth: function (month, year) {
			return 32 - new Date(year, month, 32).getDate();
		},

		_startDayInMonth: function (month, year) {
			return new Date(year, month, 1).getDay();
		},

		_label: function() {
			return this._format(this._templates.table_label, {
				month: this._months[this.month],
				year: this.year
			});
		},

		_bind: function() {

			var me = this;

			if (!this.options.inline) {
				$(document.body).on(this._ns('mousedown'), function(e) {
					me._clickoff(e);
				});
			}

			this.$target
			.on(this._ns('click'), function (e) {
				me.show();
			})
			.on(this._ns('keydown'), function (e) {
				me._keydownTarget(e);
			})
			.on(this._ns('focus'), function (e) {
				me._focusReadonly();
			});

			this.$controls
			.on(this._ns('click'), this._class('control', true), function(e) {
					e.preventDefault();
					return me._clickControl(e, $(e.target));
			})
			.on(this._ns('keydown'), this._class('control', true), function(e) {
					return me._keyControl(e, $(e.target));
			});

			this.$calendar
			.on(this._ns('click'), this._class('cell', true), function (e) {
				return me._clickCalendar(e);
			})
			.on(this._ns('keydown'), function(e) {
				return me._keydownCalendar(e);
			})
			.on(this._ns('keypress'), function(e) {
				return me._keypressCalendar(e);
			});
		},

		_clickoff: function(e) {

			var $t = $(e.target);

			if ($t.is(this.$target)
				|| $t.is(this.$container)
				|| $t.closest('.' + this._name).is(this.$container)) {
				return;
			}
			this.hide();
		},

		_focusReadonly: function(e) {

			if (this.$target.prop('readonly')) {

				if (this._focusFromCalendar) {
					this._focusFromCalendar = false;
					return;
				}
				this.show();
			}
		},

		_keypressCalendar: function (e) {

			if (e.altKey) return true;

			switch (e.keyCode) {
				//case this._keys.tab:
				case this._keys.enter:
				case this._keys.space:
				case this._keys.esc:
				case this._keys.left:
				case this._keys.right:
				case this._keys.up:
				case this._keys.down:
				case this._keys.pageup:
				case this._keys.pagedown:
				case this._keys.home:
				case this._keys.end: {
					e.stopPropagation();
					return false;
				}
			}
			return true;
		},

		_keydownTarget: function(e) {

			if (e.which === this._keys.space
				|| e.which === this._keys.down
				|| (e.which === this._keys.enter && ! e.target.value)) {

				e.preventDefault();
				this.show();
			}

			if (e.which == this._keys.esc) {
				e.preventDefault();
				this.hide();
			}
		},

		_keydownCalendar: function (e) {

			var $rows = this.$calendar.find(this._class('row', true)),
				$curDay = this.aria(this.$calendar).activedescendant(),
				$days = this.$calendar.find(this._class('cell', true)).not('.previous, .next'),
				$curRow = $curDay.parent();

			if (e.altKey) return true;

			switch (e.which) {
				case this._keys.enter:
				case this._keys.space:
					return this._keydownEnter(e, $curDay);
				case this._keys.esc:
					return this._keydownEsc(e);
				case this._keys.left:
					return this._keydownLeft(e, $days, $curDay);
				case this._keys.right:
					return this._keydownRight(e, $days, $curDay);
				case this._keys.up:
					return this._keydownUp(e, $days, $curDay);
				case this._keys.down:
					return this._keydownDown(e, $days, $curDay);
				case this._keys.pageup:
					return this._keydownPageup(e);
				case this._keys.pagedown:
					return this._keydownPagedown(e);
				case this._keys.home:
					return this._keydownHome(e, $curDay);
				case this._keys.end:
					return this._keydownEnd(e, $curDay);
			}
			return true;
		},

		_keydownEnd: function(e, $curDay) {

			if (e.ctrlKey || e.shiftKey) return true;

			var  days = this._daysInMonth(this.month, this.year),
				$days = this.$calendar.find(this._class('cell', true)),
				$day = $days.filter('[data-date="' + days + '"]');

			this.aria($days.filter('.aria-selected')).deselected();

			this.aria($day).selected();
			this.aria(this.$calendar).activedescendant($day);

			e.stopPropagation();
			return false;
		},

		_keydownHome: function(e, $curDay) {

			if (e.ctrlKey || e.shiftKey) return true;

			var $days = this.$calendar.find(this._class('cell', true)),
				$day = $days.filter('[data-date="1"]');

			this.aria($days.filter('.aria-selected')).deselected();

			this.aria($day).selected();
			this.aria(this.$calendar).activedescendant($day);

			e.stopPropagation();
			return false;
		},

		_keydownPagedown: function(e) {

			if (e.shiftKey) return true;

			if (e.ctrlKey) {
				this._showNextYear();
			}
			else {
				this._showNextMonth();
			}
			e.stopPropagation();
			return false;
		},

		_keydownPageup: function(e) {

			if (e.shiftKey) return true;

			if (e.ctrlKey) {
				this._showPrevYear();
			}
			else {
				this._showPrevMonth();
			}
			e.stopPropagation();
			return false;
		},

		_keydownDown: function(e, $days, $cur) {

			if (e.ctrlKey || e.shiftKey) return true;

			var index = $days.index($cur) + 7;

			if (index < $days.length) {
				this._keydownFocusDescendant($days, $cur, index);
			} else if (!this._nextMonthDisabled) {
				this._showNextMonth(8 - ($days.length - $days.index($cur)));
			}
			e.stopPropagation();
			return false;
		},

		_keydownUp: function(e, $days, $cur) {

			if (e.ctrlKey || e.shiftKey) return true;

			var index = $days.index($cur) - 7;

			if (index >= 0) {
				this._keydownFocusDescendant($days, $cur, index);
			} else if (!this._prevMonthDisabled) {
				this._showPrevMonth(6 - $days.index($cur));
			}
			e.stopPropagation();
			return false;
		},

		_keydownRight: function(e, $days, $cur) {

			if (e.ctrlKey || e.shiftKey) return true;

			var index = $days.index($cur) + 1;

			if (index < $days.length) {
				this._keydownFocusDescendant($days, $cur, index);
			} else if (!this._nextMonthDisabled) {
				this._showNextMonth(1);
			}

			e.stopPropagation();
			return false;
		},

		_keydownLeft: function(e, $days, $cur) {

			if (e.ctrlKey || e.shiftKey) return true;

			var index = $days.index($cur) - 1;

			if (index >= 0) {
				this._keydownFocusDescendant($days, $cur, index);
			} else if (!this._prevMonthDisabled) {
				this._showPrevMonth(0);
			}
			e.stopPropagation();
			return false;
		},

		_keydownFocusDescendant: function($days, $cur, date) {

			var $day = $days.eq(date),
				 d = parseInt($day.data('date'), 10),
				 month = this.month;

			if ($day.hasClass('aria-disabled')) return false;

			this.aria($cur).deselected();
			this.aria($day).selected();
			this.aria(this.$calendar).activedescendant($day);

			if ($day.hasClass('previous')) {
				month -= 1;
			}
			if ($day.hasClass('next')) {
				month += 1;
			}
			return this._setDate(d, month, this.year);
		},

		_keydownEsc: function(e) {

			this.hide();
			e.stopPropagation();
			return false;
		},

		_keydownEnter: function(e, $curDay) {

			if (e.ctrlKey) return true;

			var d = this.date,
				date = this.dateToString(d);

			this.selected = new Date(d.getFullYear(), d.getMonth(), d.getDate());

			this.$target.val(date);
			this.$target.trigger(this._ns('change'), [date]);

			this._focusFromCalendar = true;

			this.updateLink();
			this.hide(true);

			return false;
		},

		_clickCalendar: function(e) {

			e.preventDefault();

			var $day = $(e.target),
				$cur = this.aria(this.$calendar).activedescendant(),
				 day = parseInt($day.data('date'), 10),
				 d = this.date;

			if ($day.hasClass('aria-disabled')) {
				return;
			}

			if ($day.hasClass('next')) {
				this._showNextMonth(day);
			} else if ($day.hasClass('previous')) {
				this._showPrevMonth(day);
			}

			this.aria($cur).deselected();
			this.aria($day).selected();
			this.aria(this.$calendar).activedescendant($day);

			this.date.setDate(day);
			this.day = day;

			this.selected = new Date(d.getFullYear(), d.getMonth(), d.getDate());

			this.$target.val(this.dateToString(this.date));
			this.$target.trigger(this._ns('change'), [this.date]);

			this._focusFromCalendar = true;

			this.updateLink();
			this.hide();
		},

		_clickControl: function(e, $btn) {

			return $btn.hasClass(this._class('prev-y')) && this._show('prev', true)
				|| $btn.hasClass(this._class('prev-m')) && this._show('prev')
				|| $btn.hasClass(this._class('next-m')) && this._show('next')
				|| $btn.hasClass(this._class('next-y')) && this._show('next', true);
		},

		_keyControl: function(e, $btn) {
			return $btn.hasClass(this._class('prev-y')) && this._handleKeyControl(e, 'prev', true)
				|| $btn.hasClass(this._class('prev-m')) && this._handleKeyControl(e, 'prev')
				|| $btn.hasClass(this._class('next-m')) && this._handleKeyControl(e, 'next')
				|| $btn.hasClass(this._class('next-y')) && this._handleKeyControl(e, 'next', true);
		},

		_show: function(dir, isyear) {

			if (isyear) {
				if (dir === 'prev') {
					return this._prevYearDisabled ? false : this._showPrevYear();
				}
				return this._nextYearDisabled ? false : this._showNextYear();
			}

			if (dir === 'prev') {
				return this._prevMonthDisabled ? false : this._showPrevMonth();
			}
			return this._nextMonthDisabled ? false : this._showNextMonth();
		},

		_handleKeyControl: function (e, dir, isyear) {

	 		if (e.altKey) return true;

	 		//if (e.which === this._keys.tab && dir === 'next' && isyear) {
	 			//this.$calendar.focus();
	 			//return false;
	 		//}

	 		if (e.which === this._keys.enter || e.which === this._keys.space) {

	 			if (e.shiftKey || $(e.target).hasClass('aria-disabled')) return true;

	 			this._show(dir, e.ctrlKey || isyear);
	 			return false;
	 		}

	 		if (e.which === this._keys.esc) {
	 			this.hide();
	 		}
	 		return true;
		},

		_showPrevMonth: function (offset) {

			if (this.month == 0) {
				this.month = 11;
				this.year--;
			}
			else {
				this.month--;
			}

			this.date.setMonth(this.month);
			this.date.setFullYear(this.year);

			if (offset != null) {
				return this._refresh(
					this._daysInMonth(this.month, this.year) - offset);
			}
			return this._refresh();
		},

		_showNextMonth: function (date) {

			if (this.month == 11) {
				this.month = 0;
				this.year++;
			} else {
				this.month++;
			}

			this.date.setMonth(this.month);
			this.date.setFullYear(this.year);

			return this._refresh(date);
		},

		_showPrevYear: function () {

			this.year--;
			this.date.setFullYear(this.year);
			return this._refresh();
		},

		_showNextYear: function () {

			this.year++;
			this.date.setFullYear(this.year);
			return this._refresh();
		},

		_refresh: function(day) {
			this.refresh(day);
			return false;
		},

		_getLimit: function(date, $link) {

			if (!date && $link) {

				var picker = $link.data(this._name) || { date: new Date(), selected: null };

				if (!picker.selected || (picker.date.getDate() === this.date.getDate()
					&& picker.date.getMonth() === this.date.getMonth()
					&& picker.date.getFullYear() === this.date.getFullYear())) {
					return null;
				}
				return picker.date;
			}
			return date || null;
		},

		_checkRange: function() {

			var $c = this.$controls,
				min = this._getLimit(this.options.min, this.options.$min),
				max = this._getLimit(this.options.max, this.options.$max);

			if (min) {

				var minyear = min.getFullYear(),
					minmonth = min.getMonth();

				if (minyear >= this.year) {

					this.date.setFullYear(minyear);
					this.year = minyear;

					this._prevYearDisabled = true;
					this.aria($c.find(this._class('prev-y', true))).disabled();
				}
				else {
					this._prevYearDisabled = false;
					this.aria($c.find(this._class('prev-y', true))).enabled();
				}

				if (minyear >= this.year && minmonth >= this.month) {

					this.date.setMonth(minmonth);
					this.month = minmonth;

					this._prevMonthDisabled = true;
					this.aria($c.find(this._class('prev-m', true))).disabled();
				}
				else {
					this._prevMonthDisabled = false;
					this.aria($c.find(this._class('prev-m', true))).enabled();
				}
			}

			if (max) {

				var maxyear = max.getFullYear(),
					maxmonth = max.getMonth();

				if (maxyear <= this.year) {

					this.date.setFullYear(maxyear);
					this.year = maxyear;

					this._nextYearDisabled = true;
					this.aria($c.find(this._class('next-y', true))).disabled();
				}
				else {
					this._nextYearDisabled = false;
					this.aria($c.find(this._class('next-y', true))).enabled();
				}

				if (maxyear <= this.year && maxmonth <= this.month) {

					this.date.setMonth(maxmonth);
					this.month = maxmonth;

					this._nextMonthDisabled = true;
					this.aria($c.find(this._class('next-m', true))).disabled();
				}
				else {
					this._nextMonthDisabled = false;
					this.aria($c.find(this._class('next-m', true))).enabled();
				}
			}
		},

		_setDate: function(date, month, year) {

			if (month < 0) {
				month = 11;
				year--;
			}
			else if (month > 11) {
				month = 0;
				year++;
			}

			this.date.setDate(date);
			this.date.setMonth(month);
			this.date.setFullYear(year);

			this.day = this.date.getDate();
			this.month = this.date.getMonth();
			this.year = this.date.getFullYear();
		},

		updateLink: function() {

			var d, s = this.selected;

			if (this.options.$min) {
				d = this.options.$min.data(this._name);
				d.options.max = new Date(s.getFullYear(), s.getMonth(), s.getDate());

				if (d.date > s) {
					d._setDate(s.getDate(), s.getMonth(), s.getFullYear());
				}
				d.refresh();
			}

			if (this.options.$max) {
				d = this.options.$max.data(this._name);
				d.options.min = new Date(s.getFullYear(), s.getMonth(), s.getDate());

				if (d.date < s) {
					d._setDate(s.getDate(), s.getMonth(), s.getFullYear());
				}
				d.refresh();
			}
		},

		refresh: function(day, month, year) {

			this.$calendar.find(this._class('calendar-body', true)).remove();

			this.day = day || this.day;
			this.month = month || this.month;
			this.year = year || this.year;
			var $body = this._buildCalendarBody(this.$calendar, day || this.day, month || this.month, year || this.year);
				$body.addClass(this._class('calendar-body'));

			this._checkRange();
			this.$calendar.find(this._class('label', true)).text(this._label());
		},

		show: function() {

			if (!this.options.inline) {
				this.aria(this.$container).visible();
			}

			if (this.$target.prop('readonly')) {
				this.$calendar.focus();
			}
			this.$target.trigger(this._ns('show'));
		},

		hide: function(returnFocus) {

			if (!this.options.inline) {
				 this.aria(this.$container).hidden();
			}

			if (returnFocus === true) {
				this.$target.focus();
			}
			this.$target.trigger(this._ns('hide'));
		},

		updateOptions: function(o) {
			this._buildOptions(o);
			this.refresh();
		}
	});

	$.fn.mkdatepicker = function (options) {

		this.each(function () {

			var $el = $(this),
				instance = $el.data('mk-datepicker') || null;

			if (!instance) {
				 instance = new $.Mk.Datepicker($el, options);
				 $el.data('mk-datepicker', instance);
				 return;
			}
			instance.updateOptions(options);
		});
	};

}(window.jQuery);
