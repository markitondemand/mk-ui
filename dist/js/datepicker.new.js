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

	//
	// below are a bunch of helper classes to help unbloat some of the code.
	// date code is very verbose and personally, i think it's ugly.
	//

	function dt () {

		var d = new Date();
			d.setHours(0, 0, 0, 0);

		return d;
	}

	function gd (d) {
		return d.getDate();
	}

	function gm (d) {
		return d.getMonth();
	}

	function gy (d) {
		return d.getFullYear();
	}

	function sd (d, v) {
		d.setDate(typeof v === 'number' ? v : v.getDate());
	}

	function sm (d, v) {
		d.setMonth(typeof v === 'number' ? v : v.getMonth());
	}

	function sy (d, v) {
		d.setFullYear(typeof v === 'number' ? v : v.getFullYear());
	}

	function sa (d, v) {

		sd(d, 1);
		sy(d, v);
		sm(d, v);
		sd(d, v);
	}

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

		_date: null,
		_selection: null,

		name: 'mk-dp',

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

		xSplit: /\/|-|,\s|\s/,

		xSearch: /(^|\w+)(\/|-|,\s|\s|$)/g,

		/*
			<property:MIN>
				<desc>Constant containing the MINIMUM past date possible in JavaScript (as time).</desc>
			</property:MIN>
		*/

		MIN: -8640000000000000,

		/*
			<property:MAX>
				<desc>Constant containing the MAXIMUM past date possible in JavaScript (as time).</desc>
			</property:MAX>
		*/

		MAX: 8640000000000000,

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

		methodmap: {
			getter: {
				year: 'getFullYear',
				month: 'getMonth',
				day: 'getDate'
			},
			setter: {
				year: 'setFullYear',
				month: 'setMonth',
				day: 'setDate'
			}
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
			label: 'Choose a date',
			label_calendar: '{{month}} {{day}} {{year}}',
			label_day: 'Enter a {{digit}} character day',
			label_month: 'Enter a {{digit}} character month',
			label_year: 'Enter a {{digit}} character year'
		},

		templates: {
			shadow:
				'<div class="{{$key}}-shadow">\
					{{template:input}}\
					{{template:access}}\
					{{template:calendar}}\
				</div>',

			input:
				'<div class="{{$key}}-input" aria-label="{{label}}">\
					<span id="{{labelid}}" class="{{$key}}-label">{{label}}</span>\
					{{loop:inputs}}\
						<span id="{{describeid}}" class="{{$key}}-label">{{description}}</span>\
						<input class="{{$key}}-entry {{id}}" \
							placeholder="{{placeholder}}" \
							type="{{type}}" \
							name="{{name}}" \
							value="{{value}}" \
							aria-describedby="{{describeid}}" \
							aria-labelledby="{{labelid}}" \
							data-format="{{format}}" \
							data-key="{{id}}" />\
						<span class="spacer">{{spacer}}</span>\
					{{/loop:inputs}}\
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
					{{if:unselectable}} unselectable{{/if:unselectable}}\
					{{if:today}} today{{/if:today}}\
					{{if:active}} active{{/if:active}}\
					{{if:weekend}} weekend{{/if:weekend}}\
					{{if:disabled}} disabled{{/if:disabled}}\
					{{if:between}} between{{/if:between}}\
					{{if:rollover}} rollover{{/if:rollover}}\
					" aria-label="{{label}}">\
					<span>{{value}}</span>\
				</td>',

			access: '<button class="{{$key}}-access" aria-label="Open Calendar Interface"></button>'
		},

		/*
			<property:date>
				<desc>The current date in the calendar UI as a Date object.</desc>
			</property:date>
		*/

		get date () {
			return this._date;
		},

		set date (value) {
			this._date = this.adjust(value);
		},

		/*
			<property:selection>
				<desc>The currently selected date as a Date object.</desc>
			</property:selection>
		*/

		get selection () {
			return this._selection;
		},

		set selection (value) {
			this._selection = this.adjust(value);
		},

		/*
			<property:disabled>
				<desc>Is the datepicker disabled.</desc>
			</property:disabled>
		*/

		get disabled () {
			return this.input.prop('disabled');
		},

		/*
			<property:enabled>
				<desc>Is the datepicker enabled.</desc>
			</property:enabled>
		*/

		get enabled () {
			return !this.disabled;
		},

		/*
			<property:isHidden>
				<desc>Is the datepicker calendar UI hidden.</desc>
			</property:isHidden>
		*/

		get isHidden () {
			return this.calendar.attr('aria-hidden') === 'true';
		},

		/*
			<property:isOpen>
				<desc>Is the datepicker calendar UI visible.</desc>
			</property:isOpen>
		*/

		get isOpen () {
			return !this.isHidden;
		},

		/*
			<property:isOpen>
				<desc>Is the datepicker calendar UI visible.</desc>
			</property:isOpen>
		*/

		get isPopup () {
			return this.config.popup;
		},

		/*
			<property:value>
				<desc>The currently selected date in native string format (yyyy-mm-dd).</desc>
			</property:value>
		*/

		get value () {
			return this.dts(this.selection);
		},

		/*
			<property:input>
				<desc>The input element you provided inside the root datepicker node.</desc>
			</property:input>
		*/

		get input () {
			return this.node('');
		},

		/*
			<property:entries>
				<desc>Get the entry elements which live inside the input wrappers.</desc>
			</property:entries>
		*/

		get entries () {
			return this.node('entry', this.shadow);
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
				 active = body.find('[data-value="' + this.date.getDate() + '"]');
			}

			if (!active.length) {
				 active = body.find('.today');
			}

			return active;
		},

		configure: function (o) {

			o = o || {};

			var root = this.root,
				input = this.input,
				formats = this.formats;

			// get the initial date we're working with
			o.fdate = input.val();
			// get a min date if specified
			o.fmin = input.attr('min');
			// get a max date if specified
			o.fmax = input.attr('max');

			this.min = o.fmin && this.std(o.fmin) || null;
			this.max = o.fmax && this.std(o.fmax) || null;

			//create the ui date for tracking positions in the picker UI
			this.date = this.adjust(o.fdate && this.std(o.fdate) || dt());
			this.selection = this.adjust(o.fdate && this.std(o.fdate) || dt());

			this.param('format', 'string', o, formats.date, root)
				.param('rollover', 'boolean', o, true, root)
				.param('label', 'string', o, formats.label, root)
				.param('popup', 'boolean', o, true, root);

			this.super(o);
		},

		build: function () {

			this.shadow = this.html('shadow', this.data());

			if (this.isPopup) {
				this.calendar.addClass('popup').attr('aria-hidden', 'true');
			}
			this.adjust(this.date, true);
		},

		mount: function () {
			this.shadow.appendTo(this.root);
		},

		unmount: function () {

			this.shadow.remove();

			this.selection =
			this.config =
			this.shadow =
			this.date =
			this.root =
			this.min =
			this.max = null;
		},

		bind: function () {

			var thiss = this,
				calendarFocused = false,
				entry = this.selector('entry');

			this.node('input', this.shadow).on('focus.mk', 'input', function (e) {

				var el = this;

				thiss.delay(function () {
					el.setSelectionRange(0, this.value.length);
				});
			})
			.on('blur.mk', 'input', function (e) {
				thiss._validate(e, this);
			})
			.on('click.mk', 'input', function () {
				var el = this;
				thiss.delay(function () {
					el.setSelectionRange(0, this.value.length);
				});
			})
			.on('keydown.mk', 'input', function (e) {
				thiss._keydownInput(e)
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
				thiss.toggle();
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

		_move: function (x, b, f) {

			var n = f.call(this, x[0], b && 'previousSibling' || 'nextSibling');

			if (n) {

				n = this.$(n);

				if (n.hasClass('unselectable') || n.hasClass('disabled')) {
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
					d = this.date, x;

				if (n) return n;

				if (a.hasClass('disabled')) return null;

				x = gd(d);

				sd(d, 1);
				sm(d, gm(d) + (b ? -1 : 1));

				y = b ? (x - 7 + dim(d)) : 7 - (dilm(d) - x);

				sd(d, y);

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
						d = this.date;

					if (n) return n;

					if (a.hasClass('disabled')) return null;

					sm(d, gm(d) + (b ? -1 : 1));
					sd(d, b ? dim(d) : 1);

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
					return this.hide();

				case k.pageup:
				case k.pagedown:
					return this.moveMonth(w === k.pageup, true);

				case k.enter:
				case k.space:
					return focused && this.select() || this._handleControl(e);

				case k.home:
				case k.end:
					if (focused) {
						this.activate(w === k.home ? 1 : dim(this.date));
					}
					return;
			}
		},
        
		data: function () {

			var c = this.config,
				f = c.formats,
				l = f.days.length,
				s = this.selection,
				d = this.date,
				t = this,
				i = [],
				u = this.uid(),
				v;

				c.format.replace(this.xSearch, function (x, y, z) {

					v = /m/.test(y) && 'month' || /y/.test(y) && 'year' || 'day';

					i.push({
						name: t.uid(),
						format: y,
						value: t.valid(s) ? t.format(y, t.getValue(y, s)) : '',
						placeholder: y,
						spacer: z.replace(/\s/g, '&nbsp;'),
						type: 'text',
						id: v,
						labelid: u,
						describeid: t.uid(),
						description: t.format(f['label_' + v], {
							digit: y.length
						})
					});
				});

			return {
				inputs: i,
				label: c.label,
				labelid: u,
				date: c.fdate ? this.dts(d, c.format) : c.format,
				weeks: this.buildCalendar(d),
				title: this.format('caption', {
					month: this.format(f.month, gm(d)),
					year: this.format(f.year, gy(d))
				}),
				days: this.map(this.formatmap.days, function (day) {
					return { day: day, label: l < 4 && day.slice(0, l) || day };
				})
			};
		},

		buildCalendar: function (date) {

			var d = dt(),
				days = dim(date),
				start = sdim(date),
				day = gd(date),
				weeks = [],
				last,
				prev,
				week,
				i;

			date.setHours(0, 0, 0, 0);

			// start up a week
			week = {days: []};

			//first we want to look at previous months in case there is
			//carryover days in the week from the previous month.
			sy(d, date);
			sm(d, date.getMonth() -1);

			last = dim(d),
			prev = last - (start - 1);

			//loop any carryover days and add them to our list
			for (i = 0; prev <= last; prev++) {
				sd(d, prev);
				week.days.push(this.buildDay(d, i++));
			}

			//reset the date once more to deal with the current month
			//we want rendered. we want to set the year as well in case the
			//previous month changed years
			sd(d, 1);
			sy(d, date);
			sm(d, date);

			for (i = 1; i <= days; i++) {
				sd(d, i);
				week.days.push(this.buildDay(d, start++, true, i === day));

				if (start > 6) {

					weeks.push(week);

					start = 0;
					week = {days: []};
				}
			}

			//finally we want to look at future months.
			//there may be some carryover to complete the table so let's do that.

			if (start !== 0) {

				sd(d, 1);
				sm(d, d.getMonth() + 1);

				for (i = 1; start <= 6; start++) {
					sd(d, i++);
					week.days.push(this.buildDay(d, start));
				}
			}

			weeks.push(week);

			return weeks;
		},

		buildDay: function (date, day, selectable, active) {

			var today = dt(),
				format = this.config.formats,
				disabled = this.max && date > this.max || this.min && date < this.min || false;

			today.setHours(0, 0, 0, 0);

			return {
				value: gd(date),
				label: this.format('label_calendar', {
					day: gd(date),
					month: this.format(format.month, gm(date)),
					year: this.format(format.year, gy(date))
				}),
				active: active,
				disabled: disabled,
				selectable: disabled ? false : selectable,
				unselectable: disabled ? true : !selectable,
				rollover: this.config.rollover,
				weekend: !day || day > 5,
				day: this.formatmap.days[day],
				today: today === date
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

				sd(this.date, parseInt(d.data('value'), 10));

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
			}
			else if (typeof day === 'number') {
				d = this.days.filter('[data-value="' + day + '"]');
			}
			else {
				d = this.$(day, this.calendar);
			}

			if (d.hasClass('disabled')) {
				return;
			}

			this.activate(day);

			day = parseInt(d.data('value'), 10);

			if (day !== gd(this.selection)) {

				if (this.setDate(this.date) && !silent) {
					this.emit('change');
					this.hide();
					this.entries[0].focus();
				}
			}

			return this;
		},

		valid: function (d) {

			var t = d.getTime();

			return !isNaN(t) && t > this.MIN && t < this.MAX;
		},

		setDate: function (d) {

			var s = this.selection, r;

			d.setHours(0, 0, 0, 0);

			if (this.min && d < this.min) {
				sa(s, this.min);
			}
			else if (this.max && d > this.max) {
				sa(s, this.max);
			}
			else {
				sa(s, d);
			}

			r = this.valid(s);

			if (r) {

				this.each(this.entries, function (f) {

					var i = this.$(f),
						k = i.data('key'),
						v = s[this.methodmap.getter[k]]();

					s[this.methodmap.setter[k]](v);
					i.val(this.format(i.data('format')), v);
				});

				sa(this.date, s);

				this.input.val(this.value);
				this.refresh();
			}

			return r;
		},

		adjust: function (d, update) {

			var i = this.min,
				x = this.max,
				c = this.controls,
				s = [];

			if (i) {

				if (gy(d) < gy(i)) {
					sa(d, i);
					s.push('.prev-yr', '.prev-mo');
				}

				else if (gy(d) === gy(i)) {

					sy(d, i);
					s.push('.prev-yr');

					if (gm(d) <= gm(i)) {

						sm(d, i);
						s.push('.prev-mo');

						if (gd(d) <= gd(i)) {
							sd(d, i);
						}
					}
				}
			}

			if (x) {

				if (gy(d) > gy(x)) {
					sa(d, x);
					s.push('.prev-yr', '.prev-mo');
				}

				else if (gy(d) >= gy(x)) {

					sy(d, x);
					s.push('.next-yr');

					if (gm(d) >= gm(x)) {

						sm(d, x);
						s.push('.next-mo');

						if (gd(d) >= gd(x)) {
							sd(d, x);
						}
					}
				}
			}

			if (update) {

				c.prop('disabled', false);

				this.each(s, function (f) {
					c.filter(f).prop('disabled', true);
				});
			}

			return d;
		},

		refresh: function (refocus) {

			var d = this.adjust(this.date, true),
				c = this.calendar,
				f = this.config.formats,
				m = this.html('body', {
					weeks: this.buildCalendar(d)
				});

			this.node('body',  c).remove();
			this.node('table', c).append(m);

			if (refocus) {
				this.node('body',  c).focus();
			}

			this.heading.text(this.format('caption', {
				month: this.format(f.month, gm(d)),
				year:  this.format(f.year,  gy(d))
			}));

			return this;
		},

		moveMonth: function (up, refocus) {

			var d = this.date;

			sm(d, gm(d) + (up ? -1 : 1));
			return this.refresh(refocus);
		},

		moveYear: function (up, refocus) {

			var d = this.date;

			sy(d, gy(d) + (up ? -1 : 1));
			return this.refresh(refocus);
		},

		setValue: function (format, value, date) {

			var d = date || this.date, days;

			switch (format.slice(0, 1)) {

				case 'd':
					days = dim(d);
					value = value > days && 1 || value > 0 && value || days;
					sd(d, value);
					break;

				case 'm':
					value = value < 0 && 11 || value < 12 && value || 0
					sm(d, value);
					break;

				case 'y':
					sy(d, value);
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

			var d = date || this.date;

			switch (key.slice(0, 1)) {

				case 'y': return gy(d);
				case 'm': return gm(d);
				case 'd':

					if (key.length > 2) {
						return d.getDay();
					}

					return gd(d);
			}

			return NaN;
		},

		/*
			<method:format>
				<invoke>.format(format[, value])</invoke>
				<param:format>
					<type>String</type>
					<desc>Part of a date format.</desc>
				</param:format>
				<param:value>
					<type>Number</type>
					<desc>Number representing the value to be formatted. Default is value associated with the format on the internal Date object.</desc>
				</param:value>
				<desc>Takes a piece of a date format (ie: mm, yyyy, etc.) and formats the raw value.</desc>
			</method:format>
		*/

		format: function (format, value) {

			if (typeof value === 'object') {
				return this.super(format, value);
			}

			if (typeof value === 'undefined') {
				value = this.getValue(format);
			}

			if (isNaN(value)) {
				return format;
			}

			var me = this,
				map = me.formatmap,
				v;

			switch (format) {

				case 'm':
					return value + 1;
				case 'mm':
					return (++value) < 10 && '0' + value || value;
				case 'mmm':
					v = map.months[value].slice(0, 3);
					return v.charAt(0).toUpperCase() + v.slice(1);
				case 'mmmm':
					v = map.months[value];
					return v.charAt(0).toUpperCase() + v.slice(1);
				case 'd':
					return value;
				case 'dd':
					return value < 10 && '0' + value || value;
				case 'yyyy':
					return value;
				case 'yy':
					return value.toString().slice(2);
			}
		},

		unformat: function (format, value) {

			var me = this,
				map = me.formatmap;

			switch (format) {

				case 'm':
				case 'd':
				case 'mm':
				case 'dd':
				case 'yyyy':
					return parseInt(value, 10);

				case 'mmm':
					value = value.toLowerCase();
					return this.first(map.months, function (m, i) {
						if (m.indexOf(value) > -1) return i;
					});

				case 'mmmm':
					return map.months.indexOf(value.toLowerCase());
			}
			return NaN;
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

			var date = dt(),
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

			date = date || this.date;
			format = format || this.config.formats.native;

			var v;

			this.each(format.split(this.xSplit), function (f) {
				v = this.format(f,  this.getValue(f, date));
				format = format.replace(new RegExp(f), v);
			});

			return format;
		},

		disable: function () {

			if (this.enabled) {

				this.each([
					this.input,
					this.day,
					this.month,
					this.year
				], function (el) {
					el.prop('disabled', true);
					el.addClass('disabled');
				});

				this.calendar.addClass('disabled');
			}
			return this;
		},

		enable: function () {

			if (this.disabled) {

				this.each([
					this.input,
					this.day,
					this.month,
					this.year
				], function (el) {
					el.prop('disabled', false);
					el.removeClass('disabled');
				});

				this.calendar.removeClass('disabled');
			}
			return this;
		},

		show: function () {

			var c = this.calendar;

			if (this.isPopup && this.enabled && this.isHidden) {

				this.delay(function () {

					c.addClass('in').attr('aria-hidden', 'false');
					this.emit('show');
				});

				this.transition(c, function () {
					c.removeClass('in');
					this.node('body', c).focus();
				});
			}

			return this;
		},

		hide: function () {

			var c = this.calendar;

			if (this.isPopup && this.isOpen) {

				this.delay(function () {

					c.addClass('out').attr('aria-hidden', 'true');
					this.emit('hide');
				});

				this.transition(c, function () {
					c.removeClass('out');
					this.accessbtn.focus();
				});
			}

			return this;
		},

		toggle: function () {

			if (this.enabled && this.isHidden) {
				return this.show();
			}
			return this.hide();
		}
	});

	return mk.get('Datepicker');
});
