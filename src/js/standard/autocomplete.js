
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
		return factory( root, root.mkNasty, root.mkNasty.Selectmenu );
	}

})( typeof window !== "undefined" ? window : this, function ( root, mk ) { 

	mk.create('Autocomplete', mk.Selectmenu, {

		name: 'mk-autocomplete',

		templates: {
			shadow: [
				'<div class="{{$key}}-shadow">',
					'{{template:trigger}}',
					'{{scope:list}}',
						'{{template:list}}',
					'{{/scope:list}}',
				'</div>'
			],

			trigger: [
				'<div class="{{$key}}-trigger {{if:disabled}} disabled{{/if:disabled}}" role="combobox" aria-haspopup="listbox">',
					'<input type="text" ',
						'class="{{$key}}-input" ',
						'autocomplete="off" ',
						'aria-autocomplete="list" ',
						'aria-disabled="{{disabled}}" ',
						'{{if:multiple}}aria-multiselectable="true" {{/if:multiple}}',
						'value="{{label}}" />',
				'</div>'
			],

			list: [
				'<ul id="{{id}}" class="{{$key}}-list" role="listbox">',
					'{{loop:items}}',
						'{{template:item}}',
					'{{/loop:items}}',
				'</ul>'
			],

			item: [
				'<li class="{{$key}}-item" role="presentation">',
					'<a id="{{id}}" ',
						'class="{{$key}}-option" ',
						'role="option" ',
						'href="javascript: void(0);" ',
						'aria-selected="{{selected}}" ',
						'data-value="{{$value}}">',
						'<span class="{{$key}}-label">',
							'{{highlight:label}}',
						'</span>',
						'{{if:alt}}',
							'<span class="{{$key}}-alt">{{alt}}</span>',
						'{{/if:alt}}',
					'</a>',
				'</li>'
			]
		},

		formats: {
			loading: 'Searching for {{query}}. One moment, please.',
			loaded: '{{count}} results loaded for {{query}}. Use arrows to navigate results.'
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

		_define: function (r, o) {

			this.query = '';
			this.selections = [];
			this.cache = {};

			this.super(r, o);
		},

		_verifyTag: function (n) {

			var node = this.$(n);

			if (node.length < 1 || 
				node[0].tagName.toLowerCase() !== 'input') {
				throw new Error(':: mkNasty.Autocomplete - root must be a <input> node ::');
			}
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

			if (o.remote) {
				o.formats = o.formats || {};
				o.formats.__remote__ = o.remote;
			}

			var useJSON = o.useJSON;

			if (typeof useJSON !== 'boolean') {

				var jsonAttr = this.root.data('json');

				if (jsonAttr) {
					useJSON = jsonAttr === 'true';
				}
				else {
					useJSON = true;
				}
			}

			o.useJSON = useJSON;


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
				trigger = this.trigger, 
				inFocus = false,
				focusedByMouse = false;

			this.input
			.on('focus.mk', function (e) {
				
				if (thiss.disabled) {
					return;
				}

				if (focusedByMouse) {
					focusedByMouse = false;
					thiss.toggle();
				}

				trigger.addClass('focus');
				inFocus = true;
			})
			.on('blur.mk', function (e) {

				if (this.disabled) {
					return;
				}

				inFocus = false;
				thiss.blur();
			})
			.on('mousedown.mk', function (e) {

				focusedByMouse = true;

				if (inFocus) {
					focusedByMouse = false;
					thiss.toggle();
				}
			})
			.on('keydown.mk', function (e) {
				thiss._keydown(e);
			})
			.on('keypress.mk', function (e) {
				thiss.search(String.fromCharCode(e.which), true);
			});	
		},

		encodeValue: function (data) {

			if (this.config.useJSON) {
				return escape(JSON.stringify(data));
			}
			return data.value;
		},

		decodeValue: function (data) {

			if (this.config.useJSON) {
				return JSON.parse(unescape(data));
			}
			return data;
		},

		buildOptionData: function (data) {

			data = data || [];

			this.each(data, function (i, o) {
				o.$value = o.$value || this.encodeValue(o);
			});
			return data;
		},

		data: function (data) {

			data = data || this.getCache();

			if (typeof data == 'string') {
				data = this.getCache(data);
			}

			var reg = new RegExp(' ' + this.name + ' ', 'i'),
				cls = ' ' + this.element.className + ' ';

			return { 
				classname: cls.replace(reg, ''),
				multiple: this.multiple,
				disabled: this.disabled,
				list: {
					id: this.uid(), 
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

			key = key || '';
			key = key.toLowerCase();

			if (!key && this.config.data) {
				return true;
			}

			if (this.cache.hasOwnProperty(key)) {
				return true;
			}

			if (this.config.remote === null && this.config.data) {
				return true;
			}

			return false;
		},

		getCache: function (key) {

			key = key || '';
			key = key.toLowerCase();

			if (!key && this.config.data) {
				return this.config.data;
			}

			if (this.cache.hasOwnProperty(key)) {
				return this.cache[key];
			}

			if (this.config.remote === null && this.config.data) {
				return this.config.data;
			}

			return null;
		},

		setCache: function (key, data) {

			key = key || '';
			key = key.toLowerCase();

			if (data) {
				this.cache[key] = data;
			}

			return data;
		},

		search: function (key, add) {

			this.query = this.query || '';

			if (add === true) {
				this.query += key;
			}
			else {
				this.query = key;
			}

			if (this.hasCache(this.query)) {

				var raw  = this.getCache(this.query),
					data = this.data(raw);

				this.render(data);

				return;
			}

			this.fetch(this.query);
		},

		select: function (value) {

			var data = value;

			if (typeof value === 'string') {
				data = this.decodeValue(value);
			}
			console.info('data', data)
			if (this.exists(data) !== true) {

				if (this.limit < 2) {
					this.clear();
				}

				if (this.capacity) {
					this.shadow.addClass('capacity');
					this.emit('capacity');
				}
				else {
					this.shadow.removeClass('capacity');
					this.selections.push(data);
					this.updateRoot().emit('change');
				}

				this.hide();
			}

			return this;
		},

		deselect: function (value) {

			var data = value;

			if (typeof value === 'string') {
				data = this.decodeValue(value);
			}

			var result = false;
			this.each(this.selections, function (i, o) {
				if (o.value === data.value) {
					result = true; return -1;
				}
			});

			if (result) {
				this.shadow.removeClass('capacity');
				this.updateRoot().emit('change');
			}
			return this;
		},

		exists: function (data) {

			data = data || {};

			var result = false;

			this.each(this.selections, function (i, s) {
				if (s.value === data.value) {
					result = true; return false;
				}
			});

			return result;
		},

		blur: function () {

			this.super();

			if (this.anything && (this.selections.length < 1 || (this.capacity && this.limit < 2))) {

				var input = this.input,
					value = {label: input.val(), value: input.val()};

				this.select(this.encodeValue(value));
			}
		},

		updateRoot: function () {

			if (this.config.useJSON) {
				this.element.value = JSON.stringify(this.selections);
			}
			else {

				var values = [];

				this.each(this.selections, function (i, o) {
					values.push(o.value);
				});
				this.element.value = values.join('|||');
			}
			return this;
		},

		loading: function (show) {

			var method = show && 'addClass' || 'removeClass';
			this.shadow[method]('loading');

			return this;
		},

		clear: function (data) {

			if (data && data.value) {
				this.each(this.selections, function (i, s) {
					if (s.value === data.value) {
						return -1;
					}
				});
			}
			else {
				this.selections.splice(
					0, this.selections.length);
			}

			this.emit('clear');

			return this;
		},

		fetch: function (query) {

			if (this.config.remote) {

				if (this.timer) {
					clearTimeout(this.timer);
					this.timer = null;
				}

				this.timer = this.delay(function () {

					this.emit('fetch.before', q);

					var q = query,
						url = this.format('__remote__', {'%query': q}),
						thiss = this;

					$.ajax({
						url: url,
						type: 'get',
						dataType: this.config.type,
						complete: function (x, c) {
							thiss.complete(q, x, c);
						},
						error: function (x) {
							thiss.error(q, x);
						},
						success: function (d, c, x) {
							thiss.success(q, d, c, x);
						}
					});

				}, this.config.time);
			}
		},

		complete: function (query, xhr, code) {
			this.emit('fetch.complete', query, xhr, code);
		},

		error: function (query, xhr) {
			this.emit('fetch.error', query, xhr);
		},

		success: function (query, data, code, xhr) {

			this.emit('fetch.success', query, data, code, xhr);

			this.setCache(query, data);
			this.render(this.data(query));
		},

		render: function (data) {

			data = data || {};
			data.list = data.list || {};
			data.list.items = data.list.items || [];

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

			return this;
		}
	});

	return mk.get('Autocomplete');
});