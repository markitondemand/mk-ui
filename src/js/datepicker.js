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
					<caption aria-atomic="true" aria-live="assertive">{{title}}</caption>\
					<thead>\
						<tr>\
						{{loop:days}}\
							<th aria-label="{{day}}">{{label}}</th>\
						{{/loop:days}}\
						</tr>\
					</thead>\
					{{template:body}}\
				</table>',

			body:
				'<tbody>\
					{{loop:weeks}}\
						<tr>\
							{{loop:days}}\
								{{template:day}}\
							{{/loop:days}}\
						</tr>\
					{{/loop:weeks}}\
				</tbody>',

			day:
				'<td class="\
					{{if:today}}today {{if:active}}\
					{{if:weekend}}weekend {{/if:weekend}}\
					{{if:inactive}}inactive {{/if:inactive}}\
					{{if:disabled}}disabled {{/if:disabled}}\
					{{if:between}}between {{/if:between}}\
					" aria-label="label">\
					{{value}}\
				</td>',

			input: '<input class="{{$key}}-input" type="text" value="{{date}}" />',
			access: '<button class="{{$key}}-access">Open</button>'
		},

		get rootinput () {
			return this.node('');
		},

		get input () {
			return this.node('input', this.shadow);
		},

		get accessbtn () {
			return this.node('access', this.shadow);
		},

		define: function (root, config) {

			this.date = new Date();

			this.super(root, config);
		},

		configure: function (o) {

			o = o || {};

			var input = this.rootinput,
				format = this.formats.date;

			this
			.param('format', 'string', o, format, input)
			.param('min', 'string', o, '', input)
			.param('max', 'string', o, '', input);

			this.super(o);
		},

		data: function () {

			var c = this.config,
				f = c.formats,
				l = f.days.length,
				r = {};

			r.date = c.format;

			r.title = this.format('caption', {
				month: this.formatValue(f.month, this.date.getMonth()),
				year: this.formatValue(f.year, this.date.getFullYear())
			});

			r.days = this.map(this.formatmap.days, function (day) {
				return {
					day: day,
					label: l < 4 && day.substring(0, l) || day
				};
			});

			r.weeks = this.buildCalendar(this.date);
console.info(r.weeks)
			return r;
		},

		buildCalendar: function (date) {

			var d = new Date(),
				days = this.daysInMonth(date),
				last = this.daysInLastMonth(date),
				start = this.startDayInMonth(date),
				prev = last - (start - 1),
				weeks = [],
				week,
				month,
				year,
				day,
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
				week.days.push(this.buildDay(year, month, prev, i));
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

				week.days.push(this.buildDay(year, month, i, start));

				start++;

				if (start > 6) {

					weeks.push(week);

					start = 0;
					week = {days: []};
				}
			}

			//finally we want to look at future months.
			//there may be some carryover to complete the table so let's do that.

			d.setMonth(month + 1);

			month = d.getMonth();
			year  = d.getFullYear();

			for (i = 1; start <= 6; start++) {
				week.days.push(this.buildDay(year, month, i, start));
			}
			return weeks;
		},

		buildDay: function (year, month, date, day) {

			var today = new Date();

			return {
				value: date,
				label: this.format('label', {
					day: date,
					month: this.formatValue('mmmm', month),
					year: this.formatValue('yyyy', year)
				}),
				weekend: !day || day > 5,
				today: date === today.getDate()
					&& month === today.getMonth()
					&& year === today.getFullYear()
			};
		},

		build: function () {

			this.shadow = this.html('shadow', this.data());
		},

		mount: function () {
			this.shadow.appendTo(this.root);
		},

		unmount: function () {

			this.shadow.remove();

			this.config =
			this.shadow =
			this.root = null;
		},

		bind: function () {

			var thiss = this;

			this.input.on('focus.mk', true, function (e) {
				thiss._focus(e.relatedTarget);
			})
			.on('keydown.mk', function (e) {
				thiss._keydown(e);
			});

			this.accessbtn.on('click.mk', function (e) {
				e.preventDefault();
				thiss.toggle();
			});
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

		_keydown: function (e) {

			var w = e.which,
				k = this.keycode;

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

		setValue: function (format, value) {

			var d = this.date, days;

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
					this.date.setMonth(value);
					break;

				case 'yy':
				case 'yyyy':
					this.date.setFullYear(value);
					break;
			}

			return this.formatValue(format, value);
		},

		getValue: function (key) {

			var d = this.date

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

		daysInMonth: function (date) {
			return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
		},

		daysInLastMonth: function (date) {

			var d = new Date();
				d.setMonth(date.getMonth() - 1);

			return this.daysInMonth(d);
		},

		startDayInMonth: function (date) {
			return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
		},
	});

	return mk.get('Datepicker');
});
