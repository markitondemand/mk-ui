/*
	<depedency:Core>
		<src>dist/js/core.js</src>
		<docs>../</docs>
	</depedency:Core>
	<file:js>
		<src>dist/js/datepicker.js</src>
	</file:js>
	<file:css>
		<src>dist/css/datepicker.css</src>
	</file:css>
	<file:less>
		<src>dist/less/datepicker.less</src>
	</file:less>
	<file:scss>
		<src>dist/scss/datepicker.scss</src>
	</file:scss>
*/
(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(['mk'], function (mk) {
			return factory(root, mk);
		});
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory(root, require('mk'));
	}
	else {
		return factory(root, root.Mk);
	}

})(typeof window !== 'undefined' && window || this, function (root, mk) {

	mk.create('Datepicker', {

		name: 'mk-dp',

		index: -1,

		xSeperate: /\/|-|,\s|\s/,

		xSearch: /(^|\w+)(\/|-|,\s|\s)/g,

		/*
			<property:formatmap>
				<desc>Keeps friendly names for months and days of the week.</desc>
			</property:formatmap>
		*/

		formatmap: {
			months: [
				'january', 'february', 'march', 'april', 'may', 'june', 'july',
				'august', 'september', 'october', 'november', 'december'
			],
			days: [
				'sunday', 'monday', 'tuesday',
				'wednesday', 'thursday', 'friday', 'saturday'
			]
		},

		formats: {
			native: 'yyyy-mm-dd',
			date: 'mm/dd/yyyy',
			days: 'd',
			month: 'mmmm',
			year: 'yyyy',
			nextMo: 'Go to next month',
			nextYr: 'Go to next year',
			prevMo: 'Go to previous month',
			prevYr: 'Go to previous year',
			caption: '{{month}} {{year}}',
			label: '{{month}} {{day}} {{year}}'
		},

		templates: {
			shadow:
				'<div class="{{$key}}-shadow">\
					{{template:input}}\
					{{template:access}}\
					{{template:calendar}}\
				</div>',

			calendar:
				'<div class="{{$key}}-calendar">\
					{{template:controls}}\
					{{template:table}}\
				</div>',

			controls:
				'<div class="{{$key}}-controls">\
					<button class="{{$key}}-control prev-yr" aria-label="Go to previous year"></button>\
					<button class="{{$key}}-control prev-mo" aria-label="Go to previous month"></button>\
					<button class="{{$key}}-control next-mo" aria-label="Go to next month"></button>\
					<button class="{{$key}}-control next-yr" aria-label="Go to next year"></button>\
				</div>',

			table:
				'<table class="{{$key}}-table">\
					<caption class="{{$key}}-heading" aria-atomic="true" aria-live="assertive">{{title}}</caption>\
					<thead class="{{$key}}-head">\
						<tr>\
						{{loop:days}}\
							<th aria-label="{{day}}">{{label}}</th>\
						{{/loop:days}}\
						</tr>\
					</thead>\
					{{template:body}}\
				</table>',

			body:
				'<tbody class="{{$key}}-body" tabindex="0">\
					{{loop:weeks}}\
						<tr>\
							{{loop:days}}\
								{{template:day}}\
							{{/loop:days}}\
						</tr>\
					{{/loop:weeks}}\
				</tbody>',

			day:
				'<td data-value="{{value}}" class="\
					{{day}}\
					{{if:today}} today{{/if:today}}\
					{{if:active}} active{{/if:active}}\
					{{if:weekend}} weekend{{/if:weekend}}\
					{{if:inactive}} inactive{{/if:inactive}}\
					{{if:disabled}} disabled{{/if:disabled}}\
					{{if:between}} between{{/if:between}}\
					" aria-label="label">\
					<span>{{value}}</span>\
				</td>',

			input: '<input class="{{$key}}-input" type="text" value="{{date}}" />',
			access: '<button class="{{$key}}-access">Open</button>'
		},

		/*
			<property:rootinput>
				<desc>The input element you provided inside the root datepicker node.</desc>
			</property:rootinput>
		*/

		get rootinput () {
			return this.node('');
		},

		/*
			<property:input>
				<desc>Our shadow input created by datepicker. This is the unput the user interacts with.</desc>
			</property:input>
		*/

		get input () {
			return this.node('input', this.shadow);
		},

		/*
			<property:accessbtn>
				<desc>The button used to access (open/close) the datepicker UI.</desc>
			</property:accessbtn>
		*/

		get accessbtn () {
			return this.node('access', this.shadow);
		},

		get calendar () {
			return this.node('calendar', this.shadow);
		},

		get active () {

			var body = this.node('body', this.calendar),
				active = body.find('.active');

			if (!active.length) {
				 active = body.find('[data-value="' + this.date.getDate() + '"]');
			}

			if (!active.length) {
				 active = body.find('.today');
			}

			if (!active.length) {
				 active = this.$(body.find('td')[0]);
			}

			return active;
		},

		configure: function (o) {

			o = o || {};

			var input = this.rootinput;

			o.fdate = input.val();
			o.date  = o.fdate && this.stringToDate(o.fdate) || new Date();

			o.fmin = input.attr('min');
			o.min  = o.fmin && this.stringToDate(o.fmin) || null;

			o.fmax = input.attr('max');
			o.max  = o.fmax && this.stringToDate(o.fmax) || null;

			this.date = o.date;

			this.param('format', 'string', o, this.formats.date, input)
				.param('rollover', 'boolean', o, true, input);

			this.super(o);
		},

		data: function () {

			var c = this.config,
				f = c.formats,
				l = f.days.length,
				r = {};

			return {
				date: c.fdate ? this.dateToString(this.date, c.format) : c.format,
				weeks: this.buildCalendar(this.date),
				title: this.format('caption', {
					month: this.formatValue(f.month, this.date.getMonth()),
					year: this.formatValue(f.year, this.date.getFullYear())
				}),
				days: this.map(this.formatmap.days, function (day) {
					return { day: day, label: l < 4 && day.substring(0, l) || day };
				})
			};
		},

		buildCalendar: function (date) {

			var d = new Date(),
				days = this.daysInMonth(date),
				last = this.daysInLastMonth(date),
				start = this.startDayInMonth(date),
				rollover = this.config.rollover,
				prev = last - (start - 1),
				weeks = [],
				week,
				month,
				year,
				i;

			//basically copying the date object passed in
			//because we're going to manipulate it and don't
			//want to modify the actual date object passed in.
			d.setDate(date.getDate());
			d.setMonth(date.getMonth());
			d.setFullYear(date.getFullYear());

			// start up a week
			week = {days: []};

			//first we want to look at previous months in case there is
			//carryover days in the week from the previous month.
			d.setMonth(date.getMonth() - 1);
			month = d.getMonth();
			year = d.getFullYear();

			//loop any carryover days and add them to our list
			for (i = 0; prev <= last; prev++) {

				week.days.push(rollover
					? this.buildDay(year, month, prev, i, true)
					: {}
				);

				i++;
			}

			//reset the date once more to deal with the current month
			//we want rendered. we want to set the year as well in case the
			//previous month changed years
			d.setMonth(date.getMonth());
			d.setFullYear(date.getFullYear());

			month = date.getMonth();
			year  = date.getFullYear();

			for (i = 1; i <= days; i++) {

				week.days.push(this.buildDay(year, month, i, start, false, i === d.getDate()));

				start++;

				if (start > 6) {

					weeks.push(week);

					start = 0;
					week = {days: []};
				}
			}

			//finally we want to look at future months.
			//there may be some carryover to complete the table so let's do that.

			if (start !== 0) {

				d.setMonth(month + 1);

				month = d.getMonth();
				year  = d.getFullYear();

				for (i = 1; start <= 6; start++) {

					week.days.push(rollover
						? this.buildDay(year, month, i, start, true)
						: {}
					);

					i++;
				}
			}

			weeks.push(week);

			return weeks;
		},

		buildDay: function (year, month, date, day, inactive, active) {

			var today = new Date();

			return {
				value: date,
				label: this.format('label', {
					day: date,
					month: this.formatValue('mmmm', month),
					year: this.formatValue('yyyy', year)
				}),
				active: active,
				inactive: inactive,
				weekend: !day || day > 5,
				day: this.formatmap.days[day],
				today: date === today.getDate()
					&& month === today.getMonth()
					&& year === today.getFullYear()
			};
		},

		build: function () {
			this.shadow = this.html('shadow', this.data());
		},

		mount: function () {
			this.node('body', this.calendar).addClass('in');
			this.shadow.appendTo(this.root);
		},

		unmount: function () {

			this.shadow.remove();

			this.config =
			this.shadow =
			this.date =
			this.root = null;
		},

		bind: function () {

			var thiss = this,
				calendarFocused = false;

			this.input
			.on('focus.mk', true, function (e) {
				thiss._focus(e.relatedTarget);
			})
			.on('keydown.mk', function (e) {
				thiss._keydown(e);
			});

			this.calendar
			.on('focus.mk', true, function (e) {
				calendarFocused = thiss.$(e.target).is('tbody');
			})
			.on('keydown.mk', true, function (e) {
				thiss._keydownCalendar(e, calendarFocused);
			})
			.on('click.mk', true, function (e) {
				e.preventDefault();
				thiss._click(e);
			});

			this.accessbtn.on('click.mk', function (e) {
				e.preventDefault();
				//thiss.toggle();
			});
		},

		_click: function (e) {

			var t = this.$(e.target);

			if (t.is(this.selector('control'))) {
				this._handleControl(e);
			}
		},

		_handleControl: function (e) {

			var t = this.$(e.target);

			return t.hasClass('prev-mo') && this.moveMonth(true, false)
				|| t.hasClass('next-mo') && this.moveMonth(false, false)
				|| t.hasClass('prev-yr') && this.moveYear(true, false)
				|| t.hasClass('next-yr') && this.moveYear(false, false);
		},

		_focus: function (from) {

			var t = this.$(from),
				f = this.config.format.split(this.xSeperate),
				i = 0;

			if (t.parent(this.shadow).length) {
				i = f.length - 1;
			}

			this.index = i;

			this.delay(function () {
				this.setSelection(i);
			});
		},

		_move: function (w) {

			var key = this.keycode,
				el = this.active;

			el.removeClass('active');

			if (w === key.left) {
				return this._left(el[0]);
			}

			if (w === key.right) {
				return this._right(el[0]);
			}
		},

		_moveX: function (el, back) {

			var prop = back && 'previousSibling' || 'nextSibling',
				node, row;

			if (el[prop]) {
				node = el[prop];
			}
			else {

				row = el.parentNode && el.parentNode[prop];
				node = row && row.childNodes[back && row.childNodes.length - 1 || 0];

				if (!node) {
					return this.moveMonth(back, true);
				}
			}

			node = this.$(node);

			if (node.hasClass('inactive')) {
				return this._moveX(node[0], back);
			}

			this.date.setDate(parseInt(node.data('value'), 10));
			node.addClass('active');
		},

		_left: function (el) {
			return this._moveX(el, true);
		},

		_right: function (el) {
			return this._moveX(el, false);
		},

		_up: function (el) {

		},

		_down: function (el) {

		},

		_keydownCalendar: function (e, calendarFocused) {

			var w = e.which,
				k = this.keycode;

			switch (w) {

				case k.up:
				case k.down:
				case k.left:
				case k.right:

					e.preventDefault();

					if (calendarFocused) {
						this._move(w);
					}
					break;

				case k.esc:

					e.preventDefault();

					console.info('hide calendar');
					break;

				case k.pageup:
				case k.pagedown:

					e.preventDefault();
					this.moveMonth(w === k.pageup, true);
					break;

				case k.enter:
				case k.space:

					e.preventDefault();

					if (calendarFocused) {
						console.info('select date');
					} else {
						this._handleControl(e);
					}
					break;

				case k.home:
				case k.end:
					e.preventDefault();
					if (calendarFocused) {
						console.info('move to first or last date');
					}
					break;
			}
		},

		_keydown: function (e) {

			var w = e.which,
				k = this.keycode,
				c;

			switch (w) {

				case k.tab:
				case k.left:
				case k.right:
					this._setSelection(
						e, this.index, e.shiftKey || w === k.left, w !== k.tab);
					break;

				case k.up:
				case k.down:
					e.preventDefault();
					this.changeSelection(w === k.up && 1 || -1);
					break;

				case k.space:
					e.preventDefault();
					//this._space();
					break;

				default:
					c = String.fromCharCode(w);

					if (!/\w/.test(c)) {
						e.preventDefault();
					}
			}
		},

		_setSelection: function (e, index, reverse, keyboard) {

			index = index + (reverse ? -1 : 1);

			var format = this.config.format,
				fparts = format.split(this.xSeperate),
				exit = false;

			if (index < 0) {
				index = 0;
				exit = !keyboard;
			}
			else if (index > fparts.length - 1) {
				index = fparts.length - 1;
				exit = !keyboard;
			}

			if (exit) {
				return;
			}

			e.preventDefault();

			this.index = index;
			this.setSelection(index);
		},

		refresh: function (refocus) {

			var c = this.calendar,
				m = this.html('body', {
					weeks: this.buildCalendar(this.date)
				});

			this.node('body',  c).remove();
			this.node('table', c).append(m);

			this.updateLabel();

			if (refocus) {
				this.node('body',  c).focus();
			}

			return this;
		},

		updateLabel: function () {

			var f = this.config.formats,
				d = this.date;

			this.node('heading', this.calendar).text(this.format('caption', {
				month: this.formatValue(f.month, d.getMonth()),
				year:  this.formatValue(f.year,  d.getFullYear())
			}));

			return this;
		},

		moveMonth: function (up, refocus) {

			this.date.setMonth(
				this.date.getMonth() + (up ? -1 : 1));

			return this.refresh(refocus);
		},

		moveYear: function (up, refocus) {

			this.date.setFullYear(
				this.date.getFullYear() + (up ? -1 : 1));

			return this.refresh(refocus);
		},

		getSelection: function (index) {

			var input = this.input,
				value = input.val(),
				parts = value.split(this.xSeperate),
				part = parts[index], i;

			if (part) {

				i = -1;

				value = value.replace(this.xSearch, function (x, y, z) {

					++i;

					if (i !== index) {
						return new Array(y.length + 1).join('*') + z;
					}
					return y + z;
				});

				var st = value.indexOf(part),
					ed = st + part.length;

				return {
					value: value.substring(st, ed),
					range: [st, ed]
				};
			}

			return null;
		},

		setSelection: function (index) {

			var selection = this.getSelection(index);

			if (selection) {
				this.input[0].setSelectionRange(
					selection.range[0], selection.range[1]);
			}
			return this;
		},

		changeSelection: function (amount) {

			var selection = this.getSelection(this.index),
				input = this.input,
				format,
				value,
				date;

			if (selection) {

				format = this.config.format.split(this.xSeperate)[this.index];

				value = this.getValue(format);
				value = this.setValue(format, value + amount);

				date = input.val().split('');
				date.splice(selection.range[0], selection.value.length, value);

				input.val(date.join(''));
				this.setSelection(this.index);
			}
		},

		/*
			<method:setValue>
				<invoke>.setValue(format, value, date)</invoke>
				<param:format>
					<type>String</type>
					<desc>Piece of a format value (ie: mm, mmmm, yyyy, etc.)</desc>
				</param:format>
				<param:value>
					<type>Number</type>
					<desc>Value to set on a date object.</desc>
				</param:value>
				<param:date>
					<type>Date</type>
					<desc>Date object to pull the value from. Default is internal date.</desc>
				</param:date>
				<desc>Takes a format and value and applies it to the date in question. Returns the formatted value.</desc>
			</method:setValue>
		*/

		setValue: function (format, value, date) {

			var d = date || this.date,
				days;

			switch (format) {

				case 'd':
				case 'dd':
					days = this.daysInMonth(d);
					value = value > days && 1 || value > 0 && value || days;
					d.setDate(value);
					break;

				case 'm':
				case 'mm':
				case 'mmm':
				case 'mmmm':
					value = value < 0 && 11 || value < 12 && value || 0
					d.setMonth(value);
					break;

				case 'yy':
				case 'yyyy':
					d.setFullYear(value);
					break;
			}

			return this.formatValue(format, value);
		},

		/*
			<method:getValue>
				<invoke>.getValue(key[, date])</invoke>
				<param:key>
					<type>String</type>
					<desc>Key representing part of a date (ie: m, d, or y).</desc>
				</param:key>
				<param:date>
					<type>Date</type>
					<desc>Date object to pull the value from. Default is internal date.</desc>
				</param:date>
				<desc>Takes a key signifying day, date, month, or year and pulls the value from the date object.</desc>
			</method:getValue>
		*/

		getValue: function (key, date) {

			var d = date || this.date;

			if (/y/.test(key)) {
				return d.getFullYear();
			}

			if (/m/.test(key)) {
				return d.getMonth();
			}

			if (/d/.test(key)) {
				if (key.length > 2) {
					return d.getDay();
				}
				return d.getDate();
			}

			return -1;
		},

		/*
			<method:formatValue>
				<invoke>.formatValue(format, value)</invoke>
				<param:format>
					<type>String</type>
					<desc>Part of a date format.</desc>
				</param:format>
				<param:value>
					<type>Number</type>
					<desc>Number representing the value to be formatted.</desc>
				</param:value>
				<desc>Takes a piece of a date format (ie: mm, yyyy, etc.) and formats the raw value.</desc>
			</method:formatValue>
		*/

		formatValue: function (format, value) {

			var me = this,
				map = this.formatmap;

			switch (format) {

				case 'm':
					return value + 1;
				case 'mm':
					return (++value) < 10 && '0' + value || value;
				case 'mmm':
					return map.months[value].substring(0, 3);
				case 'mmmm':
					return map.months[value];
				case 'd':
					return value;
				case 'dd':
					return value < 10 && '0' + value || value;
				case 'ddd':
					return map.days[value].substring(0, 2);
				case 'dddd':
					return map.days[value];
				case 'yyyy':
					return value;
				case 'yy':
					return value.toString().slice(2);
			}
		},

		/*
			<method:stringToDate>
				<invoke>.parseDate(sdate)</invoke>
				<param:sdate>
					<type>String</type>
					<desc>Date string in native format (yyyy-mm-dd).</desc>
				</param:sdate>
				<desc>Takes a date string in *native format only* (yyyy-mm-dd) and converts it to a date.</desc>
			</method:stringToDate>
		*/

		stringToDate: function (sdate) {

			var date = new Date(),
				parts = sdate.split(this.xSeperate),
				format = this.formats.native.split(this.xSeperate),
				value;

			this.each(format, function (f, i) {

				value = parseInt(parts[i], 10);

				if (f.indexOf('m') > -1) {
					value -= 1;
				}
				this.setValue(f, value, date);
			});

			return date;
		},

		/*
			<method:dateToString>
				<invoke>.dateToString(date[, format])</invoke>
				<param:date>
					<type>Date</type>
					<desc>Date object to convert to string.</desc>
				</param:sdate>
				<param:format>
					<type>String</type>
					<desc>format string to convert date to. Default is browser native (yyyy-mm-dd).</desc>
				</param:format>
				<desc>Takes a date string in *native format only* (yyyy-mm-dd) and converts it to a date.</desc>
			</method:dateToString>
		*/

		dateToString: function (date, format) {

			var str = format || this.config.formats.native, val;

			this.each(str.split(this.xSeperate), function (f) {
				value = this.formatValue(f,  this.getValue(f, date));
				str = str.replace(new RegExp(f), value);
			});

			return str;
		},

		/*
			<method:daysInMonth>
				<invoke>.daysInMonth(date)</invoke>
				<param:date>
					<type>Date</type>
					<desc>Date object.</desc>
				</param:date>
				<desc>Gets the max days in a perticular date's month.</desc>
			</method:daysInMonth>
		*/

		daysInMonth: function (date) {
			return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
		},

		/*
			<method:daysInLastMonth>
				<invoke>.daysInLastMonth(date)</invoke>
				<param:date>
					<type>Date</type>
					<desc>Date object.</desc>
				</param:date>
				<desc>Gets the max days in the month before the date provided.</desc>
			</method:daysInLastMonth>
		*/

		daysInLastMonth: function (date) {

			var d = new Date();
				d.setMonth(date.getMonth() - 1);

			return this.daysInMonth(d);
		},

		/*
			<method:daysInNextMonth>
				<invoke>.daysInNextMonth(date)</invoke>
				<param:date>
					<type>Date</type>
					<desc>Date object.</desc>
				</param:date>
				<desc>Gets the max days in the month after the date provided.</desc>
			</method:daysInNextMonth>
		*/

		daysInNextMonth: function (date) {

			var d = new Date();
				d.setMonth(date.getMonth() + 1);

			return this.daysInMonth(d);
		},

		/*
			<method:startDayInMonth>
				<invoke>.startDayInMonth(date)</invoke>
				<param:date>
					<type>Date</type>
					<desc>Date object.</desc>
				</param:date>
				<desc>Get the start day in the week (1-7).</desc>
			</method:startDayInMonth>
		*/

		startDayInMonth: function (date) {
			return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
		},
	});

	return mk.get('Datepicker');
});
