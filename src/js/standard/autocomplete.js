
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

		name: 'mk-autocomplete',

		templates: {
			shadow: 
				`<div class="{{$key}}-shadow">
					{{template:trigger}}
					{{scope:list}}{{template:list}}{{/scope:list}}
				</div>`,

			trigger: 
				`<div class="{{$key}}-trigger {{if:disabled}} disabled{{/if:disabled}}" 
					role="combobox" 
					aria-haspopup="listbox">
					{{template:input}}
				</div>`,

			input: 
				`<input type="text" 
					class="{{$key}}-input" 
					autocomplete="off" 
					aria-autocomplete="list" 
					{{if:disabled}}aria-disabled="true" disabled {{/if:disabled}}
					{{if:multiple}}aria-multiselectable="true" {{/if:multiple}}
					value="{{label}}" />`,

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
						data-value="{{$value}}">
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
			loading: 'Searching for {{query}}. One moment, please.',
			loaded: '{{count}} results loaded for {{query}}. Use arrows to navigate results.',
			error: 'We\'re sorry, an error occured while searching for {{query}}.',
			empty: 'No results found for {{query}}.'
		},

		get version () {
			return 'v1.0.0';
		},

		get isLoading () {
			return this.shadow.hasClass('loading');
		},

		get limit () {
			return this.config.limit;
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

			if (this.multiple) {
				return this.rootInput.value.split('|||');
			}
			return this.rootInput.value;
		},

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

			o.remote = o.remote || this.root.data('remote') || null;
			o.limit = o.limit || this.root.data('limit') || 1;
			o.time = o.time || this.root.data('time') || 1000;
			o.type = o.type || 'json';
			o.data = o.data || null;

			o.limit = parseFloat(o.limit, 10);
			o.time = parseFloat(o.time, 10);

			var anything = o.anything;

			if (typeof anything !== 'boolean') {

				var anyAttr = this.root.data('anything');

				if (anyAttr) {
					anything = attr === 'true';
				}
				else {
					anything = true;
				}
			}

			o.anything = anything;

			this.super(o);
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

		_keyup: function (e) {

			var behavior = this.keyIsBehavior(e.which);

			if (behavior > -1) {

				if (behavior === 1) {
					e.preventDefault();
				}
				return;
			}

			if (this.query !== this.input.val()) {
				this.search(this.input.val());
			}
		},

		move: function (up) {

			var active = this.items.find('.active')[0],
				index = this.index(active) + (up && -1 || 1);

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
				o.$value = o.$value || o.value;
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

		search: function (key, add) {

			var q = key;

			if (add === true) {
				q = (this.query || '') + key;
			}

			if (this.hasCache(q)) {

				var raw  = this.getCache(q),
					data = this.data(raw);

				this.render(q, data);
			}
			else if (q) {
				this.request(q);
			}

			this.query = q;
		},

		show: function () {

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

			if (this.exists(value) !== true) {

				if (this.limit < 2) {
					this.removeAll();
				}

				if (this.capacity) {
					this.shadow.addClass('capacity');
					this.emit('capacity');
				}
				else {
					this.shadow.removeClass('capacity');
					this.selections.push(value);
					this.updateRoot().emit('change');
				}
				this.hide();
			}

			return this;
		},

		deselect: function (value) {

			var result = false;
			this.each(this.selections, function (i, v) {
				if (v === value) {
					result = true; return -1;
				}
			});

			if (result) {
				this.shadow.removeClass('capacity');
				this.updateRoot().emit('change');
			}
			return this;
		},

		exists: function (value) {

			var result = false;
			this.each(this.selections, function (i, v) {
				if (v === value) {
					result = true; return false;
				}
			});

			return result;
		},

		blur: function () {},

		updateRoot: function () {

			var values = [];
			this.each(this.selections, function (i, o) {
				values.push(o.value);
			});

			this.element.value = values.join('|||');

			return this;
		},

		loading: function (show) {

			var method = show && 'addClass' || 'removeClass';
			this.shadow[method]('loading');

			return this;
		},

		remove: function (data) {

			if (data && data.value) {

				var result = false;
				this.each(this.selections, function (i, s) {
					if (s.value === data.value) {
						result = true; return -1;
					}
				});

				if (result) {
					this.emit('remove', data);
				}
			}

			return this;
		},

		removeAll: function () {

			if (this.selections.length > 0) {

				var removed = this.selections.splice(
						0, this.selections.length);

				this.emit('remove', removed);
			}

			return this;
		},

		request: function (query) {

			if (this.config.remote) {

				if (this.timer) {
					clearTimeout(this.timer);
					this.timer = null;
				}

				this.timer = this.delay(function () {

					this.query = query;
					this.loading(true);

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

			this.loading(false);
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

			if (code === -1) {
				data.list.items.push({
					label: this.format('error', {query: query}),
					value: NO_VALUE,
					disabled: 'true'
				});
			} 
			else if (data.list.items.length < 1) {
				data.list.items.push({
					label: this.format('empty', {query: query}),
					value: NO_VALUE,
					disabled: 'true'
				});
			}

			if (this.events.render && this.events.render.length > 0) {
				this.emit('render', data);
			}
			else {

				var list = this.list,
					items = data.list.items;

				this.items.remove();

				this.each(items, function (i, d) {

					list.append(
						this.html('item', d));
				});
			}

			this.loading(false);
			this.show();

			return this;
		}
	});

	return mk.get('Autocomplete');
});
