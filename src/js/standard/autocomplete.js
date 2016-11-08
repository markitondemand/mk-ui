
(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( [ 'mknasty'], function ( mk ) {
			return factory( root, mk );
		});
	}
	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {

		module.exports = factory( root, require('mknasty'));
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		return factory( root, root.mkNasty );
	}

})( typeof window !== "undefined" ? window : this, function ( root, mk ) {

	var NO_VALUE = mk._uid();

	mk.create('Autocomplete', mk.Selectmenu, {

		name: 'mk-ac',

		templates: {

			shadow:
				`<div class="{{$key}}-shadow">
					{{template:tags}}
					{{template:trigger}}
					{{template:notifications}}
					{{scope:list}}{{template:list}}{{/scope:list}}
				</div>`,

			tags: `<ul class="{{$key}}-tags" aria-label="Current selections"></ul>`,

			tag:
				`<li class="{{$key}}-tag" role="presentation" data-value="{{value}}">
					<a href="javascript:void(0);"
						role="button"
						data-value="{{value}}"
						data-action="remove"
						aria-label="Remove {{label}}"></a>
					{{label}}
				</li>`,

			trigger:
				`<div class="{{$key}}-trigger {{if:disabled}} disabled{{/if:disabled}}"
					role="combobox"
					aria-haspopup="listbox">
					{{template:input}}
					{{template:live}}
				</div>`,

			input:
				`<input type="text"
					class="{{$key}}-input"
					autocomplete="off"
					aria-autocomplete="list"
					{{if:disabled}}aria-disabled="true" disabled {{/if:disabled}}
					{{if:multiple}}aria-multiselectable="true" {{/if:multiple}}
					value="{{label}}" />`,

			live:
				`<div class="{{$key}}-live sr-only"
					aria-atomic="true"
					aria-live="assertive">
				</div>`,

			notifications:
				`<div class="{{$key}}-notifications"
					aria-atomic="true"
					aria-live="assertive">
				</div>`,

			list:
				`<ul id="{{id}}" class="{{$key}}-list" role="listbox">
					{{loop:items}}{{template:item}}{{/loop:items}}
				</ul>`,

			item:
				`<li class="{{$key}}-item" role="presentation">
					<a id="{{id}}"
						class="{{$key}}-option"
						role="option"
						href="javascript: void(0);"
						aria-selected="{{selected}}"
						aria-disabled="{{disabled}}"
						data-value="{{$value}}"
						data-display="{{value}}">
						<span class="{{$key}}-label">
							{{highlight:label}}
						</span>
						{{if:alt}}
							<span class="{{$key}}-alt">{{alt}}</span>
						{{/if:alt}}
					</a>
				</li>`
		},

		formats: {
			loading: 'Searching for {{query}}',
			loaded: '{{count}} results loaded for {{query}}',
			error: 'Whoops, looks like we\'re having issues with {{highlight:query}}',
			empty: 'No results found for {{highlight:query}}',
			capacity: 'You\'ve reached your tag limit'
		},

		get version () {
			return 'v1.0.0';
		},

		get tagroot () {
			return this.shadow.find(
				this.selector('tags'));
		},

		get tags () {
			return this.tagroot.find(
				this.selector('tag'));
		},

		get live () {
			return this.shadow.find(
				this.selector('live'));
		},

		get notifications () {
			return this.shadow.find(
				this.selector('notifications'));
		},

		get isLoading () {
			return this.shadow.hasClass('loading');
		},

		get limit () {
			return this.config.limit;
		},

		get doubledelete () {
			return this.config.doubledelete;
		},

		get multiple () {
			return this.limit > 1;
		},

		get capacity () {
			return this.selections.length >= this.limit;
		},

		get anything () {
			return this.config.anything;
		},

		get value () {

			if (this.selections.length > 0) {

				if (this.multiple) {
					return this.flatten(this.selections);
				}

				return this.flatten(this.selections[0]);
			}

			return null;
		},

		get isEmpty () {
			return this.items.length < 1;
		},

		deletecount: 0,

		selections: null,

		requests: 0,

		cache: null,

		query: '',

		_verifyTag: function (n) {

			var node = this.$(n);

			if (node.length < 1 ||
				node[0].tagName.toLowerCase() !== 'input') {
				throw new Error(':: mkNasty.Autocomplete - root must be a <input> node ::');
			}

			return true;
		},

		_define: function (r, o) {

			this.query = '';
			this.selections = [];
			this.requests = 0;
			this.cache = {};

			this.super(r, o);
		},

		_config: function (o) {

			o = o || {};

			o.data = o.data || null;

			this
			._param('remote', 'string', o, null)
			._param('type', 'string', o, 'json')
			._param('limit', 'number', o, 1)
			._param('time', 'number', o, 500)
			._param('doubledelete', 'boolean', o, this.multiple)
			._param('anything', 'boolean', o, true)
			._param('comma', 'boolean', o, false);

			this.super(o);
		},

		_build: function() {

			this.super();

			this.input.attr('placeholder',
				this.root.attr('placeholder'));
		},

		_bind: function () {

			this._bindInputEvents();
			this._bindListEvents();
			this._bindLabelEvents();
		},

		_bindInputEvents: function () {

			var thiss = this,
				trigger = this.trigger;

			this.input
			.on('focus.mk', function (e) {
				trigger.addClass('focus');
			})
			.on('blur.mk', function (e) {

				trigger.removeClass('focus');
				thiss.hide();

				if (this.disabled) {
					return;
				}
				thiss.blur();
			})
			.on('keydown.mk', function (e) {
				thiss._keydown(e);
			})
			.on('keyup.mk', function (e) {
				thiss._keyup(e);
			});
		},

		_bindLabelEvents: function () {

			thiss = this;

			this.tagroot.on('click.mk', '[data-action="remove"]', function (e) {
				e.preventDefault();
				thiss.deselect(this.getAttribute('data-value'));
			});
		},

		_keyup: function (e) {

			var which = e.which,
				behavior = this.keyIsBehavior(which);

			if (behavior > -1) {

				if (behavior === 1) {
					e.preventDefault();
				}
				return;
			}

			var value = this.input.val();

			if (which === this.keycode.backspace && !value) {
				return this.popByDelete().abort().clear();
			}

			this.doubledelete = false;

			if (which === this.keycode.comma
				&& this.anything
				&& this.config.comma) {

				return this.comma(value);
			}

			this.search(value);
		},

		_enter: function (e) {

			e.preventDefault();

			var active = this.items.find('.active'),
				value  = this.input.val();

			if (value && active.length < 1 && this.anything) {

				var data = this.flatten({
					label: value,
					value: value
				});

				return this.abort().select(data);
			}

			if (this.isHidden && this.isEmpty !== true) {
				return this.show();
			}
			this.super(e);
		},

		popByDelete: function () {

			if (this.doubledelete) {

				if (this.deletecount > 0) {
					this.deletecount = 0;
					this.pop();
				}
				else {
					this.deletecount = 1;
				}
			}
			return this;
		},

		move: function (up) {

			if (this.isEmpty) {
				return;
			}

			if (this.isHidden) {
				this.show();
				return;
			}

			var active = this.items.find('.active')[0],
				index = this.index(active) + (up && -1 || 1);

			if (index >= this.items.length) {
				index = -1;
			}

			if (index < 0) {
				this.$(active).removeClass('active');
				this.input.attr('aria-activedescendant', '').val(this.query);
				return;
			}

			this.super(up);
		},

		keyIsBehavior: function (w) {

			var k = this.keycode;

			switch (w) {

				case k.space:
				case k.tab:
					return 0;

				case k.enter:
				case k.up:
				case k.down:
				case k.left:
				case k.right:
				case k.esc:
					return 1;
			}

			return -1;
		},

		buildOptionData: function (data) {

			data = data || [];

			this.each(data, function (i, o) {

				o.$value = o.$value || this.flatten({
					value: o.value,
					label: o.label
				});

				o.id = o.id || this.uid();

				//todo:
				//selected aka exists()
			});
			return data;
		},

		data: function (data) {

			data = data || this.getCache();

			if (typeof data == 'string') {
				data = this.getCache(data);
			}

			var reg = new RegExp(' ' + this.name + ' ', 'i'),
				cls = ' ' + this.element.className + ' ',
				id  = this.shadow && this.shadow.attr('id') || this.uid();

			return {
				classname: cls.replace(reg, ''),
				multiple: this.multiple,
				disabled: this.disabled,
				list: {
					id: id,
					items: this.buildOptionData(data)
				}
			};
		},

		flatten: function (value) {
			return btoa(JSON.stringify(value));
		},

		unflatten: function (value) {
			return JSON.parse(atob(value));
		},

		label: function (n) {

			if (typeof n == 'undefined') {
				return this.input.val();
			}

			var node = this.$(n),
				label = node.find(this.selector('label')).text(),
				pointer = {node: node, label: label};

			this.emit('create.label', pointer);

			return pointer.label;
		},

		hasCache: function (key) {

			key = (key || '').toLowerCase();

			if (this.config.remote === null && this.config.data) {
				return true;
			}

			if (this.cache.hasOwnProperty(key)) {
				return true;
			}

			return (!key && this.config.data !== null) || false;
		},

		getCache: function (key) {

			key = (key || '').toLowerCase();

			if (this.config.remote === null && this.config.data) {
				return this.config.data;
			}

			if (this.cache.hasOwnProperty(key)) {
				return this.cache[key];
			}

			return (!key && this.config.data) || null;
		},

		setCache: function (key, data) {
			return this.cache[(key || '').toLowerCase()] = data;
		},

		pop: function () {

			if (this.selections.length > 0) {

				var data = this.selections.pop();

				if (this.multiple) {
					this.input.val(data.value);
				}
				this.abort().tag(data, true);

				return data;
			}
			return null;
		},

		comma: function (value) {

			var values = value.split(/\,\s{0,}/),
				first = true,
				added = false;

			this.each(values, function (i, v) {

				if (v) {

					if (first) {
						this.abort();
						first = false;
					}

					added = true;

					this.select(this.flatten({
						label: v,
						value: v
					}));
				}
			});

			if (added) {
				this.clear();
				this.input.val('');
			}

			return this;
		},

		search: function (key, add) {

			var q = key;

			if (add === true) {
				q = (this.query || '') + key;
			}

			this.query = q;

			if (this.hasCache(this.query)) {
				this.render(this.query, this.data(
					this.getCache(this.query)));
				return;
			}

			if (this.query) {
				this.request(this.query);
				return;
			}
		},

		clear: function () {

			this.items.remove();
			this.live.text('');
			this.hide();

			return this;
		},

		show: function () {

			if (this.isEmpty) {
				return;
			}

			var t = this.trigger,
				l = this.list;

			if (this.disabled !== true && this.isHidden) {

				this.transition(l, function () {
					l.addClass('in');
				});

				this.delay(function () {

					t.attr('aria-expanded', 'true');
					l.attr('aria-hidden', 'false');

					this.emit('show');
				});
			}
			return this;
		},

		select: function (value) {

			var data = this.unflatten(value);

			if (this.exists(data.value) !== true) {

				if (this.limit < 2) {
					this.removeAll();
				}

				if (this.capacity) {
					this.notify(1);
					this.emit('capacity', this.selections);
				}
				else {
					this.shadow.removeClass('capacity');
					this.selections.push(data);
					this.tag(data).updateRoot().emit('change');
				}
				this.hide();
			}

			return this;
		},

		deselect: function (value) {

			var data = this.unflatten(value),
				result = false;

			this.each(this.selections, function (i, o) {
				if (o.value === data.value) {
					result = true;
					return -1;
				}
			});

			if (result) {

				this.notify();
				this.tag(data, true);
				this.updateRoot().emit('change');
			}
			return this;
		},

		exists: function (value) {

			var result = false;

			this.each(this.selections, function (i, o) {
				if (o.value === value) {
					result = true;
					return false;
				}
			});

			return result;
		},

		blur: function () {
			return false;
		},

		tag: function (data, remove) {

			var flattened = this.flatten(data);

			if (remove) {
				this.tags.filter('[data-value="' + flattened + '"]').remove();
			}
			else {
				this.tagroot.append(
					this.html('tag', {label: data.label, value: flattened}));
			}
			return this;
		},

		updateRoot: function () {
			this.element.value = this.value;
			return this;
		},

		loading: function (show, query, count) {

			var method = show && 'addClass' || 'removeClass',
				format = show && 'loading' || 'loaded',
				data = {query: query, count: count};

			this.live.text('');

			if ((show && query) || (query && count)) {
				this.live.text(this.format(format, data));
			}

			this.shadow[method]('loading');

			return this;
		},

		notify: function (type, query) {

			var label = '',
				data = {query: query},
				format = type === 0 && 'empty'
					|| type === -1 && 'error'
					|| type === 1 && 'capacity'
					|| '';

			this.notifications.html(
				this.format(format, data));

			return this;
		},

		removeAll: function () {

			if (this.selections.length > 0) {

				var removed = this.selections.splice(
						0, this.selections.length);

				this.notify();
				this.tags.remove();
				this.emit('change', removed);
			}
			return this;
		},

		abort: function () {

			if (this.timer) {

				clearTimeout(this.timer);

				this.timer = null;
				this.requests -= 1;
				this.loading(false);
			}
			return this;
		},

		request: function (query) {

			if (this.config.remote) {

				this.abort();

				this.timer = this.delay(function () {

					this.query = query;
					this.loading(true, query);

					this.emit('request.before', query);

					var q = this.query,
						url = this.format(this.config.remote, {'%query': q}),
						thiss = this;

					$.ajax({
						url: url,
						type: 'get',
						dataType: this.config.type,
						requestNumber: ++this.requests,
						complete: function (x, c) {
							if (this.requestNumber === thiss.requests) {
								thiss.complete(q, x, c);
							}
						},
						error: function (x) {
							if (this.requestNumber === thiss.requests) {
								thiss.error(q, x);
							}
						},
						success: function (d, c, x) {
							if (this.requestNumber === thiss.requests) {
								thiss.success(q, d, c, x);
							}
						}
					});

				}, this.config.time);
			}
		},

		complete: function (query, xhr, code) {
			this.emit('request.complete', query, xhr, code);
		},

		error: function (query, xhr) {

			this.emit('request.error', query, xhr);
			this.render(query, null, -1);
		},

		success: function (query, data, code, xhr) {

			this.emit('request.success', query, data, code, xhr);

			this.setCache(query, data);
			this.render(query, this.data(query));
		},

		render: function (query, data, code) {

			data = data || {};
			data.list = data.list || {};
			data.list.items = data.list.items || [];

			this.items.remove();

			if (code === -1) {
				this.notify(code, query);
				this.hide();
			}
			else if (data.list.items.length < 1) {
				this.notify(0, query);
				this.hide();
			}
			else {

				this.notify();

				if (this.events.render && this.events.render.length > 0) {
					this.emit('render', data);
				}
				else {

					var list = this.list,
						items = data.list.items;

					this.each(items, function (i, d) {
						list.append(
							this.html('item', d));
					});
				}

				this.show();
			}

			this.loading(false, query, data.list.items.length);

			return this;
		}
	});

	return mk.get('Autocomplete');
});
