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

	function dim (d) {
		return 32 - new Date(d.getFullYear(), d.getMonth(), 32).getDate();
	}

	function dilm (d) {

		var _d = new Date();

			_d.setDate(1);
			_d.setMonth(d.getMonth() - 1);
			_d.setFullYear(d.getFullYear());

		return dim(_d);
	}

	 function dinm (d) {

		var _d = new Date();

			_d.setDate(1);
			_d.setMonth(d.getMonth() + 1);
			_d.setFullYear(d.getFullYear());

		return dim(_d);
	}

	function sdim (d) {
		return new Date(d.getFullYear(), d.getMonth(), 1).getDay();
	}

	mk.create('Datepicker', {

		name: 'mk-dp',

		index: -1,

		xSplit: /\/|-|,\s|\s/,

		xSearch: /(^|\w+)(\/|-|,\s|\s)/g,

		uidate: null,

		/*
			<property:date>
				<desc>The currently selected date as a Date object.</desc>
			</property:date>
		*/

		date: null,

		/*
			<property:daterange>
				<desc>Array (start and end) of selected date ranges as Date objects.</desc>
			</property:daterange>
		*/

		daterange: null,

		/*
			<property:min>
				<desc>Minimun date that can be selected as Date object.</desc>
			</property:min>
		*/

		min: null,

		/*
			<property:max>
				<desc>Maximum date that can be selected as Date object.</desc>
			</property:max>
		*/

		max: null,

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
					{{day}} {{$key}}-day\
					{{if:selectable}} selectable{{/if:selectable}}\
					{{if:today}} today{{/if:today}}\
					{{if:active}} active{{/if:active}}\
					{{if:weekend}} weekend{{/if:weekend}}\
					{{if:inactive}} inactive{{/if:inactive}}\
					{{if:disabled}} disabled{{/if:disabled}}\
					{{if:between}} between{{/if:between}}\
					{{if:rollover}} rollover{{/if:rollover}}\
					" aria-label="{{label}}">\
					<span>{{value}}</span>\
				</td>',

			input: '<input class="{{$key}}-input" type="text" value="{{date}}" />',
			access: '<button class="{{$key}}-access">Open</button>'
		},

		/*
			<property:value>
				<desc>The currently selected date in native string format (yyyy-mm-dd).</desc>
			</property:value>
		*/

		get value () {
			return this.dts();
		},

		/*
			<property:range>
				<desc>Array (start and end) of selected date ranges in native string format (yyyy-mm-dd).</desc>
			</property:range>
		*/

		get range () {
			return [];
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

		/*
			<property:calendar>
				<desc>The shadow calendar element.</desc>
			</property:calendar>
		*/

		get calendar () {
			return this.node('calendar', this.shadow);
		},

		/*
			<property:days>
				<desc>Calendar day elements in the calendar table.</desc>
			</property:days>
		*/

		get days () {
			return this.node('day.selectable', this.shadow);
		},

		/*
			<property:controls>
				<desc>The control buttons.</desc>
			</property:controls>
		*/

		get controls () {
			return this.node('control', this.shadow);
		},

		/*
			<property:heading>
				<desc>The calendar heading.</desc>
			</property:heading>
		*/

		get heading () {
			return this.node('heading', this.shadow);
		},

		/*
			<property:activeDay>
				<desc>The active day in the calendar UI.</desc>
			</property:activeDay>
		*/

		get activeDay () {

			var body = this.node('body', this.calendar),
				active = body.find('.active');

			if (!active.length) {
				 active = body.find('[data-value="' + this.uidate.getDate() + '"]');
			}

			if (!active.length) {
				 active = body.find('.today');
			}

			return active;
		},

		configure: function (o) {

			o = o || {};

			var input = this.rootinput;

			// get the initial date we're working with
			o.fdate = input.val();
			// get a min date if specified
			o.fmin = input.attr('min');
			// get a max date if specified
			o.fmax = input.attr('max');

			//create the ui date for tracking positions in the picker UI
			this.uidate = o.fdate && this.std(o.fdate) || new Date();
			//create the raw date only to be changed when a new date is selected
			this.date = o.fdate && this.std(o.fdate) || new Date('garbage');
			//create the min date if exists
			this.min = o.fmin && this.std(o.fmin) || null;
			//create the max date if exists
			this.max = o.fmax && this.std(o.fmax) || null;

			this.param('format', 'string', o, this.formats.date, input)
				.param('rollover', 'boolean', o, true, input);

			this.super(o);
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
			this.uidate =
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
				calendarFocused = thiss.$(e.target).is(
					thiss.selector('body'));
			})
			.on('keydown.mk', true, function (e) {
				thiss._keydownCalendar(e, calendarFocused);
			})
			.on('click.mk', true, function (e) {
				e.preventDefault();
				thiss._click(e);
			})
			.on('mouseenter', this.selector('day'), function (e) {

				var el = thiss.$(this);

				if (el.hasClass('selectable')) {
					thiss.activate(el);
				}
			});

			this.accessbtn.on('click.mk', function (e) {
				e.preventDefault();
			});
		},

		_click: function (e) {

			var t = this.$(e.target),
				s = this.selector('day');

			if (t.is(this.controls)) {
				return this._handleControl(e);
			}

			t = t.is(s) && t || t.parent(s);

			if (t.length && t.hasClass('selectable')) {
				this.select(t);
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
				f = this.config.format.split(this.xSplit),
				i = 0;

			if (t.parent(this.shadow).length) {
				i = f.length - 1;
			}

			this.index = i;

			this.delay(function () {
				this.setSelection(i);
			});
		},

		_move: function (x, b, f) {

			var n = f.call(this, x[0], b && 'previousSibling' || 'nextSibling');

			if (n) {

				n = this.$(n);

				if (n.hasClass('inactive')) {
					return this._move(n, b, f);
				}
				this.activate(n);
			}

			return this;
		},

		_moveY: function (a, b) {

			return this._move(a, b, function (e, p) {

				var i = a.index(),
					r = e.parentNode && e.parentNode[p],
					n = r && r.childNodes[i],
					d = this.uidate, x;

				if (n) return n;

				x = d.getDate();

				d.setDate(1);
				d.setMonth(d.getMonth() + (b ? -1 : 1));

				y = b ? (x - 7 + dim(d)) : 7 - (dilm(d) - x);

				d.setDate(y);

				this.refresh(true);
			});
		},

		_moveX: function (a, b) {

			return this._move(a, b, function (e, p) {

				if (e[p]) {
					return e[p];
				}
				else {

					var r = e.parentNode && e.parentNode[p],
						n = r && r.childNodes[b && r.childNodes.length - 1 || 0],
						d = this.uidate;

					if (n) return n;

					d.setMonth(d.getMonth() + (b ? -1 : 1));
					d.setDate(b ? dim(d) : 1);

					this.refresh(true);
				}
			});
		},

		_keydownCalendar: function (e, focused) {

			var w = e.which,
				k = this.keycode,
				a;

			if (w === k.tab) return;

			e.preventDefault();

			a = this.activeDay;

			switch (w) {

				case k.up:
				case k.down:
					return focused && this._moveY(a, w === k.up);

				case k.left:
				case k.right:
					return focused && this._moveX(a, w === k.left);

				case k.esc:
					return console.info('hide calendar');

				case k.pageup:
				case k.pagedown:
					return this.moveMonth(w === k.pageup, true);

				case k.enter:
				case k.space:
					return focused && this.select() || this._handleControl(e);

				case k.home:
				case k.end:
					if (focused) {
						this.activate(w === k.home ? 1 : dim(this.uidate));
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

		_handleUserInput: function (index) {

			var s = this.getSelection(index),
				f = this.config.format.split(this.xSplit)[index],
				v, n;

			switch (f) {
				case 'mmm':
				case 'mmmm':
					v = this.first(this.formatmap.months, function (m, i) {
						if (m.indexOf(s.value) > -1) return i;
					});

					if (v === void+1) {
						v = this.format(f, this.getValue(f));
						n = this.input.val().split('')
						n.splice(s.range[0], s.range[1], v);
						this.input.val(n.join(''))
					}
					break;
			}


		},

		_setSelection: function (e, index, reverse, keyboard) {

			this._handleUserInput(index);

			index = index + (reverse ? -1 : 1);

			var format = this.config.format,
				fparts = format.split(this.xSplit),
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


		data: function () {

			var c = this.config,
				f = c.formats,
				l = f.days.length,
				d = this.uidate;

			return {
				date: c.fdate ? this.dts(d, c.format) : c.format,
				weeks: this.buildCalendar(d),
				title: this.format('caption', {
					month: this.format(f.month, d.getMonth()),
					year: this.format(f.year, d.getFullYear())
				}),
				days: this.map(this.formatmap.days, function (day) {
					return { day: day, label: l < 4 && day.slice(0, l) || day };
				})
			};
		},

		buildCalendar: function (date) {

			var d = new Date(),
				days = dim(date),
				start = sdim(date),
				rollover = this.config.rollover,
				weeks = [],
				last,
				prev,
				week,
				month,
				year,
				i;

			// start up a week
			week = {days: []};

			//first we want to look at previous months in case there is
			//carryover days in the week from the previous month.
			d.setDate(1);
			d.setFullYear(date.getFullYear());
			d.setMonth(date.getMonth() - 1);

			month = d.getMonth();
			year  = d.getFullYear();

			last = dim(d),
			prev = last - (start - 1);

			//loop any carryover days and add them to our list
			for (i = 0; prev <= last; prev++) {
				week.days.push(this.buildDay(year, month, prev, i++, true));
			}

			//reset the date once more to deal with the current month
			//we want rendered. we want to set the year as well in case the
			//previous month changed years
			d.setFullYear(date.getFullYear());
			d.setMonth(date.getMonth());
			d.setDate(date.getDate());

			month = date.getMonth();
			year = date.getFullYear();

			for (i = 1; i <= days; i++) {
				week.days.push(this.buildDay(year, month, i, start++, false, i === d.getDate()));

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
				year = d.getFullYear();

				for (i = 1; start <= 6; start++) {
					week.days.push(this.buildDay(year, month, i++, start, true));
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
					month: this.format('mmmm', month),
					year: this.format('yyyy', year)
				}),
				active: active,
				inactive: inactive,
				selectable: !inactive,
				rollover: this.config.rollover,
				weekend: !day || day > 5,
				day: this.formatmap.days[day],
				today: date === today.getDate()
					&& month === today.getMonth()
					&& year === today.getFullYear()
			};
		},

		activate: function (day) {

			var a = this.activeDay, d;

			if (typeof day === 'number') {
				d = this.days.filter('[data-value="' + day + '"]');
			}
			else {
				d = this.$(day);
			}

			if (d.length && !d.hasClass('active')) {

				this.uidate.setDate(
					parseInt(d.data('value'), 10));

				a.removeClass('active');
				d.addClass('active');

				this.emit('activate', d);
			}

			return this;
		},

		select: function (day, silent) {

			var d, day;

			if (!day) {
				d = this.activeDay;
			} else if (typeof day === 'number') {
				d = this.days.filter('[data-value="' + day + '"]');
			} else {
				d = this.$(day);
			}

			if (d.hasClass('disabled')) {
				return;
			}

			this.activate(day);

			day = parseInt(d.data('value'), 10);

			if (day !== this.date.getDate()) {

				this.date.setDate(day);

				this.input.val(
					this.dts(this.date, this.config.format));

				this.rootinput.val(this.dts(this.date));

				if (!silent) {
					this.emit('change');
				}
			}

			return this;
		},

		refresh: function (refocus) {

			var c = this.calendar,
				m = this.html('body', {
					weeks: this.buildCalendar(this.uidate)
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
				d = this.uidate;

			this.heading.text(this.format('caption', {
				month: this.format(f.month, d.getMonth()),
				year:  this.format(f.year,  d.getFullYear())
			}));

			return this;
		},

		moveMonth: function (up, refocus) {

			this.uidate.setMonth(
				this.uidate.getMonth() + (up ? -1 : 1));

			return this.refresh(refocus);
		},

		moveYear: function (up, refocus) {

			this.uidate.setFullYear(
				this.uidate.getFullYear() + (up ? -1 : 1));

			return this.refresh(refocus);
		},

		getSelection: function (index) {

			var input = this.input,
				value = input.val(),
				parts = value.split(this.xSplit),
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
					value: value.slice(st, ed),
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

				format = this.config.format.split(this.xSplit)[this.index];

				value = this.getValue(format);
				value = this.setValue(format, value + amount);

				date = input.val().split('');
				date.splice(selection.range[0], selection.value.length, value);

				input.val(date.join(''));
				this.setSelection(this.index);

				if (!isNaN(this.date.getTime())) {
					if (/d/.test(format)) {
						this.activate(this.getValue(format));
					} else {
						this.refresh();
					}
				}
			}
		},

		/*
			<method:setValue>
				<invoke>.setValue(format, value[, date])</invoke>
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

			var d = date || this.uidate, days;

			switch (format.slice(0, 1)) {

				case 'd':
					days = dim(d);
					value = value > days && 1 || value > 0 && value || days;
					d.setDate(value);
					break;

				case 'm':
					value = value < 0 && 11 || value < 12 && value || 0
					d.setMonth(value);
					break;

				case 'y':
					d.setFullYear(value);
					break;
			}

			return this.format(format, value);
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

			var d = date || this.uidate;

			switch (key.slice(0, 1)) {
				case 'y': return d.getFullYear();
				case 'm': return d.getMonth();
				case 'd':

					if (key.length > 2) {
						return d.getDay();
					}
					return d.getDate();
			}

			return -1;
		},

		/*
			<method:format>
				<invoke>.format(format, value)</invoke>
				<param:format>
					<type>String</type>
					<desc>Part of a date format.</desc>
				</param:format>
				<param:value>
					<type>Number</type>
					<desc>Number representing the value to be formatted.</desc>
				</param:value>
				<desc>Takes a piece of a date format (ie: mm, yyyy, etc.) and formats the raw value.</desc>
			</method:format>
		*/

		format: function (format, value) {

			if (typeof value === 'object') {
				return this.super(format, value);
			}

			var me = this,
				map = this.formatmap;

			switch (format) {

				case 'm':
					return value + 1;
				case 'mm':
					return (++value) < 10 && '0' + value || value;
				case 'mmm':
					return map.months[value].slice(0, 3);
				case 'mmmm':
					return map.months[value];
				case 'd':
					return value;
				case 'dd':
					return value < 10 && '0' + value || value;
				case 'ddd':
					return map.days[value].slice(0, 2);
				case 'dddd':
					return map.days[value];
				case 'yyyy':
					return value;
				case 'yy':
					return value.toString().slice(2);
			}
		},

		/*
			<method:std>
				<invoke>.std(sdate[, format])</invoke>
				<param:sdate>
					<type>String</type>
					<desc>Date as string.</desc>
				</param:sdate>
				<param:format>
					<type>String</type>
					<desc>The format string to parse the correct date values from.</desc>
				</param:format>
				<desc>Std (stringToDate) takes a date string in *native format only* (yyyy-mm-dd) and converts it to a date.</desc>
			</method:std>
		*/

		std: function (sdate, format) {

			var date = new Date(),
				parts = sdate.split(this.xSplit),
				format = (format || this.formats.native).split(this.xSplit),
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
			<method:dts>
				<invoke>.dts([date, format])</invoke>
				<param:date>
					<type>Date</type>
					<desc>Date object to convert to string. Default is internal selected date.</desc>
				</param:date>
				<param:format>
					<type>String</type>
					<desc>format string to convert date to. Default is browser native (yyyy-mm-dd).</desc>
				</param:format>
				<desc>Dts (dateToString) takes a date string in *native format only* (yyyy-mm-dd) and converts it to a date.</desc>
			</method:dts>
		*/

		dts: function (date, format) {

			date = date || this.uidate;
			format = format || this.config.formats.native;

			var val;

			this.each(format.split(this.xSplit), function (f) {
				value = this.format(f,  this.getValue(f, date));
				format = format.replace(new RegExp(f), value);
			});

			return format;
		}
	});

	return mk.get('Datepicker');
});
