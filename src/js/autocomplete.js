/*

	Selectmenu
	Dependencies: core

	Events:

	<event:render>
		<desc>Fired when data has been retrieved and the list is ready to be built. Binding this event replaces the original rending with your own, custom, rendering.</desc>
		<example>
			instance.on('render', function (data) {
				console.info(data);
			});
		</example>
	</event:render>

	<event:change>
		<desc>Fires when autocomplete value changes.</desc>
		<example>
			instance.on('change', function () {
				console.info('base 64:', this.value);
				console.info('raw objects:', this.selections);
			});
		</example>
	</event:change>

	<event:show>
		<desc>Fired when menu is shown.</desc>
		<example>
			instance.on('show', function () {
				console.info('Menu has opened!');
			});
		</example>
	</event:show>

	<event:hide>
		<desc>Fired when menu is hidden.</desc>
		<example>
			instance.on('hide', function () {
				console.info('Menu has closed!');
			});
		</example>
	</event:hide>

	<event:activate>
		<desc>Fired when an option becomes active.</desc>
		<example>
			instance.on('activate', function (option, keyboard) {
				console.info('active option:', option);
				console.info('came from keyboard (vs mouse):', keyboard);
			});
		</example>
	</event:activate>

	<event:disabled>
		<desc>Fired when selectmenu is disabled, if previously enabled.</desc>
		<example>
			instance.on('disabled', function () {
				console.info('Selectmenu has been diabled.');
			});
		</example>
	</event:disabled>

	<event:enabled>
		<desc>Fired when selectmenu is enabled, if previously disabled.</desc>
		<example>
			instance.on('enabled', function () {
				console.info('Selectmenu has become enabled.');
			});
		</example>
	</event:enabled>

	<event:update>
		<desc>Fired when updates are made to the rendered UI through the use of update().</desc>
		<example>
			instance.on('update', function () {
				console.info('Changes to the native select have been applied to the UI.');
			});
		</example>
	</event:update>

	<event:capacity>
		<desc>Fired when you've reached the selection limit. Does not fire for single selects.</desc>
		<example>
			instance.on('capacity', function () {
				console.info('We reached capacity!');
			});
		</example>
	</event:capacity>

	<event:create.label>
		<desc>Fired when the trigger input value (label) changes.</desc>
		<example>
			instance.on('create.label', function (o) {
				o.label = o.node.text() + ' new label!';
			});
		</example>
	</event:create.label>

	<event:request.before>
		<desc>Fired before ajax requests search is invoked.</desc>
		<example>
			instance.on('request.before', function (query) {
				console.info('about to searhc for ', query);
			});
		</example>
	</event:request.before>

	<event:request.error>
		<desc>Fired before ajax requests search is invoked.</desc>
		<example>
			instance.on('request.error', function (query, xhr) {
				console.info('request failed for ', query);
			});
		</example>
	</event:request.error>

	<event:request.complete>
		<desc>Fired when a data request has completed</desc>
		<example>
			instance.on('request.complete', function (query, xhr, code) {
				console.info('successful seach for ', query);
			});
		</example>
	</event:request.complete>

	<event:request.success>
		<desc>Fired when data is ready to be cached and used by autocomplete.</desc>
		<example>
			instance.on('request.success', function (query, data, code, xhr) {
				this.each(data, function (i, o) {
					o.value = o.originalProperty;
					o.label = o.originalPropertyLabel;
				});
			});
		</example>
	</event:request.success>
*/
(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( [ 'mk'], function ( mk ) {
			return factory( root, mk );
		});
	}

	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {

		module.exports = factory( root, require('mk'));
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		return factory( root, root.Mk );
	}

})( typeof window !== "undefined" ? window : this, function ( root, mk ) {

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

		/*
			<property:rootinput>
				<desc>This is your wrapped input, living in the root container.</desc>
			</property:rootinput>
		*/

		get rootinput () {
			return this.node('', this.root);
		},

		/*
			<property:element>
				<desc>This is your raw input, living in the root container.</desc>
			</property:element>
		*/

		get element () {
			return this.rootinput[0];
		},

		/*
			<property:tagroot>
				<desc>The wrapped root element holding tags.</desc>
			</property:tagroot>
		*/

		get tagroot () {
			return this.shadow.find(
				this.selector('tags'));
		},

		/*
			<property:tags>
				<desc>The wrapped collection of UI tags.</desc>
			</property:tags>
		*/

		get tags () {
			return this.tagroot.find(
				this.selector('tag'));
		},

		/*
			<property:live>
				<desc>The wrapped live element responsible for updating screen reader users with atomic information.</desc>
			</property:live>
		*/

		get live () {
			return this.shadow.find(
				this.selector('live'));
		},

		/*
			<property:notifications>
				<desc>Similar to the live element, but hold notifications such as when a request fails.</desc>
			</property:notifications>
		*/

		get notifications () {
			return this.shadow.find(
				this.selector('notifications'));
		},

		/*
			<property:isLoading>
				<desc>Boolean representing if the autocomplete is requesting data.</desc>
			</property:isLoading>
		*/

		get isLoading () {
			return this.shadow.hasClass('loading');
		},

		/*
			<property:limit>
				<desc>Number of selections an autocompelete instance can have</desc>
			</property:limit>
		*/

		get limit () {
			return this.config.limit;
		},

		/*
			<property:doubledelete>
				<desc>Boolean representing whether doubledelete is enabled.</desc>
			</property:doubledelete>
		*/

		get doubledelete () {
			return this.config.doubledelete;
		},

		/*
			<property:multiple>
				<desc>Boolean representing if the use can select more than one result.</desc>
			</property:multiple>
		*/

		get multiple () {
			return this.limit > 1;
		},

		/*
			<property:capacity>
				<desc>Boolean representing if the autocomplete is at max selections.</desc>
			</property:capacity>
		*/

		get capacity () {
			return this.selections.length >= this.limit;
		},

		/*
			<property:anything>
				<desc>Boolean representing if the autocomplete will accept any value or only a value from the result list.</desc>
			</property:anything>
		*/

		get anything () {
			return this.config.anything;
		},

		/*
			<property:value>
				<desc>String value set on your root's input element. The value is flattened, which means it's an object that's been base64 encoded.</desc>
			</property:value>
		*/

		get value () {

			if (this.selections.length > 0) {

				if (this.multiple) {
					return this.flatten(this.selections);
				}

				return this.flatten(this.selections[0]);
			}

			return null;
		},

		/*
			<property:isEmpty>
				<desc>Boolean representing if we have no results.</desc>
			</property:isEmpty>
		*/

		get isEmpty () {
			return this.items.length < 1;
		},

		/*
			<property:deletecount>
				<desc>How many times delete has been pressed in a row. Used with doubledelete.</desc>
			</property:deletecount>
		*/

		deletecount: 0,

		/*
			<property:selections>
				<desc>Array of objects holding the value/label pairs currently selected.</desc>
			</property:selections>
		*/

		selections: null,

		/*
			<property:requests>
				<desc>How many requests have been kicked off in total.</desc>
			</property:requests>
		*/

		requests: 0,

		/*
			<property:cache>
				<desc>Object containing all cached requests.</desc>
			</property:cache>
		*/

		cache: null,

		/*
			<property:query>
				<desc>The current query string.</desc>
			</property:query>
		*/

		query: '',

		_verifyTag: function (n) {

			var node = this.node('', n);

			if (node.length < 1 ||
				node[0].tagName.toLowerCase() !== 'input') {
				throw new Error(':: Mk.Autocomplete - root must have a text <input> node ::');
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

		_config: function (o, internal) {

			o = o || {};

			var input = this.rootinput;

			o.data = o.data || null;

			this
			._param('remote', 'string', o, null, input)
			._param('type', 'string', o, 'json', input)
			._param('limit', 'number', o, 1, input)
			._param('time', 'number', o, 500, input)
			._param('doubledelete', 'boolean', o, o.limit > 1, input)
			._param('anything', 'boolean', o, true, input)
			._param('comma', 'boolean', o, false, input)
			._param('notags', 'boolean', o, false, input);

			if (internal !== true) {
				this.super(o);
			}
		},

		_build: function() {

			this.super();

			this.input.attr('placeholder',
				this.rootinput.attr('placeholder'));

			this.updateTagroot();
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

			var thiss = this;

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

		updateTagroot: function () {

			var tagMethod = 'removeClass',
				ariaHidden = 'false';

			if (this.config.notags) {
				tagMethod = 'addClass';
				ariaHidden = 'true';
			}

			this.shadow[tagMethod]('no-tags');
			this.tagroot.attr('aria-hidden', ariaHidden);

			return this;
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

		/*
			<method:move>
				<invoke>.move([up])</invoke>
				<desc>Move the active list item up or down from the currently activated.</desc>
			</method:move>
		*/

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

		/*
			<method:flatten>
				<invoke>.flatten(value)</invoke>
				<param:value>
					<type>Object</type>
					<desc>Object to convert to a flattened string.</desc>
				</param:value>
				<desc>Invokes JSON.stringify and btoa on an object.</desc>
			</method:flatten>
		*/

		flatten: function (value) {
			return btoa(JSON.stringify(value));
		},

		/*
			<method:unflatten>
				<invoke>.unflatten(value)</invoke>
				<param:value>
					<type>String</type>
					<desc>String to convert back into an object.</desc>
				</param:value>
				<desc>Invokes atob and JSON.parse on a string.</desc>
			</method:unflatten>
		*/

		unflatten: function (value) {
			return JSON.parse(atob(value));
		},

		/*
			<method:label>
				<invoke>.label([n])</invoke>
				<param:n>
					<type>Node/undefined</type>
					<desc>Pulls the label value out of a Node. Uf undefined, pulls the current label value. Default is undefined.</desc>
				</param:n>
				<desc>Invokes atob and JSON.parse on a string.</desc>
			</method:label>
		*/

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

		/*
			<method:hasCache>
				<invoke>.hasCache(key)</invoke>
				<param:key>
					<type>string</type>
					<desc>a previously searched query.</desc>
				</param:key>
				<desc>Returns true when cache exists for a query, false when it does not.</desc>
			</method:hasCache>
		*/

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

		/*
			<method:getCache>
				<invoke>.getCache(key)</invoke>
				<param:key>
					<type>string</type>
					<desc>a previously searched query.</desc>
				</param:key>
				<desc>Returns data for a previously cached query.</desc>
			</method:getCache>
		*/

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

		/*
			<method:setCache>
				<invoke>.getCache(key, data)</invoke>
				<param:key>
					<type>string</type>
					<desc>a string represending query text.</desc>
				</param:key>
				<param:data>
					<type>Object/Array</type>
					<desc>Object to be cached.</desc>
				</param:fata>
				<desc>Caches object for a given query.</desc>
			</method:setCache>
		*/

		setCache: function (key, data) {
			return this.cache[(key || '').toLowerCase()] = data;
		},

		/*
			<method:pop>
				<invoke>.pop()</invoke>
				<desc>Pop a selection from the current collection.</desc>
			</method:pop>
		*/

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

		/*
			<method:comma>
				<invoke>.comma(value)</invoke>
				<param:value>
					<type>String</type>
					<desc>a string represending query text.</desc>
				</param:value>
				<desc>Run the comma parsing on a string value. Only works when anything flag is true.</desc>
			</method:pop>
		*/

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

		/*
			<method:search>
				<invoke>.search(key, add)</invoke>
				<param:key>
					<type>String</type>
					<desc>a string representing query text.</desc>
				</param:key>
				<param:add>
					<type>Boolean</type>
					<desc>Add the the current query, or replace the current query. Default is false (replace).</desc>
				</param:add>
				<desc>Runs a search for the query.</desc>
			</method:search>
		*/

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

		/*
			<method:clear>
				<invoke>.clear()</invoke>
				<desc>Clear query, list results, and close the menu.</desc>
			</method:clear>
		*/

		clear: function () {

			this.items.remove();
			this.live.text('');
			this.hide();

			return this;
		},

		/*
			<method:show>
				<invoke>.show()</invoke>
				<desc>Shows the menu.</desc>
			</method:show>
		*/

		/*
			<method:hide>
				<invoke>.hide()</invoke>
				<desc>Hides the menu</desc>
			</method:hide>
		*/

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

		/*
			<method:select>
				<invoke>.select(value)</invoke>
				<param:value>
					<type>String</type>
					<desc>a flattened string representing a selection object.</desc>
				</param:value>
				<desc>Selects a value from results, or a custom value provided by you.</desc>
			</method:select>
		*/

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

		/*
			<method:deselect>
				<invoke>.deselect(value)</invoke>
				<param:value>
					<type>String</type>
					<desc>a flattened string representing a selection object.</desc>
				</param:value>
				<desc>Deselects a value from results, or a custom value provided by you.</desc>
			</method:deselect>
		*/

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
			this.abort().loading(false);
			return this;
		},

		tag: function (data, remove) {

			var flattened = this.flatten(data),
				pointer = {label: data.label, value: flattened, raw: data};

			if (remove) {
				this.tags.filter('[data-value="' + flattened + '"]').remove();
			}
			else {

				this.emit('create.taglabel', pointer);

				this.tagroot.append(
					this.html('tag', pointer));
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

		/*
			<method:removeAll>
				<invoke>.removeAll()</invoke>
				<desc>Removes all selections.</desc>
			</method:removeAll>
		*/

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

		/*
			<method:abort>
				<invoke>.abort()</invoke>
				<desc>Aborts current request.</desc>
			</method:abort>
		*/

		abort: function () {

			if (this.timer) {

				clearTimeout(this.timer);

				this.timer = null;
				this.requests -= 1;
				this.loading(false);
			}
			return this;
		},

		/*
			<method:request>
				<invoke>.request(query)</invoke>
				<param:query>
					<type>String</type>
					<desc>String representing text to query on.</desc>
				</param:query>
				<desc>Bypasses the logic in search() and kicks off request for query.</desc>
			</method:request>
		*/

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

			return this.loading(
				false, query, data.list.items.length);
		},

		update: function () {

			this._config(this.config);
			this.super();

			this.input.attr('placeholder',
				this.rootinput.attr('placeholder'));

			this.updateTagroot();
		}
	});

	return mk.get('Autocomplete');
});
