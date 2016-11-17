/*
	<depedency:Core>
		<src>dist/js/core.js</src>
		<docs>/</docs>
	</depedency:Core>
	<file:js>
		<src>dist/js/selectmenu.js</src>
	</file:js>
	<file:css>
		<src>dist/css/selectmenu.css</src>
	</file:css>
	<file:less>
		<src>dist/less/selectmenu.less</src>
	</file:less>
	<file:scss>
		<src>dist/scss/selectmenu.scss</src>
	</file:scss>
	<event:change>
		<desc>Fires when selectmenu value changes.</desc>
		<example>
			instance.on('change', function () {
				console.info(this.value);
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
*/

(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( [ 'mk' ], function ( mk ) {
			return factory( root, mk );
		});
	}
	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {

		module.exports = factory( root, require( 'mk' ));
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		return factory( root, root.Mk );
	}

})( typeof window !== "undefined" ? window : this, function ( root, mk ) {

	mk.create( 'Selectmenu', {

		name: 'mk-sm',

		templates: {

			shadow:
				'<div class="{{$key}}-shadow{{if:classname}} {{classname}}{{/if:classname}}">\
					{{template:trigger}}\
					{{scope:list}}\
						{{template:list}}\
					{{/scope:list}}\
				<div />',

			trigger:
				'<div class="{{$key}}-trigger {{if:disabled}} disabled{{/if:disabled}}" role="combobox" aria-haspopup="listbox">\
					<input type="text" \
						class="{{$key}}-input" \
						readonly \
						aria-autocomplete="list" \
						aria-readonly="true" \
						aria-disabled="{{disabled}}" \
						{{if:multiple}}aria-multiselectable="true" {{/if:multiple}} \
						value="{{label}}" /> \
				</div>',

			list:
				'<ul id="{{id}}" class="{{$key}}-list" role="listbox">\
					{{loop:items}}\
						{{template:item}}\
					{{/loop:items}}\
				</ul>',

			item:
				'<li class="{{$key}}-item" data-level="{{level}}" role="presentation">\
					{{template:option}}\
				</li>',

			option:
				'<a id="{{id}}" \
					class="{{$key}}-{{tagname}}{{if:classname}} {{classname}}{{/if:classname}}" \
					role="{{role}}" \
					href="javascript: void(0);" \
					aria-selected="{{selected}}" \
					aria-disabled="{{disabled}}" \
					data-value="{{value}}">\
					<span class="{{$key}}-label">\
						{{label}}\
					</span>\
					<span class="{{$key}}-alt">{{alt}}</span>\
				</a>',

			removable:
				'<option class="{{$key}}-removable" value="{{value}}" data-alt="{{alt}}">{{label}}</option>'
		},

		formats: {
			label: 'Combobox',
			removable: 'Clear',
			removableAlt: '{{if:selected}}<span>({{selected}} of {{total}})</span>{{/if:selected}}'
		},

		/*
			<property:selectmenu>
				<desc>The wrapped select child node living in the provided root.</desc>
			</property:selectmenu>
		*/

		get selectmenu () {
			return this.node('', this.root);
		},

		/*
			<property:element>
				<desc>The raw select child node living in the provided root.</desc>
			</property:element>
		*/

		get element () {
			return this.selectmenu[0];
		},

		/*
			<property:version>
				<type>property</type>
				<desc>Selectmenu version</desc>
			</property:version>
		*/

		get version () {
			return 'v1.0.0';
		},

		/*
			<property:multiple>
				<desc>Boolean representing if the selectmenu is a multi-select or not.</desc>
			</property:multiple>
		*/

		get multiple () {
			return this.element.multiple;
		},

		/*
			<property:disabled>
				<desc>Boolean representing if the selectmenu is currently disabled.</desc>
			</property:disabled>
		*/

		get disabled () {
			return this.element.disabled;
		},

		/*
			<property:enabled>
				<desc>Boolean representing if the selectmenu is currently enabled.</desc>
			</property:enabled>
		*/

		get enabled () {
			return this.element.disabled !== true;
		},

		/*
			<property:options>
				<desc>The raw option elements.</desc>
			</property:options>
		*/

		get options () {
			return this.element.options || [];
		},

		/*
			<property:trigger>
				<desc>TThe wrapped, rendered trigger root.</desc>
			</property:trigger>
		*/

		get trigger () {
			return this.node('trigger', this.shadow);
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
			<property:list>
				<desc>The wrapped, rendered UI list.</desc>
			</property:list>
		*/

		get list () {
			return this.node('list', this.shadow);
		},

		/*
			<property:items>
				<desc>The wrapped, rendered UI list items.</desc>
			</property:items>
		*/

		get items () {
			return this.list.find(this.selector('item'));
		},

		/*
			<property:listOptions>
				<desc>The wrapped, rendered UI list options (different than items, typically nested in an item).</desc>
			</property:listOptions>
		*/

		get listOptions () {
			return this.list.find('[role="option"]');
		},

		/*
			<property:isHidden>
				<desc>Boolean representing if the list is hidden or not.</desc>
			</property:isHidden>
		*/

		get isHidden () {
			return this.trigger.attr(
				'aria-expanded') !== 'true';
		},

		/*
			<property:isOpen>
				<desc>Boolean representing if the list is open (not hidden) or not.</desc>
			</property:isOpen>
		*/

		get isOpen () {
			return this.trigger.attr(
				'aria-expanded') === 'true';
		},

		/*
			<property:value>
				<desc>Single [or array] of value(s) currently selected.</desc>
			</property:value>
		*/

		get value () {

			if (this.multiple) {

				var values = [];

				this.each(this.options, function(i, o) {
					if (o.selected) values.push(o.value);
				});
				return values;
			}
			return this.element.value;
		},

		_verifyTag: function (n) {

			var node = this.node('', n);

			if (node.length < 1 ||
				node[0].tagName.toLowerCase() !== 'select') {
				throw new Error(':: Mk.Selectmenu - root must have a <select> node ::');
			}

			return true;
		},

		_define: function (r, o) {

			if (this._verifyTag(r)) {
				this.super(r, o);
			}
		},

		_config: function (o) {

			o = o || {};

			var label = this.selectmenu.attr('aria-label')
				|| this.formats.label;

			this._param('label', 'string', o, label, this.selectmenu);

			if (this.multiple) {
				this._param('removable', 'boolean', o, false, this.selectmenu);
				this._param('removableId', 'string', o, this.uid());
			}

			this.super(o);
		},

		_label: function () {

			var id = this.element.id,
				label = this.$('label[for="'+ id +'"]');

			if (label.length) {
				label.attr('for', this.input.attr('id'));
			}

			else {
				this.input.attr('aria-label',
					this.selectmenu.attr('aria-label'));
			}
		},

		_build: function () {

			if (this.config.removable) {
				this._buildRemovable();
			}

			this.shadow =
				this.html('shadow', this.data())
					.appendTo(this.root);

			if (this.transitions) {
				this.shadow.addClass('transitions');
			}

			var l = this.list,
				o = l.find('[aria-selected="true"]');

			this.trigger.attr({
				'aria-controls': l.attr('id') || '',
				'aria-activedescendant': o.attr('id') || ''
			});

			this.input.attr('id', this.uid());
			this.selectmenu.attr('aria-hidden', 'true');

			this._label();
		},

		_buildRemovable: function () {

			this.html('removable', {
				label: this.format('removable'),
				value: this.config.removableId,
				alt: this._getRemovableAlt()
			}).appendTo(this.element);
		},

		_getRemovableAlt: function () {

			if (this.multiple && this.value.length > 0) {

				return this.format('removableAlt', {
					selected: this.value.length,
					total: this.options.length
				})
			}

			return '';
		},

		_updateRemovableAlt: function () {

			if (this.config.removable) {

				var alt = this._getRemovableAlt();

				this.$(this.options)
					.filter(this.selector('removable'))
					.attr('data-alt', alt);

				this.items
					.find(this.selector('removable'))
					.find(this.selector('alt'))
					.html(alt);
			}

			return this;
		},

		_bind: function () {

			this._bindInputEvents();
			this._bindListEvents();
			this._bindListItemEvents();
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
			});
			//.on('keypress.mk', function (e) {
//console.info(e)
				//if (thiss.keyIsBehavior(e.which) < 0) {
					//console.info(e.which, thiss.keyIsBehavior(e.which));
					//e.preventDefault();
					//thiss.search(String.fromCharCode(e.which), true);
				//}
			//});
		},

		_bindListEvents: function () {

			var thiss = this;

			this.list
			.on('mousedown.mk', function (e) {
				e.preventDefault();
			})
			.on('click.mk', '[role="option"]', function (e) {
				e.preventDefault();
				if (thiss.transitioning(thiss.list)) { return; }
				thiss.select( this.getAttribute('data-value') );
			});
		},

		_bindListItemEvents: function () {

			var thiss = this;
			this.list.find('[role="option"]').on('mouseenter.mk', function (e) {

				if (thiss.transitioning(thiss.list)) {
					return;
				}
				thiss.activate(this);
			});
		},

		_keydown: function (e) {

			if (this.disabled) {
				return;
			}

			var w = e.which,
				k = this.keycode;

			switch (w) {

				case k.enter:
					this._enter(e);
					break;

				case k.space:
					this._space(e);
					break;

				case k.esc:
					this._esc(e);
					break;

				case k.up:
				case k.down:
					e.preventDefault();
					this.move(w === k.up);
					break;

				case k.tab:
					if (this.isOpen) {
						this._tab(e);
					}
					break;

				default:

					w = String.fromCharCode(w);
console.info(w)
					if (w) {
						this.search(w, true);
					}
			}
		},

		_enter: function (e) {

			e.preventDefault();

			if (this.isHidden) {
				return this.show();
			}

			var active = this.items.find('.active'),
				value = active.attr('data-value');

			if (active.attr('aria-selected') !== 'true') {
				this.select(value);
			}
			else if (this.multiple) {
				this.deselect(value);
			}

			if (this.multiple !== true) {
				return this.hide();
			}
		},

		_space: function (e) {

			e.preventDefault();

			if (this.isHidden) {
				return this.show();
			}
			return this._enter(e);
		},

		_esc: function(e) {

			e.preventDefault();

			if (this.isOpen) {
				this.hide();
			}
			return this;
		},

		_tab: function (e) {

			if (this.isOpen) {

				e.preventDefault();

				var active = this.items.find('.active');

				if (this.multiple !== true
					&& active.length && active.attr('aria-selected') !== 'true') {
					this.select(active.attr('data-value'));
				}

				this.hide();
			}
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

		blur: function () {

			if (this.disabled) {
				return this.hide();
			}

			var t = this.trigger;
				t.removeClass('focus');

			if (this.isHidden) {

				var o = this.items.find('.active');

				if (o.length && o.attr('aria-selected') !== 'true') {
					this.select(o.attr('data-value'));
				}
			}

			return this.updateLabel().hide();
		},

		/*
			<method:move>
				<invoke>.move([up])</invoke>
				<param:up>
					<type>Boolean</type>
					<desc>Set as true to move up the list. Default is false.</desc>
				</param:up>
				<desc>Move the active selectmenu list item by one.</desc>
			</method:move>
		*/

		move: function (up) {

			var items   = this.items,
				active  = this.items.find('.active')[0],
				options = this.listOptions,
				initial = false,
				option;

			if (typeof active === 'undefined') {

				active = items.find('[aria-selected="true"]')[0];

				if (typeof active === 'undefined') {
					active = options[0];
					initial = true;
				}

				this.activate(active);
			}

			if (initial) {
				option = active;
				active = null;
			}
			else {

				var increment = up && -1 || 1
					index = this.index(active) + increment;

				option = options[index];

				while (option
					&& option.getAttribute('aria-disabled') === 'true') {

					index += increment;
					option = options[index];
				}

				if (typeof option === 'undefined') {

					option = up && options[0]
						|| options[options.length - 1];
				}
			}

			if (option !== active) {
				this.activate(option, true);
				this.scrollTo(option, up);
			}
		},

		/*
			<method:search>
				<invoke>.search(key[, add])</invoke>
				<param:key>
					<type>String</type>
					<desc>Letter or text to search on.</desc>
				</param:key>
				<param:add>
					<type>Boolean</type>
					<desc>Set as true to add to the curent search term, false to replace it. Default is false.</desc>
				</param:add>
				<desc>Move the active selectmenu list item by 1.</desc>
			</method:move>
		*/

		search: function (key, add) {

			if (this.disabled !== true && key) {

				if (this._timer) {
					clearTimeout(this._timer);
					this._timer = null;
				}

				this.query = this.query || '';

				if (add) {
					this.query += key;
				}
				else {
					this.query = key;
				}

				var option = this.getElementByLabel(this.query),
					thiss  = this;

				if (option) {
					this.activate(option, true);
				}

				this._timer = setTimeout(function () {
					thiss.query = '';
					thiss._timer = null;
				}, 500);
			}
		},

		/*
			<method:index>
				<invoke>.index(n)</invoke>
				<param:key>
					<type>Node</type>
					<desc>Option in the selectmenu list UI.</desc>
				</param:key>
				<desc>Get the index of an individual list option.</desc>
			</method:index>
		*/

		index: function ( n ) {

			var index = 0;

			this.each(this.listOptions, function (i, o) {

				if (o === n) {
					index = i;
					return false;
				}
			});

			return index;
		},

		/*
			<method:getOptgroupValue>
				<invoke>.getOptgroupValue(optgroup)</invoke>
				<param:optgroup>
					<type>Node</type>
					<desc>Optgroup Elment.</desc>
				</param:optgroup>
				<desc>Get a generated value for an optgroup, representing the child option elements.</desc>
			</method:getOptgroupValue>
		*/

		getOptgroupValue: function (node) {

			var c = node.children || [],
				v = [];

			this.each(c, function (i, o) {
				v.push(o.value);
			});
			return v.join('|||');
		},

		getElementByLabel: function (label) {

			var s = this.selector('label'),
				r = new RegExp('^' + label, 'i'),
				o = null, l;

			this.each(this.listOptions, function (i, option) {

				l = this.$(option).find(s).text();

				if (r.test(l)) {
					o = option; return false;
				}
			});

			return o;
		},

		/*
			<method:getElementsByValue>
				<invoke>.getElementsByValue(value)</invoke>
				<param:value>
					<type>String</type>
					<desc>Value of an option.</desc>
				</param:value>
				<desc>Get the native option AND UI option element by searching the value.</desc>
			</method:getElementsByValue>
		*/

		getElementsByValue: function (v) {

			var items = this.listOptions,
				elems = {},
				item;

			this.each(items, function (i, el) {

				item = this.$(el);

				if (item.attr('data-value') === v) {

					elems.option = this.getOptionByValue(v);
					elems.item = item;
					return false;
				}
			});

			return elems;
		},

		/*
			<method:getOptionByValue>
				<invoke>.getOptionByValue(value)</invoke>
				<param:value>
					<type>String</type>
					<desc>Value of an option.</desc>
				</param:value>
				<desc>Get the native option by searching the value.</desc>
			</method:getOptionByValue>
		*/

		getOptionByValue: function (v) {

			var option;

			this.each(this.options, function (i, o) {
				if (o.value === v) {
					option = o; return false;
				}
			});

			return option;
		},

		getLabelByElement: function (n) {

			var node = this.$(n),
				tag  = node.length > 0
					&& node[0].tagName.toLowerCase() || '';

			if (tag === 'option') {
				return node[0].text;
			}

			return node.find(
				this.selector('label')).text();
		},

		/*
			<method:updateLabel>
				<invoke>.updateLabel(n)</invoke>
				<param:n>
					<type>Mixed - String/Node/undefined</type>
					<desc>Pass as string to set select label as the string. Pass as node to parse the label from element. Leave empty to automatically update the label.</desc>
				</param:n>
				<desc>Updates the label (trigger input value).</desc>
			</method:updateLabel>
		*/

		updateLabel: function (n) {

			this.input.val(
				this.label(n));

			return this;
		},

		/*
			<method:label>
				<invoke>.label(n)</invoke>
				<param:n>
					<type>Mixed - Node/undefined</type>
					<desc>Pass as node to parse and return the label from element. Leave empty to return the current label..</desc>
				</param:n>
				<desc>Pareses a label (trigger input value) and returns it.</desc>
			</method:label>
		*/

		label: function (n) {

			var t = typeof n;

			if (t !== 'undefined') {

				if (t === 'string') {
					return n;
				}
				return this.getLabelByElement(n);
			}

			if (this.multiple) {
				return this.config.label;
			}

			var l = '';
			this.each(this.options, function (i, o) {
				if (o.selected) {
					l = o.text; return false;
				}
			});

			return l;
		},

		/*
			<method:data>
				<invoke>.data()</invoke>
				<desc>Generate a JSON representation of the selectmenu.</desc>
			</method:data>
		*/

		data: function () {

			var reg = new RegExp(' ' + this.name + ' ', 'i'),
				cls = ' ' + this.element.className + ' ';

			return {
				label: this.label(),
				classname: cls.replace(reg, ''),
				multiple: this.multiple,
				disabled: this.disabled,
				list: {
					id: this.uid(),
					items: this.getOptionData()
				}
			};
		},

		getOptionData: function (nodes, items, level) {

			nodes = nodes || this.element.children || [];
			items = items || [];
			level = level || 0;

			this.each(nodes, function(i, node) {

				var tag = node.tagName.toLowerCase(),
					role = tag === 'option' && 'option' || this.multiple && 'option' || 'presentation';

				items.push({
					role: role,
					tagname: tag,
					level: level,
					classname: node.className,
					id: node.id || this.uid(),
					label: node.text || node.label,
					selected: node.selected || false,
					disabled: node.disabled || false,
					alt: node.getAttribute('data-alt'),
					value: node.value || this.getOptgroupValue(node)
				});

				if (node.children && node.children.length > 0) {
					this.getOptionData(node.children, items, level+1);
				}
			});

			return items;
		},

		/*
			<method:scrollTo>
				<invoke>.scrollTo(n)</invoke>
				<param:n>
					<type>Node</type>
					<desc>An element in the selectmenu list to scroll to.</desc>
				</param:n>
				<desc>Scroll a selectmenu list with a restructed height to a perticular list item.</desc>
			</method:scrollTo>
		*/

		scrollTo: function (n, up) {

			var node = this.$(n);

			if (node.length > 0) {

				var list = this.list[0],
					scroll = list.scrollTop,
					position = scroll,
					lheight = list.offsetHeight
					offset = node[0].offsetTop,
					height = node[0].offsetHeight;

				if (offset + height > scroll + lheight) {

					if (up === false) {
						position = offset - lheight + height;
					}
					else {
						position = offset;
					}
				}
				else if (up && offset < scroll) {
					position = offset;
				}

				if (position !== scroll) {
					list.scrollTop = position;
				}
			}
		},

		/*
			<method:show>
				<invoke>.show()</invoke>
				<desc>Opens the list associated with the selectmenu.</desc>
			</method:show>
		*/

		show: function () {

			var t = this.trigger,
				l = this.list;

			if (this.disabled !== true && this.isHidden) {

				this.transition(l, function () {
					l.addClass('in');
				});

				this.delay(function () {

					this.activate();

					t.attr('aria-expanded', 'true');
					l.attr('aria-hidden', 'false');

					this.emit('show');
				});
			}
			return this;
		},

		/*
			<method:hide>
				<invoke>.hide()</invoke>
				<desc>Closes the list associated with the selectmenu.</desc>
			</method:hide>
		*/

		hide: function () {

			var t = this.trigger,
				l = this.list;

			if (this.isOpen) {

				this.transition(l, function () {
					l.removeClass('in');
				});

				this.delay(function () {

					t.attr('aria-expanded', 'false');
					l.attr('aria-hidden', 'true');

					this.emit('hide');
				});
			}
			return this;
		},

		/*
			<method:toggle>
				<invoke>.toggle()</invoke>
				<desc>Toggles between open() and show()</desc>
			</method:toggle>
		*/

		toggle: function () {

			if (this.isHidden) {
				return this.show();
			}
			return this.hide();
		},

		/*
			<method:activate>
				<invoke>.activate(n[, keyboard])</invoke>
				<param:n>
					<type>Node</type>
					<desc>A Node reference from the list of selectmenu items.</desc>
				</param:n>
				<param:keyboard>
					<type>Boolean</type>
					<desc>Pass true for additional functionality (like updating the label), as keyboard interactivity applies different behavior.</desc>
				</param:keyboard>
				<desc>Set an active element in the selectmenu list.</desc>
			</method:activate>
		*/

		activate: function (n, keyboard) {

			var position = false;

			if (typeof n === 'undefined') {

				position = true;

				this.each(this.listOptions, function(i, l) {
					if (l.getAttribute('aria-selected') === 'true') {
						n = l; return false;
					}
				});
			}

			var node = this.$(n);

			if (node.length && node.attr('aria-disabled') !== 'true') {

				this.input.attr('aria-activedescendant', node.attr('id'));
				this.listOptions.removeClass('active');

				node.addClass('active');

				if (position) {
					this.scrollTo(n);
				}

				if (keyboard) {
					this.updateLabel(n);
				}

				this.emit('activate', node, keyboard);
			}

			return this;
		},

		/*
			<method:deselect>
				<invoke>.deselect(value[, silent])</invoke>
				<param:value>
					<type>String</type>
					<desc>An option value or combination of option values joined with "|||".</desc>
				</param:value>
				<param:silent>
					<type>Boolean</type>
					<desc>Pass in as true to prevent the change event from emitting. Default value is false.</desc>
				</param:silent>
				<desc>Deselects item(s) in the selectmenu.</desc>
			</method:deselect>
		*/

		deselect: function (value, silent) {

			if (this.multiple) {

				var el = this.getElementsByValue(value);

				if (el.option.selected) {

					el.option.selected = false;
					el.item.attr('aria-selected', 'false');

					this.input.val(this.label());
					this._updateRemovableAlt();

					if (silent !== true) {
						this.emit('change', this.value);
					}
					return true;
				}
			}

			this.hide();

			return false;
		},

		/*
			<method:deselectAll>
				<invoke>.deselectAll([silent])</invoke>
				<param:silent>
					<type>Boolean</type>
					<desc>Pass in as true to prevent the change event from emitting. Default value is false.</desc>
				</param:silent>
				<desc>Deselects all items in the selectmenu.</desc>
			</method:deselectAll>
		*/

		deselectAll: function (silent) {

			this.each(this.options, function (i, o) {
				o.selected = false;
			});

			if (this.config.removable) {
				this._updateRemovableAlt();
				this.update();
			}

			if (silent !== true) {
				this.emit('change', this.value);
			}

			return this;
		},

		/*
			<method:select>
				<invoke>.select(value[, silent])</invoke>
				<param:value>
					<type>String</type>
					<desc>An option value or combination of option values joined with "|||".</desc>
				</param:value>
				<param:silent>
					<type>Boolean</type>
					<desc>Pass in as true to prevent the change event from emitting. Default value is false.</desc>
				</param:silent>
				<desc>Selects item(s) in the selectmenu..</desc>
			</method:select>
		*/

		select: function (value, silent) {

			if (value === this.config.removableId) {
				this.deselectAll();
				return false;
			}

			var el = this.getElementsByValue(value),
				multiple = this.multiple;

			if (typeof el.option === 'undefined') {
				return this.selectGroup(value, silent);
			}

			if (el.option.disabled) {
				return false;
			}

			if (el.option.selected) {
				this.deselect(value, silent);
				return false;
			}

			el.option.selected = true;

			if (multiple !== true) {
				this.listOptions.attr('aria-selected', 'false');
			}

			el.item.attr('aria-selected', 'true');

			this.input
				.attr('aria-activedescendant', el.item.attr('id'))
				.val(this.label());

			this._updateRemovableAlt();

			if (silent !== true) {
				this.emit('change', this.value);
			}

			if (multiple !== true) {
				this.hide();
			}

			return true;
		},

		selectGroup: function (value, silent) {

			var values = (value || '').split('|||');
			var tally  = 0;

			this.each(values, function (i, v) {

				var elems = this.getElementsByValue(v);

				if (elems.option.selected !== true) {
					this.select(v, true);
				}
				else {
					tally++;
				}
			});

			if (tally === values.length) {
				this.each(values, function (i, v) {
					this.deselect(v);
				});
			}

			if (silent !== true) {
				this.emit('change', this.value);
			}

			return this;
		},

		/*
			<method:disable>
				<invoke>.disable()</invoke>
				<desc>Disables the selectmenu UI if currently enabled.</desc>
			</method:disable>
		*/

		disable: function () {

			this.element.disabled = true;
			this.input.attr('aria-disabled', 'true');
			this.trigger.addClass('disabled');
			this.emit('disabled');
			this.hide();

			return this;
		},

		/*
			<method:enable>
				<invoke>.enable()</invoke>
				<desc>Enables the selectmenu UI if currently disabled.</desc>
			</method:enable>
		*/

		enable: function () {

			this.element.disabled = false;
			this.input.attr('aria-disabled', 'false');
			this.trigger.removeClass('disabled');
			this.emit('enabled');

			return this;
		},

		/*
			<method:update>
				<invoke>.update()</invoke>
				<desc>Make changes to your native (root) select element, then call this method to apply changes to the selectmenu UI.</desc>
			</method:update>
		*/

		update: function () {

			var d = this.data(),
				m = d.disabled && 'disable' || 'enable',
				i = this.input,
				l = this.html('list', d.list);

			this.items.remove();
			this.list.append(l.find(this.selector('item')));

			this._bindListItemEvents();

			this[m]();

			this._param(
				'removable', 'boolean', this.config, false, this.selectmenu);

			if (this.config.removable
				&& this.items.find(this.selector('removable')).length > 0) {
				this._buildRemovable();
			}

			i.attr('aria-multiselectable', d.multiple && 'true' || 'false');
			i.val(this.label());

			this.emit('update');

			return this;
		},
	});

	return mk.get('Selectmenu');
});
