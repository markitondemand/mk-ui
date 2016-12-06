
(function ( root, factory ) {

	if (typeof define === 'function' && define.amd) {
		define(['mk'], function (mk) {
			return factory( root, mk );
		});
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory(root, require('mk'));
	}
	else {
		return factory(root, root.Mk);
	}

})(typeof window !== "undefined" && window || this, function (root, mk) {

    if (mk.type(mk.Selectmenu, 'undefined')) {
        throw new Error('Mk.Autocomplete: Selectmenu base class not found.');
    }

    mk.create('Autocomplete', mk.Selectmenu, {

        name: 'mk-ac',

        NOTIFY_STATES: {
            EMPTY: 0,
            ERROR: 1,
            CAPACITY: 2
        },

		templates: {

			shadow:
				'<div class="{{$key}}-shadow">\
					{{template:tags}}\
					{{template:trigger}}\
					{{template:notifications}}\
					{{scope:list}}{{template:list}}{{/scope:list}}\
				</div>',

			tags: '<ul class="{{$key}}-tags" aria-label="Current selections"></ul>',

			tag:
				'<li class="{{$key}}-tag" role="presentation" data-value="{{value}}">\
					<a href="javascript:void(0);" \
						role="button" \
						data-value="{{value}}" \
						data-action="remove" \
						aria-label="Remove {{label}}"></a>\
					{{label}}\
				</li>',

			trigger:
				'<div class="{{$key}}-trigger {{if:disabled}} disabled{{/if:disabled}}" \
					role="combobox" \
					aria-haspopup="listbox">\
					{{template:input}}\
					{{template:live}}\
				</div>',

			input:
				'<input type="text" \
					class="{{$key}}-input" \
					autocomplete="off" \
					aria-autocomplete="list" \
					{{if:disabled}}aria-disabled="true" disabled {{/if:disabled}}\
					{{if:multiple}}aria-multiselectable="true" {{/if:multiple}}\
					value="{{label}}" />',

			live:
				'<div class="{{$key}}-live sr-only" \
					aria-atomic="true" \
					aria-live="assertive">\
				</div>',

			notifications:
				'<div class="{{$key}}-notifications" \
					aria-atomic="true" \
					aria-live="assertive">\
				</div>',

			list:
				'<ul id="{{id}}" class="{{$key}}-list" role="listbox">\
					{{loop:items}}{{template:item}}{{/loop:items}}\
				</ul>',

			item:
				'<li class="{{$key}}-item" role="presentation">\
					<a id="{{id}}" \
						class="{{$key}}-option" \
						role="option" \
						href="javascript: void(0);" \
						aria-selected="{{selected}}" \
						aria-disabled="{{disabled}}" \
						data-value="{{$value}}" \
						data-display="{{value}}">\
						<span class="{{$key}}-label">\
							{{highlight:label}}\
						</span>\
						{{if:alt}}\
							<span class="{{$key}}-alt">{{alt}}</span>\
						{{/if:alt}}\
					</a>\
				</li>'
		},

		formats: {
			loading: 'Searching for {{query}}',
			loaded: '{{count}} results loaded for {{query}}',
			error: 'Whoops, looks like we\'re having issues with {{highlight:query}}',
			empty: 'No results found for {{highlight:query}}',
			capacity: 'You\'ve reached your tag limit',
            label: 'Autocomplete'
		},

		get version () {
			return 'v2.0.0';
		},

		/*
			<property:input>
				<desc>The wrapped, rendered triggering input element.</desc>
			</property:input>
		*/

		get input () {
			return this.node('input', this.shadow);
		},

        /*
			<property:tagroot>
				<desc>The wrapped root element holding tags.</desc>
			</property:tagroot>
		*/

		get tagroot () {
            return this.node('tags', this.shadow);
		},

		/*
			<property:tags>
				<desc>The wrapped collection of UI tags.</desc>
			</property:tags>
		*/

		get tags () {
            return this.node('tag', this.tagroot);
		},

		/*
			<property:live>
				<desc>The wrapped live element responsible for updating screen reader users with atomic information.</desc>
			</property:live>
		*/

		get live () {
            return this.node('live', this.shadow);
		},

		/*
			<property:notifications>
				<desc>Similar to the live element, but hold notifications such as when a request fails.</desc>
			</property:notifications>
		*/

		get notifications () {
            return this.node('notifications', this.shadow);
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
                return this.flatten(
                    this.multiple && this.selections || this.selections[0]);
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
			<property:remote>
				<desc>Boolean representing if our instance is equipt to make XHR requests for data.</desc>
			</property:remote>
		*/

        get remote () {
            return this.events.request
                && this.events.request.length > 0;
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
            o.data = o.data || null;

			var input = this.rootelement,
                label = input.attr('aria-label') || this.formats.label;

			this
            ._param('label', 'string', o, label, input)
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

        _build: function () {

            this.super();

            this.input.attr('placeholder',
                this.rootelement.attr('placeholder'));
			this._updateTagroot();
		},

        _updateTagroot: function () {

			var method = 'removeClass',
				hidden = 'false';

			if (this.config.notags) {
				method = 'addClass';
				hidden = 'true';
			}

			this.shadow[method]('no-tags');
			this.tagroot.attr('aria-hidden', hidden);

			return this;
		},

        _bind: function () {

            this._bindInputEvents();
            this._bindListEvents();
            this._bindLabelEvents();
        },

        _bindLabelEvents: function () {

			var thiss = this;

			this.tagroot.on('click.mk', '[data-action="remove"]', function (e) {
				e.preventDefault();
				thiss.deselect(this.getAttribute('data-value'));
			});
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

        _keyIsBehavior: function (w) {

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

        _keydown: function (e) {

            if (this.disabled) {
				return;
			}

			var v = this.input.val(),
                w = e.which,
				k = this.keycode;

			switch (w) {

				case k.enter:
					return this._enter(e);

				case k.space:
					return this._space(e);

				case k.esc:
					return this._esc(e);

				case k.up:
				case k.down:
					e.preventDefault();
					return this.move(w === k.up);

				case k.tab:
                    // only invoke the _tab method if the list is open,
                    // otherwise continue with native browser behavior
					if (this.isOpen) {
						return this._tab(e);
					}
			}
        },

        _keyup: function (e) {

            if (this.disabled) {
				return;
			}

            var v = this.input.val(),
                w = e.which,
				k = this.keycode,
                b = this._keyIsBehavior(w);

            if (b > -1) {
                if (b === 1) {
                    e.preventDefault();
                }
                return;
            }

            // if we are hitting backspace with no input value,
            // trigger the doubledelete functionality and pop the last value out of selections
            // if only one value is allowed to be selected, do nothing.
            if (w === k.backspace && !v) {
				return this._popByDelete().clear();
			}

			this.doubledelete = false;

            // if user hit the comma, is allowed to input anything, and commas are enabled
            // allow the input of the comma and split up the values to be entered as selections
			if (w === k.comma && this.anything && this.config.comma) {
				return this.comma(v);
			}

            // do standard search behaviors
			return this.search(v);
        },

        _enter: function (e) {

            e.preventDefault();

			var a = this.items.find('.active'),
                i = a.data('value'),
				v = this.input.val();

			if (v && a.length < 1 && this.anything) {
				return this.select(this.flatten({
					label: v,
					value: v
				}));
			}

			if (this.isHidden && !this.isEmpty) {
				return this.show();
			}

            if (a.attr('aria-selected') !== 'true') {
				this.select(i);
			}
			else if (this.multiple) {
				this.deselect(i);
			}
			else {
				return this.show();
			}

			if (!this.multiple) {
				return this.hide();
			}
        },

        _render: function (data) {

			var list = this.list;

			this.each(data, function (obj, i) {
				list.append(this.html('item', obj));
			});
		},

        _popByDelete: function () {

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
				<param:up>
					<type>Boolean</type>
					<desc>Set to true to move up the list. Default is false.</desc>
				</param:up>
				<desc>Move the active list item up or down from the currently activated.</desc>
			</method:move>
		*/

		move: function (up) {

			if (this.isEmpty) {

				if (this.hasCache()) {
					this.search();
				}
				else {
					return;
				}
			}

			if (this.isHidden) {
				return this.show();
			}

			var active = this.items.find('.active')[0],
				index = this.index(active) + (up && -1 || 1);

			if (!active) {
				index = 0;
			}

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

        /*
			<method:search>
				<invoke>.search(key[, add])</invoke>
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

            var q = key = (key || '');

			if (add === true) {
				q = (this.query || '') + key;
			}

			this.query = q;

			if (this.hasCache(q)) {
				this.render(q, this.getCache(q));
				return;
			}

			if (q) {
				this.request();
			}
		},

        /*
			<method:request>
				<invoke>.request()</invoke>
				<desc>Invokes the request event handlers associated with the autocomplete instance. If your autocomplete uses dynaimc data (API endpoints), setup a requset event to hook your requset into.</desc>
			</method:request>
		*/

        request: function () {

            if (this.remote) {
                this.emit('request', this.query);
                // TODO: setup loading flags
                return;
            }
            // TODO: render no results
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
			return value && btoa(JSON.stringify(value)) || '';
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
			return value && JSON.parse(atob(value)) || {};
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

            // if we do not have a key or we do not have dynamic data (request handlers)
            // and we have a data object (prefefined data) then yes, we have cache
			if ((!key || !this.remote) && this.config.data) {
				return true;
			}
            // if we have cache for the key provided,
            // then yes we have cache
			if (this.cache.hasOwnProperty(key)) {
				return true;
			}
            // we have nothing
			return false;
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

            // if we dont have a key or we dont have a remote setup,
            // but we have predefined data, return the predefined data.
			if ((!key || !this.remote) && this.config.data) {
				return this.filterData(key, this.config.data);
			}
            // if we have data cached for the key,
            // give us that data
			if (this.cache.hasOwnProperty(key)) {
				return this.cache[key];
			}
            // nothing found
			return null;
		},

		/*
			<method:setCache>
				<invoke>.setCache(key, data)</invoke>
				<param:key>
					<type>string</type>
					<desc>a string represending query text.</desc>
				</param:key>
				<param:data>
					<type>Object/Array</type>
					<desc>Object to be cached.</desc>
				</param:data>
				<desc>Caches object for a given query.</desc>
			</method:setCache>
		*/

		setCache: function (key, data) {
			return this.cache[(key || '').toLowerCase()] = data;
		},

        /*
			<method:data>
				<invoke>.data([value])</invoke>
				<param:value>
					<type>String</type>
					<desc>Cache key for query data. Empty will give you static data (if provided).</desc>
				</param:value>
				<desc>Generate a JSON representation of the current autocomplete state.</desc>
			</method:data>
		*/

		data: function (data) {

			data = data || this.getCache();

			var query = this.rootelement.val();

			if (typeof data === 'string') {
				query = data;
				data = this.getCache(data);
			}

            var cls = [].slice.apply(this.element.classList),
				id = this.shadow && this.shadow.attr('id') || this.uid();

            cls.splice(cls.indexOf(this.name), 1);

			return {
				classname: cls.join(' '),
				multiple: this.multiple,
				disabled: this.disabled,
				list: {
					id: id,
					items: this.buildListData(data, query)
				}
			};
		},

        /*
			<method:filterData>
				<invoke>.filterData(key, data)</invoke>
				<param:key>
					<type>String</type>
					<desc>a string represending query text.</desc>
				</param:key>
				<param:data>
					<type>Array</type>
					<desc>A dataset as Array (typically of objects).</desc>
				</param:data>
				<desc>Filters a dataset by query text.</desc>
			</method:filterData>
		*/

        filterData: function (key, data) {

			if (key) {

				var reg = new RegExp(key, 'i');

				return this.filter(data, function (o, i) {
					if (reg.test(o.label) || reg.test(o.value)) {
						return o;
					}
				});
			}

			return data;
        },

        buildListData: function (data, query) {

			data = data || [];

			this.each(data, function (o, i) {

				o.$value = o.$value || this.flatten({
					value: o.value,
					label: o.label
				});

				o.highlight = query || '';
				o.id = o.id || this.uid();
			});

			return data;
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

			if (!this.exists(data.value)) {

				if (this.limit < 2) {
					this.deselectAll();
				}

				if (this.capacity) {
					this.notify(this.NOTIFY_STATES.CAPACITY);
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

			this.each(this.selections, function (o, i) {
				if (o.value === data.value) {
					result = true;
					return -1;
				}
			});

			if (result) {
				this.notify();
				this.tag(data, true).updateRoot().emit('change');
			}
			return this;
		},

        /*
			<method:deselectAll>
				<invoke>.deselectAll()</invoke>
				<desc>Removes all current selections.</desc>
			</method:deselectAll>
		*/

		deselectAll: function () {

            var s = this.selections;

			if (s.length > 0) {

				var removed = s.splice(0, s.length);

				this.notify();
				//this.tags.remove();
				this.emit('change', removed);
			}
			return this;
		},

		/*
			<method:exists>
				<invoke>.exists(value)</invoke>
				<param:value>
					<type>Object</type>
					<desc>Object with a property named 'value' to check for selection matches.</desc>
				</param:value>
				<desc>Check raw object against autocomplete selections for a match.</desc>
			</method:exists>
		*/

		exists: function (value) {

			return this.first(this.selections, function (o, i) {
				if (o.value === value) {
					return true;
				}
			});
			return false;
		},

        /*
			<method:blur>
				<invoke>.blur()</invoke>
				<desc>Invokes XHR abort event and stops internal loading processes.</desc>
			</method:blur>
		*/

        blur: function () {
			//this.abort().loading(false);
			return this;
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

				this.tag(data, true);

				return data;
			}
			return null;
		},

        /*
			<method:notify>
				<invoke>.notify(type[, query])</invoke>
				<desc>Sends text notifications to the screen reader about the state of the Autocomplete.</desc>
			</method:notify>
		*/

        notify: function (type, query) {

            query = query || this.query;

            var data = {},
                states = this.NOTIFY_STATES,
                format = '';

            switch (type) {
                case states.EMPTY:
                    format = 'empty'; break;
                case states.ERROR:
                    format = 'error'; break;
                case states.CAPACITY:
                    format = 'capacity'; break;
            }

			this.notifications.html(
				this.format(format, data));

			return this;
		},

        tag: function (data, remove) {

			var flattened = this.flatten(data),
				pointer = {
                    label: data.label,
                    value: flattened,
                    raw: data
                };

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

        render: function (query, data) {

			data = data || [];

			this.items.remove();

			this.notify();

			if (this.events.render && this.events.render.length > 0) {
				this.emit('render', data);
			}
			else {
				this._render(data);
			}

			this.show();

			//return this.loading(
				//false, query, data.list.items.length);

            return this;
		}
    });

    return mk.get('Autocomplete');
});
