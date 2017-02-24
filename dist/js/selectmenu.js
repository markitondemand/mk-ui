/*
	<depedency:Core>
		<src>/dist/js/core.js</src>
		<docs>../</docs>
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

	if ( typeof define === 'function' && define.amd ) {

		define([ 'mk-ui' ], function (mk) {
			return factory( root, mk );
		});
	}
	else if (typeof module === 'object' && module.exports) {

		module.exports = factory(root, require('mk-ui'));
	}
	else {
		return factory(root, root.Mk);
	}

})(typeof window !== "undefined" && window || this, function (root, mk) {

	mk.create('Selectmenu', {

		name: 'mk-sm',

		// see bind() for property details.
		// used as a temp flag for IE specific bug and overflow scroll elements.
		fromIEBubbleBug: false,

		templates: {

			shadow:
				'<div class="{{$key}}-shadow{{if:classname}} {{classname}}{{/if:classname}}">\
					{{template:trigger}}\
					{{scope:list}}\
						{{template:list}}\
					{{/scope:list}}\
				<div />',

			trigger:
				'<div class="{{$key}}-trigger {{if:disabled}} disabled{{/if:disabled}}">\
					<input type="text" \
						class="{{$key}}-input" \
						readonly \
						role="combobox" \
						aria-haspopup="listbox" \
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
				'<a tabindex="-1" id="{{id}}" \
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
			<property:rootelement>
				<desc>The wrapped select child node living in the provided root.</desc>
			</property:rootelement>
		*/

		get rootelement () {
			return this.node('', this.root);
		},

		/*
			<property:element>
				<desc>The raw select child node living in the provided root.</desc>
			</property:element>
		*/

		get element () {
			return this.rootelement[0];
		},

		/*
			<property:version>
				<type>property</type>
				<desc>Selectmenu version</desc>
			</property:version>
		*/

		get version () {
			return 'v2.0.0';
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
			return !this.disabled;
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
			return !this.isHidden;
		},

		/*
			<property:value>
				<desc>Single [or array] of value(s) currently selected.</desc>
			</property:value>
		*/

		get value () {

			if (this.multiple) {
				return this.map(this.options, function (o) {
					if (o.selected) return o.value;
				});
			}
			return this.element.value;
		},

		verifyRoot: function (n) {

			if (!this.node('', n).is('select')) {
				throw new Error(':: Mk.Selectmenu - root must contain a <select> node ::');
			}
			return true;
		},

		define: function (r, o) {

			if (this.verifyRoot(r)) {
				this.super(r, o);
			}
		},

		configure: function (o) {

			o = o || {};

			var sm = this.rootelement,
				label = sm.attr('aria-label') || this.formats.label;

			this.param('label', 'string', o, label, sm);

			if (this.multiple) {
				this.param('removable', 'boolean', o, false, sm);
				this.param('removableId', 'string', o, this.uid());
			}

			this.super(o);
		},

		mount: function () {

			var input = this.input,
				label = this.$('label[for="' + this.element.id + '"]');

			input.attr('id', this.uid());
			this.rootelement.attr('aria-hidden', 'true');

			// if label element is present
			if (label.length) {
				label.attr('for', input.attr('id'));
			}
			//else set the aria label attribute
			else {
				input.attr('aria-label', this.config.label);
			}
			//append component to the dom
			this.shadow.appendTo(this.root);
		},

		/*
			<method:unmount>
				<invoke>.unmount()</invoke>
				<desc>Teardown component, remove from DOM, and free event, data, and reference memory.</desc>
			</method:unmount>
		*/

		unmount: function () {

			this.rootelement.off('change.mk');

			this.shadow.remove();

			this.shadow =
			this.events =
			this.config =
			this.root = null;
		},

		build: function () {

			if (this.device) {
				this.root.addClass('device');
			}

			if (this.config.removable) {
				this.buildRemovable();
			}

			this.shadow =
				this.html('shadow', this.data())
					.appendTo(this.root);

			if (this.transitions) {
				this.shadow.addClass('transitions');
			}

			var list = this.list,
				selected = list.find('[aria-selected="true"]');

			this.input.attr('aria-controls', list.attr('id') || '');

		},

		buildRemovable: function () {

			this.html('removable', {
				label: this.format('removable'),
				value: this.config.removableId,
				alt: this.getRemovableAlt()
			}).appendTo(this.element);
		},

		getRemovableAlt: function () {

			if (this.multiple && this.value.length > 0) {

				return this.format('removableAlt', {
					selected: this.value.length,
					total: this.options.length
				})
			}

			return '';
		},

		updateRemovableAlt: function () {

			if (this.config.removable) {

				var alt = this.getRemovableAlt();

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

		bind: function () {

			var thiss = this;

			//this is mostly used for mobile/tablet devices BUT
			//you may also manipulate the raw select values and emit the change event.
			this.rootelement.on('change.mk', function (e) {
				thiss.updateLabel();
				thiss.emit('change', thiss.value);
			});

			//we're saving outselves a LOT of memory and heap space
			//by not applying any of the crazy events required in browsers
			//for mobile devices.

			if (!this.device) {
				this.bindInputEvents();
				this.bindListEvents();
			}
		},

		bindInputEvents: function () {

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

				// IE bug with preventDefault being ignored by mousedown
				// when an overflow element's scrollbar is being clicked.
				if (thiss.fromIEBubbleBug) {
					thiss.fromIEBubbleBug = false;
					thiss.input.focus();
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
		},

		bindListEvents: function () {

			var thiss = this;

			this.list
			.on('mousedown.mk', function (e) {

				e.preventDefault();

				this.fromIEBubbleBug = false;

				// IE bug occurs when lists has overflow: scroll
				// and user clicks the scrollbar up/down buttons
				if (!e.toElement && thiss.list.is(e.target)) {
					thiss.fromIEBubbleBug = true;
					// call blur() before IE triggers it natively
					// There's another bug with mousedown not always emitting with fast clicking.
					thiss.input.blur();
				}
			})
			.on('click.mk', '[role="option"]', function (e) {

				e.preventDefault();

				if (thiss.list.hasClass('out')) {
					return;
				}
				thiss.select(this.getAttribute('data-value'));
			})
			.on('mouseenter.mk', '[role="option"]', function (e) {

				if (thiss.list.hasClass('out')) {
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

					if (w) {
						this.search(w, true);
					}
			}
		},

		_enter: function (e) {

			e.preventDefault();

			var active = this.items.find('.active'),
				value = active.attr('data-value');

			if (active.attr('aria-selected') !== 'true') {
				this.select(value);
			}
			else if (this.multiple) {
				this.deselect(value);
			}
			else {
				return this.show();
			}

			if (!this.multiple) {
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

				if (!this.multiple
					&& active.length && active.attr('aria-selected') !== 'true') {
					this.select(active.attr('data-value'));
				}
				this.hide();
			}
		},

		blur: function () {

			if (this.disabled) {
				return this.hide();
			}

			var t = this.trigger;
				t.removeClass('focus');

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

				var increment = up && -1 || 1,
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

			if (this.enabled && key) {

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

		index: function (n) {
			return this.first(this.listOptions, function (o, i) {
				if (o === n) return i;
			});
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
			return this.map(node.childNodes || [], function (o) {
				return o.value;
			}).join('|||');
		},

		getElementByLabel: function (label) {

			label = label.toLowerCase();

			var s = this.selector('label'), l;

			return this.first(this.listOptions, function (option) {

				l = (this.$(option).find(s).text() || '').toLowerCase();

				if (l.indexOf(label) > -1) {
					return option;
				}
			});
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

			this.each(items, function (el) {

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

			return this.first(this.options, function (o) {
				if (o.value === v) {
					return o;
				}
			});
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

			return this.first(this.options, function (o) {
				if (o.selected) {
					return o.text;
				}
			});
		},

		/*
			<method:data>
				<invoke>.data()</invoke>
				<desc>Generate a JSON representation of the selectmenu.</desc>
			</method:data>
		*/

		data: function () {

			var cls = [].slice.apply(this.element.classList);
			cls.splice(cls.indexOf(this.name), 1);

			return {
				label: this.label(),
				classname: cls.join(' '),
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

			this.each(nodes, function(node) {

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

			if (this.enabled && this.isHidden) {

				this.delay(function () {

					this.activate();

					t.attr('aria-expanded', 'true');
					l.addClass('in').attr('aria-hidden', 'false');

					this.emit('show');
				});

				this.transition(l, function () {
					l.removeClass('in');
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

				this.delay(function () {

					l.addClass('out').attr('aria-hidden', 'true');
					t.attr('aria-expanded', 'false');

					this.emit('hide');
				});

				this.transition(l, function () {
					l.removeClass('out');
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

			var position = false,
				lo = this.listOptions;

			if (n === void+1) {

				n = lo[0];
				position = true;

				this.each(lo, function(l) {
					if (l.getAttribute('aria-selected') === 'true') {
						n = l; return false;
					}
				});
			}

			var node = this.$(n);

			if (node.length && node.attr('aria-disabled') !== 'true') {

				this.input.attr('aria-activedescendant', node.attr('id'));

				lo.removeClass('active');
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

			var result = false;

			if (this.multiple) {

				var el = this.getElementsByValue(value);

				if (el.option.selected) {

					el.option.selected = false;
					el.item.attr('aria-selected', 'false');

					this.updateRemovableAlt();

					if (!silent) {
						this.emit('change', this.value);
					}
					result = true;
				}
			}
			else {
				this.hide();
			}

			return result;
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

			this.each(this.options, function (o) {
				this.deselect(o.value, true);
			});

			if (!silent) {
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
				this.deselectAll(silent);
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

			if (!multiple) {
				this.listOptions.attr('aria-selected', 'false');
				this.updateLabel();
			}

			el.item.attr('aria-selected', 'true');

			this.input
				.attr('aria-activedescendant', el.item.attr('id'));

			this.updateRemovableAlt();

			if (!silent) {
				this.emit('change', this.value);
			}

			if (!multiple) {
				this.hide();
			}
			return true;
		},

		selectGroup: function (value, silent) {

			var values = (value || '').split('|||');
			var tally  = 0;

			this.each(values, function (v) {

				var elems = this.getElementsByValue(v);

				if (!elems.option.selected) {
					this.select(v, true);
				}
				else {
					tally++;
				}
			});

			if (tally === values.length) {
				this.each(values, function (v) {
					this.deselect(v, true);
				});
			}

			if (!silent) {
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

			this.list.append(
				l.find(this.selector('item')));

			this[m]();

			this.param(
				'removable', 'boolean', this.config, false, this.rootelement);

			if (this.config.removable
				&& this.items.find(this.selector('removable')).length < 1) {
				this.buildRemovable();
			}

			i.attr('aria-multiselectable', d.multiple && 'true' || 'false');
			i.val(this.label());

			this.emit('update');

			return this;
		},
	});

	return mk.get('Selectmenu');
});
