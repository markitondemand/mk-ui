
!function($) {

	$.Mk.create('Autocomplete', {

		_doubledelete: false,
		_key: 'query',

		$input: null,
		$container: null,
		$list: null,
		$selected: null,

		options: null,
		timer: null,
		cache: null,
		selections: null,
		templates: null,

		query: '',

		_define: function() {

			this._name = 'mk-autocomplete';

			this._templates = {

				item: [
					'<li data-value="{{Symbol}}">{{!Name}}</li>',
				],

				error: [
					'<li>',
						'Your search, {{query}}, has no matches',
					'</li>'
				],

				label: [
					'<span>',
						'<a href="javascript: void(0)" role="button" data-value="{{value}}" data-action="remove">',
							'<span class="sr-only">Remove {{name}}</span>',
						'</a>',
						'<span class="value">{{value}}</span>',
					'</span>'
				],

				container: [ '<div></div>' ],
				list: [ '<ul></ul>' ],
				labels: [ '<span></span>' ],
				live: [ '<div class="sr-only" />' ],

				loadlabel: 'Searching for {{query}}',
				retrievelabel: 'Results loaded for {{query}}'
			};
		},

		_template: function(name, data, highlight) {

			data = data || {};

			var h = '<span class="' + this._class('highlight') + '">$1</span>',
				t = this._templates.hasOwnProperty(name) 
					&& this._templates[name] || null;

			if (!t) {
				 t = $.Mk._templates.no_template;
				 data = {value: name};
			}
			
			var htm = t.join('').replace(/{{(!?\w+)}}/g, function(s, c) {

				var v = data[c] || '';

				if (c[0] == '!') {
					c = c.replace(/!/, '');
					v = data[c].replace(
						new RegExp('(' + highlight + ')', 'gi'), h);
				}
				return v;
			});
			return $(htm);
		},

		_buildContainer: function() {

			var $container = this._template('container');
				$container.addClass(this._class('list-container'));

			this.aria($container).hidden();

			return $container;
		},

		_buildList: function() {

			var $list = this._template('list');
				$list.addClass(this._class('list'));

			this.aria($list).role('listbox').labelledby(this.$input);

			return $list;
		},

		_buildLabels: function() {

			var $labels = this._template('labels');
				$labels.addClass(this._class('selected'));

			return $labels;
		},

		_buildLiveRegion: function() {

			var $live = this._template('live');
				$live.addClass(this._class('live'));

			this.aria(this.$input).labelledby($live);
			this.aria($live).assertive();

			return $live;
		},

		_size: function() {

			var $labels = this.$selected.find('.' + this._class('label')),
				$label,

				max = this.$container.width(),
				combine = 0,
				w;

			$labels.each(function() {

				var $label = $(this),
					outerWidth = $label.outerWidth(true);

				combine += outerWidth;

				if (combine >= max) { combine = outerWidth; }
			});

			w = max - combine - 10;

			if (w < this.options.minwidth) {
				w = '100%';
			}

			this.$input.width(w);
		},

		_capacity: function() {
			return this.options.selections > 0 
				&& this.selections.length == this.options.selections;
		},

		_loading: function(show) {

			if (show === true) {
				
				this._live(-1);
				this.$container.addClass('loading');
				this.isLoading = true;
				this.hide();
				return;
			}

			this.$container.removeClass('loading');
			this.isLoading = false;
			this._live(1);
		},

		_live: function(status) {

			switch (status) {

				case -1:
					this.$live.text(
						this._format('loadlabel', {query: this.query}));
					break;

				case 1:
					this.$live.text(
						this._format('retrievelabel', {query: this.query}));
					break;

				default:
					this.$live.text('');
			}
		},

		_duplicate: function (data) {
			for(var i = 0, l = this.selections.length; i < l; i++) {
				if (this.selections[i].value === data.value) {
					return true;
				}
			}
			return false;
		},

		buildOptions: function(options) {

			options = options || {};

			this.options = {
				type: this.$input.data('type') || 'json',
				remote: this.$input.data('remote') || null,
				minwidth: parseInt(this.$input.data('min-width') || 0, 10) || 100,
				time: parseInt(this.$input.data('time') || 0, 10) || 500,
				selections: parseInt(this.$input.data('selections') || 0, 10) || -1,
				error: this.error,
				complete: null,
				key: this.$input.data('key') || this._key
			};

			options.templates = options.templates || {};

			for (var t in options.templates) {
				 this._templates[t] = options.templates[t];
			}

			for(var i in options) {
				this.options[i] = options[i];
			}
		},

		_init: function ($container, options) {
			
			this._define();

			this.cache = {};
			this.selections = [];

			this.$container = $($container);
			this.$input = this.$container.find('input:text');

			this.buildOptions(options);

			this._build();
			this._bind();
		},

		_build: function() {

			this.$live = this._buildLiveRegion();
			this.$selected = this._buildLabels();
			this.$list = this._buildList();
			this.$listContainer = this._buildContainer();

			this.$listContainer.prepend(this.$list);
			this.$listContainer.prepend(this.$live);

			this.$container.prepend(this.$selected);
			this.$container.append(this.$listContainer);

			this.$input.attr('autocomplete', 'off');

			this.aria(this.$input).owns(this.$list)
				.haspopup(true).index(0);
		},

		_bind: function () {

			var me = this;

			$(document.body).on(this._ns('mousedown'), this._class('list', true), function() {
				me.$input.off(me._ns('blur'));
			});

			this.$input
			.on(this._ns('keyup'), function(e) {
				me.keyup(e);
			})
			.on(this._ns('keydown'), function(e) {
				me.keydown(e);
			})
			.on(this._ns('focus'), function() {
				me.focus();
			})
			.on(this._ns('change'), function() {
				return false;
			});

			this.$list.on(this._ns('click'), this._class('item', true), function(e) {
				me.click(e, this);
			});

			this.$selected.on(this._ns('click'), '[data-action="remove"]', function (e) {
				e.preventDefault();
				me.removeSelected($(this).attr('data-value'));
			});
		},

		index: function ($el, $list) {
			for (var i = 0, l = $list.length; i < l; i++) {
				if ($el[0] === $list[i]) return i;
			}
			return 0;
		},

		show: function () {
			this.aria(this.$listContainer).visible();
			return this;
		},

		hide: function() {
			this.aria(this.$listContainer).hidden();
			return this;
		},

		toggle: function () {
			if (this.$listContainer.hasClass('aria-hidden')) {
				return this.show();
			}
			return this.hide();
		},

		on: function() {
			this.$container.removeClass('disabled');
		},

		off: function() {
			this.$container.addClass('disabled');
		},

		focus: function() {

			this.$container.addClass('focused');

			var me = this;
			this.$input.one(this._ns('blur'), function(e) {
				me.$container.removeClass('focused');
				me.hide();
			});
		},

		submit: function() {
			this.$container.trigger(
				this._ns('submit'), [this.selections]);
		},

		change: function() {
			this.$container.trigger(
				this._ns('change'), [this.selections]);
		},

		capacity: function() {
			this.$container.trigger(
				this._ns('capacity'), [this.selections]);
		},

		empty: function() {
			this.selections = [];
			this.$selected.empty();
		},

		keyenter: function() {

			var $item = this.$list.find(this._class('item', true) + '.active'),
				event = jQuery.Event(this._ns('click'));
				event.target = $item[0];

			if ($item.length) {
				this.$list.trigger(event);
			}
			else {
				this.comma();
			}
		},

		step: function(e) {

			var $items = this.$list.find(this._class('item', true)),
				$item  = this.aria(this.$list).activedescendant(),
				firstTime = false;

			if (!$item.length) {
				 $item = $($items[0]);
				  firstTime = true;
			}

			var index = this.index($item, $items),
				next  = index,
				step  = e.which == 38 ? -1 : 1;

			if (!firstTime) {
				 $item = $($items[index + step]);
				  next = index + step;
			}

			if (next >= $items.length) {
				$item = $items.filter(':last');
			}

			$items.removeClass('active');
			$item.addClass('active');

			var param = $item.length ? $item : null;

			this.aria(this.$list).activedescendant(param);
			this.aria(this.$input).activedescendant(param);
		},

		keyup: function (e) {

			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			}

			if (e.which == 8 && !this.$input.val()) {

				this.hide();

				if (this._doubledelete) {
					this.remove();
				}
				this._doubledelete = true;
				return;
			}

			this._doubledelete = false;

			if (e.which == 27) {
				return this.hide();
			}

			if (e.which == 13) {
				return this.keyenter();
			}

			if (e.which == 188) {
				return this.comma();
			}

			if (this.$container.hasClass('disabled')) {
				return;
			}

			if (e.which == 40 
				&& this.$listContainer.hasClass('aria-hidden') 
				&& (this.cache[this.$input.val().toUpperCase()] || this.options.data)) {
				return this.show();
			}

			var same = this.$input.val() && this.$input.val() === this.query;

			if (same && this.cache[this.$input.val().toUpperCase()]) {
				this.show();
			} 
			else if (this.cache[this.$input.val().toUpperCase()]) {
				this.query = this.$input.val();
				this.render(this.cache[this.$input.val().toUpperCase()]);
			} else {
				this.prefetch();
			}
		},

		keydown: function(e) {

			if (e.which == 13) {

				e.preventDefault();

				if (!this.$container.hasClass('disabled')) {

					var data = {name: '', value: this.$input.val()};

					this.$container.trigger(
						this._ns('submit'), [].concat(this.selections).concat(data));
				}
				return false;
			}

			if (e.which == 38 || e.which == 40) {
				e.preventDefault();
				this.step(e);
			}
		},

		comma: function() {

			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			}

			this.hide();

			if (this._capacity()) {
				if (this.options.selections !== 1) {
					this.$container.addClass('capacity');
					this.capacity();
					return;
				}
				this.remove();
			}

			var value = this.$input.val().split(/\,\s?/)[0] || null,
				hasChanged = false;

			//we're only accepting the first value right now...
			//if you type fast enough for two you're being sloppy anyways.
			if(value) {

				var data = {name: '', value: value};

				if (!this._duplicate(data)) {
					 this.createLabel(data);
					 hasChanged = true;
				}
			}

			if (hasChanged) {
				if (this._capacity()) { this.submit(); }
				else { this.change(); }

				this.$input.val(this.options.selections === 1 && value || '');
			}
		},

		click: function(e, item) {

			e.preventDefault();

			//if we are at capacity
			if (this._capacity()) {
				//add max class, trigger capacity event
				if (this.options.selections !== 1) {
					this.$container.addClass('capacity');
					this.capacity();
					this.hide();
					return;
				}
				//remove the last selection for single selects
				this.remove();
			}

			var $item = $(item), $label,
				 data = {
					name:  $item.text(),
					value: $item.data('value')
				};

			//exit if we are dealing with a doop
			if (this._duplicate(data)) {
				return;
			}

			//create a label, add the the queue
			this.createLabel(data);

			//if we're at capacity and dealing with a single select
			//keep the value in the input and query
			if (this._capacity() && this.options.selections == 1) {
				this.$input.val(data.value);
				this.query = this.$input.val();
			} 
			else {
				//setup double delete if we hit delete right away
				//reset query and value
				this._doubledelete = true;
				this.query = '';
				this.$input.val('');
			}

			//trigger submit or change depending on capacity
			if (this._capacity()) { this.submit(); } 
			else { this.change(); }

			//return focus but hide the menu
			this.$input.focus();
			this.focus();
			this.hide();

			//reset decendants and live node
			this.aria(this.$list).activedescendant(null);
			this.aria(this.$input).activedescendant(null);
			this._live();
		},

		remove: function() {

			var $last = this.$selected.find(this._class('label', true) + ':last');
				 text = $last.find('.value').text();

			$last.remove();

			this.selections.splice(this.selections.length - 1, 1);
			this._size();

			this.$container.removeClass('capacity');

			this._doubledelete = false;
			this.hide();

			if (this.options.selections !== 1) {
				this.$input.val(text);
			}

			if (this.selections.length) {
				this.change();
			}
		},

		removeSelected: function (value) {

			for(var i = 0, l = this.selections.length; i < l; i++) {

				if (value === this.selections[i].value) {

					$(this.$selected.find(this._class('label', true))[i]).remove();

					this.selections.splice(i, 1);
					this.$input.focus();
					this._size();

					if (this.selections.length) {
						this.change();
					}
					return;
				}
			}
		},

		createLabel: function(data) {

			$label = this._template('label', data);
			$label.addClass(this._class('label'));

			this.$selected.append($label);
			this._size();
			this.selections.push(data);
		},

		prefetch: function() {

			this.query = this.$input.val();

			this._loading(true);

			if (this.cache[this.query.toUpperCase()] && !this.options.preventCaching) {
				this.render(this.cache[this.query.toUpperCase()]);
				return;
			}

			if (this._capacity() && this.selections.length == 1) {
				this.empty();
			}

			if (this.options.data) {
				this.render(this.options.data);
			}

			var me = this;

			this.timer = setTimeout(function() { me.fetch(); }, this.options.time);
		},

		fetch: function () {

			if (this.options.remote) {

				var params = this.options.params || {};
					params[this.options.key] = this.query;

				$.ajax({
					url: this.options.remote,
					data: params,
					type: 'get',
					dataType: this.options.type,
					complete: $.proxy(this.options.complete || $.noop, this),
					error: $.proxy(this.options.error, this),
					success: $.proxy(this.render, this),
				});
			}
		},

		error: function() {

			var $li = this._template('error', {query: this.query});
				$li.addClass(this._class('item') + ' has-error');

			this.aria($li).role('option');

			this.$list.empty();
			this.$list.append($li);

			this._loading(false);
			this.show();
		},

		render: function (data) {

			data = data || [];

			this.cache[this.query.toUpperCase()] = data;

			this.$list.empty();

			this.aria(this.$list).activedescendant(null);
			this.aria(this.$list).activedescendant(null);

			if (this.options.render) {
				this.options.render.call(this, data);
			}
			else {
				for (var i = 0, l = data.length, $li; i < l; i++) {
					this.$list.append(
						this.renderItem(data[i]));
				}
			}
			this._loading(false);
			this.show();
		},

		renderItem: function (data) {

			var $item = this._template('item', data, this.query);
				$item.addClass(this._class('item'));
				$item.attr('id', this._uid());

			this.aria($item).role('option');

			return $item;
		}
	});

	$.fn.mkautocomplete = function (options) {

		options = options || {};

		return this.each(function() {

			var $container = $(this),
				 instance = $container.data('mk-autocomplete') || null;

				if (!instance) {
					 instance = new $.Mk.Autocomplete($container, options);
					 $container.data('mk-autocomplete', instance);
				}
				else {
					instance.buildOptions(options);
				}
		});
	};

}(window.jQuery);