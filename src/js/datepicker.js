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

    function num (v) {
        return typeof v === 'number';
    }

	function dt () {

		var d = new Date();
			d.setHours(0, 0, 0, 0);

		return d;
	}

    function garbage () {
        var d = new Date('garbage');
        d.setHours(0, 0, 0, 0);
        d.setDate(1);

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
		d.setDate(num(v) ? v : v.getDate());
	}

	function sm (d, v) {
		d.setMonth(num(v) ? v : v.getMonth());
	}

	function sy (d, v) {
		d.setFullYear(num(v) ? v : v.getFullYear());
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

		var _d = dt();

			_d.setDate(1);
			_d.setMonth(gm(d) - 1);
			_d.setFullYear(gy(d));

		return dim(_d);
	}

	 function dinm (d) {

		var _d = dt();

			_d.setDate(1);
			_d.setMonth(gm(d) + 1);
			_d.setFullYear(gy(d));

		return dim(_d);
	}

	function sdim (d) {
		return new Date(gy(d), gm(d), 1).getDay();
	}

	mk.create('Datepicker', {

		_date: null,
        _enddate: null,
		_uidate: null,
        _clicks: 0,

        xSplit: /\/|-|,\s|\s/,

		xSearch: /(^|\w+)(\/|-|,\s|\s|$)/g,

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

        /*
			<property:holidays>
				<desc>Array of date strings (in native format) or date objects which will provide a holiday identifier to the calendar ui. Default is empty array. Change prototype property to apply globally or through config for each instance.</desc>
			</property:holidays>
		*/

        holidays: [],

        /*
			<property:blackouts>
				<desc>Array of date strings (in native format) or date objects which will disable selection abilities. Default is empty array. Change prototype property to apply globally or through config for each instance.</desc>
			</property:blackouts>
		*/

        blackouts: [],

        /*
			<property:special>
				<desc>Array of date strings (in native format) or date objects which will run though a date matcher and apply a class name to the date UI day(s) in question. Change prototype property to apply globally or through config for each instance.</desc>
			</property:special>
		*/

        special: {},

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
			label: 'Choose a Date',
			label_d: 'Select Day',
			label_m: 'Select Month',
			label_y: 'Enter a four digit year',
            label_trigger: 'Open Calendar Interface',
			label_calendar: '{{month}} {{day}}, {{year}}'
		},

		templates: {

			shadow:
				'<div class="{{$key}}-shadow">\
                    <div class="{{$key}}-inputs">\
                        {{loop:inputs}}\
                            {{template:input}}\
                        {{/loop:inputs}}\
                    </div>\
					{{template:calendar}}\
				</div>',

			input:
				'<div class="{{$key}}-input-container">\
					<span id="{{labelid}}" class="{{$key}}-label">{{label}}</span>\
                    <div class="{{$key}}-input" data-index="{{$index}}">\
    					{{loop:parts}}\
                            <span id="{{descid}}" class="{{$key}}-description">{{desc}}</span>\
    						{{if:select}}\
                                {{template:select}}\
                            {{/if:select}}\
                            {{if:number}}\
                                {{template:number}}\
                            {{/if:number}}\
                            {{if:spacer}}\
                                <span class="spacer">{{spacer}}</span>\
                            {{/if:spacer}}\
    					{{/loop:parts}}\
                        {{template:trigger}}\
                    </div>\
				</div>',

            select:
                '<select required \
                    role="listbox" \
                    class="{{$key}}-entry" \
                    data-key="{{key}}"\
                    data-format="{{format}}"\
                    aria-labelledby="{{labelid}}" \
                    aria-describedby="{{descid}}">\
                    {{loop:options}}\
                        <option value="{{value}}"{{if:selected}} selected{{/if:selected}}>{{label}}</option>\
                    {{/loop:options}}\
                </select>',

            number:
                '<input \
                    class="{{$key}}-entry" \
                    type="text" \
                    value="{{value}}" \
                    placeholder="{{format}}" \
                    data-key="{{key}}"\
                    data-format="{{format}}"\
                    aria-labelledby="{{labelid}}" \
                    aria-describedby="{{descid}}" />',

			calendar:
				'<div class="{{$key}}-calendar">\
					{{template:controls}}\
					{{template:table}}\
				</div>',

			controls:
				'<div class="{{$key}}-controls">\
                    {{loop:controls}}\
                        <button class="{{$key}}-control {{name}}" aria-label="{{label}}"></button>\
                    {{/loop:controls}}\
				</div>',

			table:
				'<table class="{{$key}}-table" tabindex="0" role="grid">\
					<caption role="heading" class="{{$key}}-heading" aria-atomic="true" aria-live="assertive">{{caption}}</caption>\
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
				'<tbody class="{{$key}}-body">\
					{{loop:weeks}}\
						<tr>\
							{{loop:days}}\
								{{template:day}}\
							{{/loop:days}}\
						</tr>\
					{{/loop:weeks}}\
				</tbody>',

			day:
				'<td role="gridcell" id="{{id}}" data-value="{{value}}" aria-label="{{label}}" class="{{$key}}-day {{day}}{{if:special}} {{special}}{{/if:special}}{{if:first}} first{{/if:first}}{{if:last}} last{{/if:last}}{{if:blackout}} blackout{{/if:blackout}}{{if:selectable}} selectable{{/if:selectable}}{{if:today}} today{{/if:today}}{{if:active}} active{{/if:active}}{{if:disabled}} disabled{{/if:disabled}}{{if:between}} between{{/if:between}}{{if:rollover}} rollover{{/if:rollover}}{{if:holiday}} holiday{{/if:holiday}}">\
					<span class="{{$key}}-date">{{date}}</span>\
				</td>',

			trigger:
                '<button class="{{$key}}-trigger" aria-label="{{label_trigger}}"></button>',

            trap:
                '<button class="{{$key}}-trap" aria-hidden="true"></button>'
		},

		/*
			<property:uidate>
				<desc>The current date in the calendar UI as a Date object.</desc>
			</property:uidate>
		*/

		get uidate () {
			return this._uidate;
		},

		set uidate (value) {
			this._uidate = this.adjust(value);
		},

		/*
			<property:date>
				<desc>The currently selected date as a Date object.</desc>
			</property:date>
		*/

		get date () {
			return this._date;
		},

		set date (value) {
			this._date = this.adjust(value);
		},

        /*
			<property:startdate>
				<desc>When using a start/end setup, this property represents the start date as a Date object.</desc>
			</property:startdate>
		*/

        get startdate () {
            return this.date;
        },

        set startdate (value) {
            this.date = value;
        },

        /*
			<property:enddate>
				<desc>When using a start/end setup, this property represents the end date as a Date object.</desc>
			</property:enddate>
		*/

        get enddate () {
            return this.multiple ? this._enddate : this.date;
        },

        set enddate (value) {

            if (this.multiple) {
                this._enddate = this.adjust(value);
                return;
            }
            this.date = value;
        },

		/*
			<property:disabled>
				<desc>Is the datepicker disabled.</desc>
			</property:disabled>
		*/

		get disabled () {
			return this.input(0).prop('disabled');
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
			<property:isPopup>
				<desc>Is the datepicker calendar UI a popup or inline.</desc>
			</property:isPopup>
		*/

		get isPopup () {
			return this.config.popup;
		},

		/*
			<property:value>
				<desc>The currently selected date in native string format (yyyy-mm-dd). When using a start and end date, this property will be an array.</desc>
			</property:value>
		*/

		get value () {

            if (this.multiple) {

                return [
                    this.dts(this.startdate),
                    this.dts(this.enddate)
                ];
            }

			return this.dts(this.date);
		},

		/*
			<property:inputs>
				<desc>The input elements you provided inside the root datepicker node.</desc>
			</property:inputs>
		*/

        get inputs () {
			return this.node('');
		},

        /*
			<property:multiple>
				<desc>Can the use select multiple dates (ie: start and end date).</desc>
			</property:multiple>
		*/

        get multiple () {
            return this.inputs.length > 1;
        },

		/*
			<property:trigger>
				<desc>The button used to trigger (open/close) the datepicker UI.</desc>
			</property:trigger>
		*/

		get trigger () {
			return this.node('trigger', this.shadow);
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

			if (!active.length || active.hasClass('disabled')) {
				 active = body.find('[data-value="' + this.uidate.getDate() + '"]');
			}

			if (!active.length || active.hasClass('disabled')) {
				 active = body.find('.today');
			}

            if (!active.length || active.hasClass('disabled')) {
                active = this.$(this.days[0]);
            }

			return active;
		},

		configure: function (o) {

			o = o || {};

			var root = this.root,
				input = this.input(0),
				formats = this.formats,
                end;

			// get the initial date we're working with
			o.fdate = input.val();
			// get a min date if specified
			o.fmin = input.attr('min');
			// get a max date if specified
			o.fmax = input.attr('max');

			this.min = o.fmin && this.std(o.fmin) || null;
			this.max = o.fmax && this.std(o.fmax) || null;

			this.uidate = this.adjust(o.fdate && this.std(o.fdate) || dt());
            this.date = this.adjust(o.fdate && this.std(o.fdate) || garbage());

            if (this.multiple) {

                end = this.input(1);
                o.edate = end.val();
                this.enddate = this.adjust(o.edate && this.std(o.edate) || garbage());
            }

			this.param('format', 'string', o, formats.date, root)
				.param('rollover', 'boolean', o, true, root)
				.param('label', 'string', o, formats.label, root)
				.param('popup', 'boolean', o, true, root)
                .param('holidays', 'object', o, this.holidays)
                .param('unavailables', 'object', o, this.blackouts)
                .param('special', 'object', o, this.special);

			this.super(o);
		},

		build: function () {

			this.shadow = this.html('shadow', this.data());

			if (this.isPopup) {
				this.calendar.addClass('popup').attr({
                    'aria-hidden': 'true',
                    'role': 'dialog'
                }).append(this.html('trap'));
			}

			this.adjust(this.uidate, true);
            this.activate();
		},

		mount: function () {
			this.shadow.appendTo(this.root);
		},

		/*
			<method:unmount>
				<invoke>.unmount()</invoke>
				<desc>Remove elements, data, events and references in instance to free up memory.</desc>
			</method:unmount>
		*/

		unmount: function () {

			this.shadow.remove();

			this.date =
			this.config =
			this.shadow =
			this.uidate =
			this.events =
			this.root =
			this.min =
			this.max = null;
		},

		bind: function () {
            this._bindEntryEvents();
            this._bindCalendarEvents();
		},

        _bindEntryEvents: function () {

            var thiss = this,
                entry = this.selector('entry');

            this.node('input', this.shadow)
            .on('mousedown.mk', entry, function (e) {
                thiss._disableDropdown(e, this);
            })
            .on('focus.mk', entry, function (e) {
                thiss._focusEntry(e, this);
            })
            .on('keydown.mk', entry, function (e) {
                thiss._keydownEntry(e, this);
            })
            .on('change.mk', entry, function (e) {
                thiss._applyEntry(e, this);
            })
            .on('blur.mk', entry, function (e) {
                thiss._setEntry(e, this);
            });
        },

        _bindCalendarEvents: function () {

            var thiss = this,
                calendar = this.calendar,
				calendarFocused = false;

            this.trigger.on('click.mk', function (e) {
				thiss._open(e, this);
			});

            this.node('trap', calendar).on('focus.mk', function () {
                thiss._trap();
            });

            calendar
			.on('focus.mk', true, function (e) {

                var el = thiss.$(e.target);

				calendarFocused = el.is(thiss.selector('table'));

                if (el.is(thiss.selector('control'))) {
                    thiss.controls.removeClass('focused');
                    el.addClass('focused');
                }
			})
            .on('blur.mk', true, function (e) {
                thiss._blur(e.relatedTarget);
            })
			.on('keydown.mk', true, function (e) {
				thiss._keydownCalendar(e, calendarFocused);
			})
			.on('click.mk', true, function (e) {
				e.preventDefault();
				thiss._click(e);
			})
			.on('mouseenter', this.selector('day'), function (e) {
                thiss._activate(this);
			});
        },

        _open: function (e, trigger) {

            e.preventDefault();

            var input = this.$(trigger).parent(
                    this.selector('input')),
                index = parseInt(input.data('index'), 10);

            this._clicks = index;
            this.shadow.data('trigger-index', index);
            this.show();
        },

        // prevent selectmenus frop opening by focus/click

        _disableDropdown: function (e, entry) {

            if (entry.tagName === 'SELECT') {
                e.preventDefault();
                entry.focus();
            }
        },

        // input elements get completely selected rather
        // than the ability to move the cursor anywhere.

        _focusEntry: function (e, entry) {

            if (entry.tagName === 'INPUT') {
                entry.setSelectionRange(0, entry.value.length);
            }
        },

        // when the user changes date entries,
        // apply the new values to the calendar UI.

        _applyEntry: function (e, entry) {

            var input = this.$(entry),
                value = parseInt(input.val(), 10);

            this.setValue(
                input.data('key'),
                parseInt(input.val(), 10),
                this.uidate);

            this.refresh();
        },

        _setEntry: function (e, entry) {

            var input = this.$(entry),
                value = parseInt(input.val(), 10),
                key = input.data('key'),
                date = dt(),
                apply = true,
                node;

            // for months, we want to check the max days.
            // if current value for days is larger than the new months max days,
            // we reset it (ie: currenty at 31 days and the user selects febuary).
            if (key === 'm') {

                var days = input.parent().find('[data-key="d"] option'),
                    date = dt(), m;

                sd(date, 1);
                sm(date, value);

                m = dim(date);

                days.each(function (day, i) {

                    day.disabled = i > m;

                    //only reselect a day if the placeholder is not currently selected
                    if (day.disabled && day.selected && i !== 0) {
                        apply = false;
                        days[m].selected = true;
                    }
                });
            }

            if (apply) {

                date = garbage();

                var parent = input.parent(this.selector('input')),
                    yr = parseInt(parent.find('[data-key="y"]').val(), 10),
                    mo = parseInt(parent.find('[data-key="m"]').val(), 10),
                    dy = parseInt(parent.find('[data-key="d"]').val(), 10);

                if (!isNaN(yr)) {
                    sy(date, yr);
                }

                if (!isNaN(mo)) {
                    sm(date, mo);
                }

                if (!isNaN(dy)) {
                    sd(date, dy);
                }

                if (this.valid(date) && this.setDate(date, parseInt(parent.data('index'), 10))) {
                    this.emit('change');
                }
            }
        },

        _keydownEntry: function (e, entry) {

            var k = this.keycode,
                w = e.which,
                c = String.fromCharCode(w);


            // prevent select menu dropdowns from opening
            if (entry.tagName === 'SELECT') {
                if (w === k.space || w === k.enter) {
                    e.preventDefault();
                }
                return;
            }
            // disable left/right behavior on inputs
            // which prevents users from entering garbage data anywhere in the input.
            if (w === k.left || w === k.right) {
                e.preventDefault();
                return;
            }
            //toggle through possible date entry options
            if (w === k.up || w === k.down) {
                e.preventDefault();
                return this._moveEntry(entry, w === k.up);
            }
            //user enters a valid character key
            if (/\w/.test(c)) {
                //stop event from applying the key
                e.preventDefault();
                //if it's a number, we apply the character manually
                if (/\d/.test(c)) {
                    return this._validateEntry(e, entry, c);
                }
            }
        },

        // toggle through entry values
        // currently only supporting years

        _moveEntry: function (entry, up) {

            var input = this.$(entry),
                value = entry.value;

            if (input.data('key') === 'y') {

                value = parseInt(value, 10);
                value = value + (up? 1 : -1);

                if(isNaN(value)) {
                    value = gy(dt());
                }

                // check min/max values and don't allow
                // dates past those values to be entered.
                if (this.max && gy(this.max) < value) {
                    value = gy(this.max);
                }
                else if (this.min && gy(this.min) > value) {
                    value = gy(this.min);
                }

                entry.value = value;
                entry.setSelectionRange(0, 4);
                this._applyEntry(null, entry);
            }
        },

        // validate a users input.
        // currently only supporting years
        // day and month are select menus and don't require validation.

        _validateEntry: function (e, entry, char) {

            var input = this.$(entry),
                point = entry.selectionEnd,
                value = entry.value,
                full  = value.slice(0, point) + char + value.slice(point, value.length);

            if (input.data('key') === 'y') {
                entry.value =  full.length > 4 ? full.slice(-4) : full;
                entry.setSelectionRange(0, 4);
                this._applyEntry(null, entry);
            }
        },

        _updateEntries: function () {

            var inputs = this.node('input', this.shadow),
                dates = [this.date],
                me = this,
                entries;

            if (this.multiple) {
                dates.push(this.enddate);
            }

            this.each(dates, function (date, i) {

				if (this.valid(date)) {

					entries = this.node('entry', inputs[i]);

	                entries.each(function (entry) {
	                    entry.value = me.getValue(
	                        entry.getAttribute('data-format'), date);
	                });
				}
            });
        },

        _activate: function (day) {

            var el = this.$(day);

            if (el.hasClass('selectable')) {
                this.activate(el);
            }
        },

        _trap: function () {

            this.$('button, table', this.calendar).each(function (el) {

                if (!el.disabled) {

                    el.focus();
                    return false;
                }
            });
        },

        _blur: function (el) {

            var c = this.calendar,
                e = this.$(el);

            if (!el || (!e.is(c) && e.parent(c).length < 1)) {
                return this.hide();
            }
        },

		_click: function (e) {

			var t = this.$(e.target),
				s = this.selector('day');

			if (t.is(this.controls)) {
				return this._handleControl(e);
			}

			t = t.is(s) && t || t.parent(s);

			if (t.length && t.hasClass('selectable')) {
				this.select(t.data('value'));
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

				if (!n.hasClass('selectable') || n.hasClass('disabled')) {
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

				if (n) {
                    return n;
                }

				if (a.hasClass('disabled')) {
                    return null;
                }

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
						d = this.uidate;

					if (n) {
                        return n;
                    }

					if (a.hasClass('disabled')) {
                        return null;
                    }

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
					return this.hide(true);

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
					return;
			}
		},

        _isMatch: function (dates, date) {

            date = date || this.date;

            var d = typeof date === 'string' ? this.std(date) : date,
                r = false,
                x;

            d.setHours(0, 0, 0, 0);

            this.each(dates, function (d) {

                x = typeof d === 'string' ? this.std(d) : d;
                x.setHours(0, 0, 0, 0);

                if (date.getTime() === x.getTime()) {
                    r = true; return false;
                }
            });

            return r;
        },

		/*
			<method:input>
				<invoke>.input(index)</invoke>
				<param:index>
					<type>Element</type>
					<desc>Element in the calendar UI to set as active.</desc>
				</param:index>
				<desc>Get one of the native input elements by providing an index key.</desc>
			</method:input>
		*/

        input: function (index) {
            return this.$(this.inputs[index]);
        },

		data: function () {

			var c = this.config,
				f = c.formats,
                l = f.days.length,
				d = this.uidate;

			return {
				weeks: this.buildCalendar(d),
                inputs: this.map(this.inputs, function (input) {
                    return this.buildInput(input);
                }),
				caption: this.format('caption', {
					month: this.format(f.month, gm(d)),
					year:  this.format(f.year,  gy(d))
				}),
                controls: [
                    {name: 'prev-yr', label: f.prevYr},
                    {name: 'prev-mo', label: f.prevMo},
                    {name: 'next-mo', label: f.nextMo},
                    {name: 'next-yr', label: f.nextYr}
                ],
				days: this.map(this.formatmap.days, function (day) {
					return {
                        day: day,
                        label: l < 4 ? day.slice(0, l) : day
                    };
				})
			};
		},

        buildInput: function (input) {

            var i = this.$(input),
                c = this.config,
                d = this.date,
                t = this,
                p = [],
                r = {
                    label: i.attr('aria-label'),
                    labelid: t.uid(),
                    label_trigger: c.formats.label_trigger
                },
                k,
                x;

            c.format.replace(this.xSearch, function (str, part, spacer) {

                if (part === 'ddd' || part === 'dddd') {
                    p.push({
                        spacer: part + spacer
                    });
                }
                else {

                    k = part.slice(0, 1);
                    x = /y/i.test(k);

                    p.push({
                        key: k,
                        format: part,
                        spacer: spacer,
                        desc: c.formats['label_' + k],
                        descid: t.uid(),
                        labelid: r.labelid,
                        number:  x,
                        select: !x,
                        options: t.buildEntry(k, part),
                        value: x  && t.valid(d) ? gy(d) : null
                    });
                }
            });

            r.parts = p;

            return r;
        },

        buildEntry: function (key, format) {

            var l = format.length,
                a = [],
                d = this.valid(this.date) ? this.date : null,
                placeholder = false;;

            if (key === 'd') {

                placeholder = true;

                this.each(new Array(31), function (u, i) {
                    a.push({
                        selected: d ? i + 1 === gd(this.date) : false,
                        label: this.format(format, i + 1),
                        value: i + 1
                    })
                });
            }
            else if (key === 'm') {

                placeholder = true;

                a = this.map(this.formatmap.months, function (m, i) {
                    return {
                        selected: d ? i === gm(this.date) : false,
                        label: this.format(format, i),
                        value: i
                    };
                });
            }

            if (placeholder) {
                a.unshift({
                    selected: d ? false : true,
                    label: format,
                    value: ''
                })
            }

            return a;
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
				week.days.push(this.buildDay(d, i++, false, false, true));
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
					week.days.push(this.buildDay(d, start, false, false, true));
				}
			}

			weeks.push(week);

			return weeks;
		},

		buildDay: function (date, day, selectable, active, rollover) {

            var today = dt(),
                config = this.config,
				format = config.formats,
				disabled = this.isUnavailable(date),
                special = [],
                d = gd(date);

            if (rollover && !config.rollover) {
                return {rollover: true};
            }

            // build special classes
            this.each(config.special, function (v, k) {
                if (this.isSpecial(k, date)) {
                    special.push(k);
                }
            });

			return {
				value: this.dts(date),
                date: d,
				label: this.format('label_calendar', {
					day: gd(date),
					month: this.format(format.month, gm(date)),
					year: this.format(format.year, gy(date))
				}),
				active: active,
				disabled: disabled,
				selectable: disabled ? false : true,
                holiday: this.isHoliday(date),
                blackout: this.isBlackout(date),
                special: special.join(' '),
				rollover: config.rollover,
				weekend: !day || day > 5,
				day: this.formatmap.days[day],
				today: today === date,
                id: this.name + '-' + this.uid(),
                first: d === 1,
                last: d === dim(date)
			};
		},

		/*
			<method:activate>
				<invoke>.activate([day])</invoke>
				<param:day>
					<type>Element</type>
					<desc>Element in the calendar UI to set as active.</desc>
				</param:day>
				<desc>Activate a specific date in the calendar UI.</desc>
			</method:activate>
		*/

		activate: function (day) {

			var a = this.activeDay,
                c = this.calendar,
                d;

            if (day === void+1) {
                d = a;
            }
			else {
				d = this.$(day);
			}

			if (d.length) {

				this.node('day', c).removeClass('active');
                this.node('table', this.calendar).attr('aria-activedescendant', d.attr('id'));

				d.addClass('active');

				this.emit('activate', d);
			}

			return this;
		},

		/*
			<method:select>
				<invoke>.select(date[, silent])</invoke>
				<param:date>
					<type>String/Date object</type>
					<desc>Native date string (yyyy-mm-dd) or Date object.</desc>
				</param:date>
				<param:silent>
					<type>Boolean</type>
					<desc>Set to true to disable the change event from emitting. Default is false.</desc>
				</param:silent>
				<desc>Manually set the date for the datepicker, update the calendar UI, and leverage the change event.</desc>
			</method:select>
		*/

		select: function (date, silent) {

            if (date === void+1) {
                date = this.activeDay.data('value');
            }

            var dat = typeof date === 'string' ? this.std(date) : date,
                str = this.dts(dat),
                day = this.days.filter('[data-value="' + str + '"]');

            if (this.isUnavailable(dat)) {
                return;
            }

			this.activate(day);

            if (this.setDate(dat) && !silent) {
                this.emit('change');
                this.hide(true);
            }
			return this;
		},

		valid: function (d) {

			var t = d.getTime();

			return !isNaN(t) && t > this.MIN && t < this.MAX;
		},

		/*
			<method:setDate>
				<invoke>.setDate(date[, inputnum])</invoke>
				<param:date>
					<type>Date object</type>
					<desc>Date to be set.</desc>
				</param:date>
				<param:inputnum>
					<type>Number</type>
					<desc>When working with multiple inputs, pass a number along to set a perticular input. Default is 0.</desc>
				</param:inputnum>
				<desc>Manually set the date for the datepicker.</desc>
			</method:setDate>
		*/

		setDate: function (d, inputnum) {

            // always reset the time for comparisons
            d.setHours(0, 0, 0, 0);

            var time = d.getTime(),
                multi = this.multiple,
                date = this.date,
                prop = 'date',
                copy = dt();

            if (multi && inputnum) {
                this._clicks = inputnum;
            }

            // if we are dealing with multiple selections (start/end)
            // check which selection we're at
			if (multi) {

                if (this._clicks > 0) {
                    date = this.enddate;
                    prop = 'enddate';

                    // if the date is less than the start date,
                    // use the start date instead. reset clicks
                    if (time < date.getTime()) {
                        date = this.startdate;
                        prop = 'startdate';
                        this._clicks = 0;
                    }
                }
                else {
                    if (time > date.getTime()) {
                        this._clicks = 1;
                        date = this.enddate;
                        prop = 'enddate';
                    }
                }
            }

            //reset our dates time now that we have the final reference
            date.setHours(0, 0, 0, 0);

            // if dates are the same do nothing
            if (time === date.getTime()) {
                return false;
            }

            if (this.valid(d)) {

                this[prop] = d;
                this.inputs[this._clicks].value = this.dts(d);
                this._clicks = multi && this._clicks < 1 ? 1 : 0;
                this._updateEntries();
                return true;
            }

            return false;
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

                    var x = c.filter(f);

                    // refocus to the table if the button we are disabling has focus,
                    // focusing on disabled buttons isn't allowed and causes the calendar to hide
                    if (x.hasClass('focused')) {
                        this.node('table', this.calendar).focus();
                    }
					x.prop('disabled', true);
				});
			}

			return d;
		},

		/*
			<method:refresh>
				<invoke>.refresh([refocus])</invoke>
				<param:refocus>
					<type>Boolean</type>
					<desc>Refocus keyboard interactions to the UI.</desc>
				</param:refocus>
				<desc>Refresh the calendar UI.</desc>
			</method:refresh>
		*/

		refresh: function (refocus) {

			var d = this.adjust(this.uidate, true),
				c = this.calendar,
				f = this.config.formats,
				m = this.html('body', {
					weeks: this.buildCalendar(d)
				});

			this.node('body',  c).remove();
			this.node('table', c).append(m);

			if (refocus) {
				this.node('table',  c).focus();
			}

			this.heading.text(this.format('caption', {
				month: this.format(f.month, gm(d)),
				year:  this.format(f.year,  gy(d))
			}));

            this.activate();

			return this;
		},

		/*
			<method:moveMonth>
				<invoke>.moveYear(up[, refocus])</invoke>
				<param:up>
					<type>Boolean</type>
					<desc>Moves the calendar either up or down a month.</desc>
				</param:up>
				<param:refocus>
					<type>Boolean</type>
					<desc>Refocus keyboard interactions to the UI.</desc>
				</param:refocus>
				<desc>Move the calendar UI up or down a month.</desc>
			</method:moveMonth>
		*/

		moveMonth: function (up, refocus) {

			var d = this.uidate;

			sm(d, gm(d) + (up ? -1 : 1));
			return this.refresh(refocus);
		},

		/*
			<method:moveYear>
				<invoke>.moveYear(up[, refocus])</invoke>
				<param:up>
					<type>Boolean</type>
					<desc>Moves the calendar either up or down a year.</desc>
				</param:up>
				<param:refocus>
					<type>Boolean</type>
					<desc>Refocus keyboard interactions to the UI.</desc>
				</param:refocus>
				<desc>Move the calendar UI up or down a year.</desc>
			</method:moveYear>
		*/

		moveYear: function (up, refocus) {

			var d = this.uidate;
			sy(d, gy(d) + (up ? -1 : 1));
			return this.refresh(refocus);
		},

		setValue: function (format, value, date) {

			var d = date || this.uidate, days;

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

			var d = date || this.uidate;

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

        /*
			<method:unformat>
				<invoke>.format(format, value)</invoke>
				<param:format>
					<type>String</type>
					<desc>Part of a date format.</desc>
				</param:format>
				<param:value>
					<type>String</type>
					<desc>String representing the value to be formatted (ie: January).</desc>
				</param:value>
				<desc>Takes a piece of a date format (ie: mm, yyyy, etc.) and converts the value to a raw representation.</desc>
			</method:unformat>
		*/

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

            var v;

			date = date || this.date;
			format = format || this.config.formats.native;

			this.each(format.split(this.xSplit), function (f) {
				v = this.format(f,  this.getValue(f, date));
				format = format.replace(new RegExp(f), v);
			});

			return format;
		},

        /*
			<method:disable>
				<invoke>.disable()</invoke>
				<desc>Disable the Datepicker UI.</desc>
			</method:disable>
		*/

		disable: function () {

			if (this.enabled) {

				//this.each(this.input, function (el) {
					//el.prop('disabled', true);
					//el.addClass('disabled');
				//});
				this.calendar.addClass('disabled');
			}
			return this;
		},

        /*
			<method:enable>
				<invoke>.enable()</invoke>
				<desc>Enable the Datepicker UI.</desc>
			</method:enable>
		*/

		enable: function () {

			if (this.disabled) {

				//this.each(this.input, function (el) {
					//el.prop('disabled', false);
					//el.removeClass('disabled');
				//});
				this.calendar.removeClass('disabled');
			}
			return this;
		},

        /*
			<method:show>
				<invoke>.show()</invoke>
				<desc>In 'popup' mode, show the datepicker UI.</desc>
			</method:show>
		*/

		show: function () {

			var c = this.calendar;

			if (this.isPopup && this.enabled && this.isHidden) {

				this.delay(function () {

					c.addClass('in').attr('aria-hidden', 'false');
                    this.node('table', c).focus();
					this.emit('show');
				});

				this.transition(c, function () {
					c.removeClass('in');
				});
			}

			return this;
		},

        /*
			<method:hide>
				<invoke>.hide([refocus])</invoke>
				<desc>In 'popup' mode, hide the datepicker UI.</desc>
                <param:refocus>
                    <type>Boolean</type>
                    <desc>Pass as true to refocus tabbing to the trigger button.</desc>
                </param:refocus>
			</method:hide>
		*/

		hide: function (refocus) {

			var c = this.calendar, i;

			if (this.isPopup && this.isOpen) {

				this.delay(function () {
					c.addClass('out').attr('aria-hidden', 'true');
					this.emit('hide');
				});

				this.transition(c, function () {

					c.removeClass('out');

                    if (refocus) {

                        i = this.shadow.data('trigger-index');

                        if (i !== void+1) {
                            this.trigger[i].focus();
                            this.shadow.data('trigger-index', null);
                        }
                    }
				});
			}

			return this;
		},

        /*
			<method:toggle>
				<invoke>.toggle([refocus])</invoke>
				<desc>In 'popup' mode, toggle between show and hide.</desc>
                <param:refocus>
                    <type>Boolean</type>
                    <desc>Pass as true to refocus tabbing to the trigger button.</desc>
                </param:refocus>
			</method:toggle>
		*/

		toggle: function (refocus) {

			if (this.enabled && this.isHidden) {
				return this.show();
			}
			return this.hide(refocus);
		},

        /*
			<method:isHoliday>
				<invoke>.isHoliday([date])</invoke>
				<desc>Check if a date is a holiday.</desc>
                <param:date>
                    <type>String/Date</type>
                    <desc>Pass in a Date object, string, or nothing (defaults to this.date) to check if the date is a holiday. Holidays are provided by the end developer.</desc>
                </param:date>
			</method:isHoliday>
		*/

        isHoliday: function (date) {
            return this._isMatch(this.config.holidays, date);
        },

        /*
			<method:isBlackout>
				<invoke>.isBlackout([date])</invoke>
				<desc>Check if a date is a blackout date.</desc>
                <param:date>
                    <type>String/Date</type>
                    <desc>Pass in a Date object, string, or nothing (defaults to this.date) to check if the date is a blackout date. Blackout dates are provided by the end developer.</desc>
                </param:date>
			</method:isBlackout>
		*/

        isBlackout: function (date) {
            return this._isMatch(this.config.blackouts, date);
        },

        /*
			<method:isSpecial>
				<invoke>.isSpecial(key[, date])</invoke>
				<desc>Check if a date is a special date.</desc>
                <param:key>
                    <type>String</type>
                    <desc>A string representing an object key in the special day object. Special days can be provided by overriding the prototype for special (globally) or passing in via the config object (instance).</desc>
                </param:date>
                <param:date>
                    <type>String/Date</type>
                    <desc>Pass in a Date object, string, or nothing (defaults to this.date) to check if the date is a blackout date. Blackout dates are provided by the end developer.</desc>
                </param:date>
			</method:isSpecial>
		*/

        isSpecial: function (key, date) {
            return this._isMatch(this.config.special[key] || [], date);
        },

        /*
			<method:isUnavailable>
				<invoke>.isUnavailable([date])</invoke>
				<desc>Check if a date is a blackout or outside the min/max limit.</desc>
                <param:date>
                    <type>String/Date</type>
                    <desc>Pass in a Date object, string, or nothing (defaults to this.date) to check if the date is a blackout or past the min/max limit. Blackout dates are provided by the end developer.</desc>
                </param:date>
			</method:isUnavailable>
		*/

        isUnavailable: function (date) {

            date = date || this.date;

            var d = typeof date === 'string' ? this.std(date) : date;
                d.setHours(0, 0, 0, 0);

            if ((this.max && d.getTime() > this.max.getTime())
                || (this.min && d.getTime() < this.min.getTime())) {
                return true;
            }

            return this.isBlackout(d);
        }
	});

	return mk.get('Datepicker');
});
