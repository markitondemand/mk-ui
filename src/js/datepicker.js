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



	possible formats:

	04/30/1985

	April 30, 1985


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

		map: {
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
			date: 'dd/mm/yyyy',
			days: 'd',
			month: 'mmmm',
			nextMo: 'Go to next month',
			nextYr: 'Go to next year',
			prevMo: 'Go to previous month',
			prevYr: 'Go to previous year',
			caption: '{{month}} {{year}}'
		},

		templates: {
			shadow:
				'<div class="{{$key}}-shadow">\
					{{template:input}}\
					{{template:access}}\
				</div>',

			input: '<input class="{{$key}}-input" type="text" value="{{value}}" />',
			access: '<button class="{{$key}}-access">Open</button>'
		},

		get rootinput () {
			return this.node('');
		},

		get input () {
			return this.node('input', this.shadow);
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

		build: function () {
			this.shadow = this.html('shadow', {
				value: this.config.format
			});
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

			var thiss = this,
				input = this.input;

			input.on('focus.mk', true, function (e) {
				thiss._focus(e);
			})
			.on('keydown.mk', function (e) {
				thiss._keydown(e);
			});
		},

		_focus: function (e) {

			var t = this.$(e.relatedTarget),
				f = this.config.format.split(this.xSeperate);

			if (t.parent(this.shadow).length) {
				this.index = f.length - 1;
			} else {
				this.index = 0;
			}

			this.setSelection(this.index);
		},

		_keydown: function (e) {

			var w = e.which,
				k = this.keycode;

			switch (w) {

				case k.tab:
				case k.left:
				case k.right:
					this._setSelection(
						e,
						this.index,
						e.shiftKey || w === k.left,
						w === k.left || w === k.right);
					break;

				case k.up:
				case k.down:
					e.preventDefault();
					this.changeSelection(w === k.up);
					break;
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

		setSelection: function (index) {

			var input = this.input,
				value = input.val(),
				parts = value.split(this.xSeperate),
				part  = parts[index];

			if (part) {

				var st = value.indexOf(part),
					ed = st + part.length;

				this.delay(function () {
					input[0].setSelectionRange(st, ed);
				}, 1);
			}
			return this;
		},

		changeSelection: function (up) {

			var format = this.config.format,
				parts = format.split(this.xSeperate),
				part = parts[this.index],
				value = this.getValueByFormat(part);

			if (value > -1) {

				value = this.setValueByFormat(part, up ? value - 1 : value + 1);

				var input = this.input,
					date  = input.val(),
					i = 0,
					start = 0,
					end,
					ex;

				while (i < this.index) {
					ex = this.xSeperate.exec(date) || [''];
					date = date.replace(ex[0], new Array(ex[0].length + 1).join('*'));
					start = ex.index + 1;
					i++
				}

				end = start + part.length;
				date = input.val().split('');
				date.splice(start, end, value);

				input.val(date.join(''));
				this.setSelection(this.index);
			}
		},

		setValueByFormat: function (format, value) {

			switch (format) {

				case 'd':
				case 'dd':

					var days = this.getDaysInMonth(
						this.date.getFullYear(),
						this.date.getMonth());

					value = value > days && 1
						|| value > 0 && value || days;

					this.date.setDate(value);
					return format === 'dd' && value < 10 && '0' + value || value;

				case 'm':
				case 'mm':
				case 'mmm':
				case 'mmmm':
					this.date.setMonth(value > 11 && 1 || value < 0 && 11 || value);
					return format === 'mm' && value < 10 && '0' + value || value;

				case 'yy':
				case 'yyyy':
					this.date.setFullYear(value);
					break;
			}

			return value;
		},

		getValueByFormat: function (format) {

			var d = this.date;

			switch (format) {

				case 'yy':
				case 'yyyy':
					return d.getFullYear();

				case 'm':
				case 'mm':
				case 'mmm':
				case 'mmmm':
					return d.getMonth();

				case 'd':
				case 'dd':
					return d.getDate();

				case 'ddd':
				case 'dddd':
					return d.getDay();
			}

			return -1;
		},

		formatValue: function (format, value) {

			var me = this;

			switch (format) {

				case 'm':
					return value + 1;
				case 'mm':
					value = value + 1;
					return value < 10 && '0' + value || value;
				case 'mmm':
					return this.map.months[value].substring(0, 3);
				case 'mmmm':
					return this.map.months[value];
				case 'd':
					return value;
				case 'dd':
					return value < 10 && '0' + value || value;
				case 'dddd':
					return this.map.days[value];
				case 'yyyy':
					return value;
				case 'yy':
					return value.toString().slice(2);
			}
		},

		getDaysInMonth: function (year, month) {
			return 32 - new Date(year, month, 32).getDate();
		}
	});

	return mk.get('Datepicker');
});
