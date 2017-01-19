/*
	<depedency:Core>
		<src>dist/js/core.js</src>
		<docs>../</docs>
	</depedency:Core>
	<depedency:Selectmenu>
		<src>dist/js/selectmenu.js</src>
		<docs>./docs/selectmenu.html</docs>
	</depedency:Selectmenu>
	<file:js>
		<src>dist/js/autocomplete.js</src>
	</file:js>
	<file:css>
		<src>dist/css/autocomplete.css</src>
	</file:css>
	<file:less>
		<src>dist/less/autocomplete.less</src>
	</file:less>
	<file:scss>
		<src>dist/scss/autocomplete.scss</src>
	</file:scss>
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
	<event:create.tag>
		<desc>Fired when the trigger input value (label) changes.</desc>
		<example>
			instance.on('create.tag', function (o) {
				o.label = 'New Label!';
			});
		</example>
	</event:create.tag>
	<event:request.send>
		<desc>Used when hooking into request logic to send requests to the server for data.</desc>
		<example>
			instance.on('request.send', function (query, requestnumber) {
				console.info('about to search for ', query);
			});
		</example>
	</event:request.send>
	<event:request.error>
		<desc>Since remote requests are left the end developers, this event must be emit by the end developer as well, typically in an error handler. Since the end developer emits this event, you may pass in any arguments you like.</desc>
		<example>
			instance.on('request.error', function () {
				console.info('request failed');
			});
		</example>
	</event:request.error>
	<event:request.abort>
		<desc>Fired when a request is being aborted.</desc>
		<example>
			instance.on('request.abort', function () {
				console.info('my request is being aborted due to new user actions.');
			});
		</example>
	</event:request.abort>
*/
(function ( root, factory ) {

	if (typeof define === 'function' && define.amd) {
		define(['mk-ui', 'mk-ui/Selectmenu'], function (mk, Selectmenu) {
			return factory( root, mk, Selectmenu );
		});
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory(root, require('mk-ui'), require('mk-ui/Selectmenu'));
	}
	else {
		return factory(root, root.Mk, root.Mk.Selectmenu);
	}

})(typeof window !== "undefined" && window || this, function (root, mk, Selectmenu) {

    if (typeof Selectmenu === 'undefined') {
        throw new Error('Mk.Autocomplete: Selectmenu base class not found.');
    }

    mk.create('Autocomplete', Selectmenu, {

        name: 'mk-ac',

        NOTIFY_STATES: {
            EMPTY: 0,
            ERROR: 1,
            CAPACITY: 2,
            LOADING: 3,
            LOADED: 4,
            ABORT: 5
        },

		templates: {

			shadow:
				'<div class="{{$key}}-shadow">\
					{{template:tags}}\
					{{template:trigger}}\
					{{scope:list}}{{template:list}}{{/scope:list}}\
					{{template:notifications}}\
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
						data-value="{{$value}}">\
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
			<property:empty>
				<desc>Boolean representing if we have no results.</desc>
			</property:empty>
		*/

		get empty () {
			return this.items.length < 1;
		},

        /*
			<property:remote>
				<desc>Boolean representing if our instance is equipt to make XHR requests for data.</desc>
			</property:remote>
		*/

        get remote () {

			var ev = this.events.request || [];

			return this.first(ev, function (e) {
				if (e.namespace === '.send') {
					return true;
				}
			});
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

        verifyRoot: function (n) {

			var node = this.node('', n);

			if (!this.node('', n).is('input')) {
				throw new Error(':: Mk.Autocomplete - root must have a text <input> node ::');
			}
			return true;
		},

		define: function (r, o) {

			this.query = '';
			this.selections = [];
			this.requests = 0;
			this.cache = {};

			this.super(r, o);
		},

		configure: function (o, internal) {

			o = o || {};
            o.data = o.data || null;

			var input = this.rootelement,
                label = input.attr('aria-label') || this.formats.label;

			this
            .param('label', 'string', o, label, input)
			.param('limit', 'number', o, 1, input)
			.param('time', 'number', o, 500, input)
			.param('doubledelete', 'boolean', o, o.limit > 1, input)
			.param('anything', 'boolean', o, true, input)
			.param('comma', 'boolean', o, false, input)
			.param('notags', 'boolean', o, false, input);

			if (internal !== true) {
				this.super(o);
			}
		},

		/*
			<method:unmount>
				<invoke>.unmount()</invoke>
				<desc>Remove all mounted nodes, data, events, and cache associated with the Autocomplete instance to free up memory and resources.</desc>
			</method:unmount>
		*/

		unmount: function () {

			//remove mounted shadow element, which
			//will also remove all data and events to any/all
			//element inside it.
			this.shadow.remove();

			//remove all references to
			//objects and function pointers
			this.shadow =
			this.events =
			this.config =
			this.selections =
			this.cache =
			this.root = null;
		},

        build: function () {

            this.super();

            this.input.attr('placeholder',
                this.rootelement.attr('placeholder'));

			this.updateTagroot();
		},

        updateTagroot: function () {

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

        bind: function () {

			this.on('request.error', this.error);

            this.bindInputEvents();
            this.bindListEvents();
            this.bindLabelEvents();
        },

        bindLabelEvents: function () {

			var thiss = this;

			this.tagroot.on('click.mk', '[data-action="remove"]', function (e) {
				e.preventDefault();
				thiss.deselect(this.getAttribute('data-value'));
			});
		},

        bindInputEvents: function () {

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

		_esc: function (e) {

			this.notify();
			this.super(e);
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

			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
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
				return this._popByDelete().abort().clear();
			}

			this.deletecount = 0;

            // if user hit the comma, is allowed to input anything, and commas are enabled
            // allow the input of the comma and split up the values to be entered as selections
			if (w === k.comma && this.anything && this.config.comma) {
				return this._comma(v);
			}

			this.timer = this.delay(function () {
				// do standard search behaviors
				return this.search(v);
			}, this.config.time);
        },

		_space: function (e) {

			if (!this.timer && this.isHidden && this.items.length > 0) {
				e.preventDefault();
				this.show();
			}
		},

        _enter: function (e) {

            e.preventDefault();

			var a = this.items.find('.active'),
                i = a.data('value'),
				v = this.input.val(),
				h = this.isHidden;

			if (v && h && this.anything) {

				return this.abort().select(this.flatten({
					label: v,
					value: v
				}));
			}

			if (h && !this.empty) {
				return this.show();
			}

			//if we have an active element
			if (a.length) {
				//if the active element has not already been selected
				if (a.attr('aria-selected') !== 'true') {
					this.select(i);
				}
				//if it has been selected and we're a multple
				else if (this.multiple) {
					this.deselect(i);
				}
				// or just open the list results
				else {
					return this.show();
				}
			}
			//after selection, hide the list results if we're a single select
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

		_comma: function (value) {

			var values = value.split(/\,\s{0,}/),
				first = true,
				added = false;

			this.each(values, function (v) {

				if (v) {
                    //abort any requsts that may be in progress
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
                //clear all request logic
				this.abort().clear();

                //remove input text if we're allowing multiple selections
                if (this.multiple) {
				    this.input.val('');
                }
			}
			return this;
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

			if (this.empty) {

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
				this.render(this.getCache(q), q);
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

                this.abort();
				this.notify(this.NOTIFY_STATES.LOADING, this.query);
	            this.emit('request.send', this.query, ++this.requests);
                return;
            }

            this.render([], this.query);
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
					items: this.prepData(data, query)
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
				//string escape patterns throw errors
				//so we must replace the escape character with doubles.
				var reg = new RegExp(key.replace(/\\/g, '\\\\'), 'i');

				return this.filter(data, function (o, i) {
					if (reg.test(o.label) || reg.test(o.value)) {
						return o;
					}
				});
			}

			return data;
        },

        /*
			<method:prepData>
				<invoke>.prepData(data[, query])</invoke>
				<param:data>
					<type>Array</type>
					<desc>An array of (typically) objects. Objects must contain a 'value' and 'label' property for templating and mapping.</desc>
				</param:data>
				<param:query>
					<type>String</type>
					<desc>A text term used for term highlighting results for the user.</desc>
				</param:query>
				<desc>Prep a date set for use with templating and user interactions.</desc>
			</method:prepData>
		*/

        prepData: function (data, query) {

            var set;

            return this.map(data, function (obj) {

                //copy object properties
                set = this.map(obj, function (value, key) {
                    return value;
                });

                //add new properties
                set.$value = this.flatten({
                    label: obj.label,
                    value: obj.value
                });
                //term highlighting
                set.highlight = query || '';
                //item ids (templating)
                set.id = this.uid();

                return set;
            });
		},

        /*
			<method:select>
				<invoke>.select(value[, silent])</invoke>
				<param:value>
					<type>String</type>
					<desc>a flattened string representing a selection object.</desc>
				</param:value>
				<param:silent>
					<type>Boolean</type>
					<desc>Pass true to prevent change events from triggering.</desc>
				</param:silent>
				<desc>Selects a value from results, or a custom value provided by you.</desc>
			</method:select>
		*/

		select: function (value, silent) {

			var data = this.unflatten(value);

			if (!this.exists(data.value)) {

				if (this.limit < 2) {
					this.deselectAll(true);
				}

				if (this.capacity) {

					this.notify(this.NOTIFY_STATES.CAPACITY);

                    if (!silent) {
					    this.emit('capacity', this.selections);
                    }
				}
				else {

					this.shadow.removeClass('capacity');
					this.selections.push(data);
					this.tag(data).updateRoot();
					this.notify();

                    if (!silent) {
                        this.emit('change', data);
                    }
				}
				this.hide();
			}
			return this;
		},

		/*
			<method:deselect>
				<invoke>.deselect(value[, silent])</invoke>
				<param:value>
					<type>String</type>
					<desc>a flattened string representing a selection object.</desc>
				</param:value>
				<param:silent>
					<type>Boolean</type>
					<desc>Pass true to prevent change events from triggering.</desc>
				</param:silent>
				<desc>Deselects a value from results, or a custom value provided by you.</desc>
			</method:deselect>
		*/

		deselect: function (value, silent) {

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
				this.tag(data, true).updateRoot();

                if (!silent) {
                    this.emit('change', data);
                }
			}
			return this;
		},

        /*
			<method:deselectAll>
				<invoke>.deselectAll([silent])</invoke>
				<desc>Removes all current selections.</desc>
				<param:silent>
					<type>Boolean</type>
					<desc>Pass true to prevent change events from triggering.</desc>
				</param:silent>
			</method:deselectAll>
		*/

		deselectAll: function (silent) {

            var s = this.selections;

			if (s.length > 0) {

				var removed = s.splice(0, s.length);

				this.notify();
				this.tags.remove();

                if (!silent) {
	                this.emit('change', removed);
                }
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
			<method:abort>
				<invoke>.abort()</invoke>
				<desc>Invokes the abort event to let end developer know they should cancel their current request, if any.</desc>
			</method:abort>
		*/

        abort: function () {

            this.emit('request.abort', --this.requests);
            this.notify(this.NOTIFY_STATES.ABORT);

            return this;
        },

		/*
			<method:error>
				<invoke>.error()</invoke>
				<desc>Method invoked when request error event is emit. When making requests for search term data, if an error occurs, emit the error event to invoke this functionality.</desc>
			</method:error>
		*/

		error: function () {

			//remove live node text
			this.notify(this.NOTIFY_STATES.ABORT);

			//update notification node text
			this.notify(this.NOTIFY_STATES.ERROR, query);

			//hide the list results
			return this.hide();
		},

        /*
			<method:blur>
				<invoke>.blur()</invoke>
				<desc>Invokes XHR abort event and stops internal loading processes.</desc>
			</method:blur>
		*/

        blur: function () {
			return this.abort();
		},

        /*
			<method:clear>
				<invoke>.clear()</invoke>
				<desc>Clears screen reader text, list results, and close the menu.</desc>
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

				this.abort().tag(data, true);

				return data;
			}
			return null;
		},

        /*
			<method:notify>
				<invoke>.notify(type[, query])</invoke>
				<desc>Sends text notifications to the screen reader about the state of the Autocomplete. Also applies state classes (request loading for example) to the Autocomplete.</desc>
				<param:type>
					<type>CONSTANT</type>
					<desc>CONSTANT value from instance.NOTIFY_STATES which determines what format text to use for screen readers and user message updating.</desc>
				</param:type>
				<param:query>
					<type>String</type>
					<desc>Used in the format text for screen readers and user message updates.</desc>
				</param:query>
				<param:count>
					<type>Number</type>
					<desc>Result count. Only used for the NOTIFY_STATES.LOADED type representing the number of results returned from the request.</desc>
				</param:count>
			</method:notify>
		*/

        notify: function (type, query, count) {

            query = query || this.query;
            count = count || null;

            var data = {query: query, count: count, highlight: query},
                states = this.NOTIFY_STATES,
                format = '',
                live = false;

            switch (type) {

                case states.EMPTY:
                    format = 'empty'; break;
                case states.ERROR:
                    format = 'error'; break;
                case states.CAPACITY:
                    format = 'capacity'; break;
                case states.LOADING:
                    format = 'loading'; live = true; break;
                case states.LOADED:
                    format = 'loaded'; live = true; break;
                case states.ABORT:
                    live = true; break;
            }

            if (live) {

				this.live.text('');

                if ((type === states.LOADING && query) || (query && count !== null)) {
                    this.live.text(this.format(format, data));
                }

                this.shadow[type === states.LOADING && 'addClass' || 'removeClass']('loading');
            }
            else {
	             this.notifications.html(this.format(format, data));
            }
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

				this.emit('create.tag', pointer);

				this.tagroot.append(
					this.html('tag', pointer));
			}
			return this;
		},

		/*
			<method:updateRoot>
				<invoke>.updateRoot()</invoke>
				<desc>Updates the root input to reflect the current Autocomplete selections.</desc>
			</method:updateRoot>
		*/

		updateRoot: function () {
			this.element.value = this.value;
			return this;
		},

		/*
			<method:render>
				<invoke>.render(data[, query])</invoke>
				<desc>Renders a result list based off the data parameter provided</desc>
				<param:data>
					<type>Array</type>
					<desc>Array of data objects to create a list from. Data objects must contain a 'label' and 'value' property.</desc>
				</param:data>
				<param:query>
					<type>String</type>
					<desc>The query term representing the data set. Used for screen readers. If not provided, default is instance.query property.</desc>
				</param:query>
			</method:render>
		*/

        render: function (data, query) {

            data = data || [];
            query = query || this.query;

			var preppedData = this.prepData(data, query);

			this.items.remove();

			//if we have no data,
			//notify user and hide list if vidible.
            if (preppedData.length < 1) {

				//remove live node text
				this.notify(this.NOTIFY_STATES.ABORT);

				//update notification node text
                this.notify(this.NOTIFY_STATES.EMPTY, query);

				//hide the list results
				return this.hide();
            }

			if (this.events.render && this.events.render.length > 0) {
				this.emit('render', preppedData);
			}
			else {
				this._render(preppedData);
			}
			this.notify();
            this.notify(this.NOTIFY_STATES.LOADED, query, data.length);
            return this.show();
		},

		/*
			<method:update>
				<invoke>.update()</invoke>
				<desc>Make changes to your original input then call this for the UI to consume new changes.</desc>
			</method:update>
		*/

		update: function () {

			this.configure(this.config, true);
			this.super();

			this.input.attr('placeholder',
				this.rootinput.attr('placeholder'));

			this.updateTagroot();
		}
    });

    return mk.get('Autocomplete');
});
