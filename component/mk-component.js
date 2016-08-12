// mk-component
// base class-y for mk-library classes
//  v1.0.1
!function( $ ) {

	//
	//creates a unique ID every time it's called.
	//this is useful for aria ties, accessibility controls, etc.
	//-----------------------------------------------

	function uid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    		return v.toString(16);
		});
	}

	//
	//Copy objects and stuff.
	//No more pointer references unless we're
	//dealing with a function.
	//-----------------------------------------------

	function copy(o) {

		if (o instanceof Array) {
			for(var i = 0, l = o.length, a = [];
					i < l && a.push(copy(o[i]));
					i++) { /* fast as hell */ }

			return a;
		}

		switch(typeof o) {

			case 'object':

				var n = {}, hasprop = false;

				for(var i in o) {
					hasprop = true;
					n[i] = copy(o[i]);
				}
				return hasprop && n || o;

			default:
				return o;
		}
	}

	//
	// transition
	// returns a transition event name or null
	//------------------------------------------------

	var transitionsEnabled = false,
		transitions = {
		'transition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'MozTransition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd'
	};

	function transition() {

		if (transitionsEnabled) {

			var el = document.createElement('xanimate'), t;

			for (t in transitions) {
				if (el.style[t] !== undefined) {
					return transitions[t];
				}
			}
		}
		return null;
	}

	//
	// Aria
	// helper api for assigning aria values
	// hook is set in MkComponent.prototype.aria
	//------------------------------------------------

	function Aria(node, key) {
		return this._init(node, key);
	}

	Aria.prototype = {

		_: null,

		_key: '',

		_init: function(node, key) {
			this._ = $(node);
			this._key = key || '';
			return this;
		},

		_attr: function(name, value) {

			if (value === undefined) {
				return this._.attr('aria-' + name);
			}
			this._.attr('aria-' + name, value);
			return this;
		},

		_class: function(name, remove) {
			this._[remove && 'removeClass' || 'addClass']('aria-' + name);
			return this;
		},

		_id: function(node) {

			var $node = $(node),
				 id = $node.attr('id');

			if (!id) {
				 id = this._key + '-' + uid();
				$node.attr('id', id);
			}
			return id;
		},

		link: function(prop, node) {

			if (node === undefined) {
				return $('#' + this._attr(prop));
			}
			if (node === null) {
				return this._attr(prop, '');
			}
			return this._attr(prop, this._id(node));
		},

		owns: function(node) {
			return this.link('owns', node);
		},

		controls: function(node) {
			return this.link('controls', node);
		},

		describedby: function(node) {
			return this.link('describedby', node);
		},

		labelledby: function(node) {
			return this.link('labelledby', node);
		},

		label: function(value) {
			return this._attr('label', value);
		},

		activedescendant: function(node) {
			return this.link('activedescendant', node);
		},

		haspopup: function(bool) {
			return this._attr('haspopup',
				bool === true && 'true' || bool === false && 'false' || undefined);
		},

		busy: function(bool) {
			return this._attr('busy',
				bool === true && 'true' || bool === false && 'false' || undefined);
		},

		hidden: function(bool) {

			var r = 'hidden',
				a = 'visible',
				b = 'false';

			if (bool === true || bool === undefined) {
				r = 'visible',
				a = 'hidden',
				b = 'true';
			}
			return this._class(r, true)._class(a)._attr('hidden', b);
		},

		visible: function() {
			return this.hidden(false);
		},

		expanded: function (bool) {

			var r = 'collapsed',
				a = 'expanded',
				b = 'true';

			if (bool === false) {
				r = 'expanded',
				a = 'collapsed',
				b = 'false';
			}
			return this._class(r, true)._class(a)._attr('expanded', b);
		},

		collapsed: function () {
			return this.expanded(false);
		},

		disabled: function(bool) {

			var r = 'disabled',
				a = 'enabled',
				b = 'false';

			if (bool === true || bool === undefined) {
				r = 'enabled',
				a = 'disabled',
				b = 'true';
			}
			return this._class(r, true)._class(a)._attr('disabled', b);
		},

		enabled: function() {
			return this.disabled(false);
		},

		selected: function(bool) {

			var r = 'deselected',
				a = 'selected',
				b = 'true';

			if (bool === false) {
				r = 'selected',
				a = 'deselected',
				b = 'false';
			}
			return this._class(r, true)._class(a)._attr('selected', b);
		},

		deselected: function() {
			return this.selected(false);
		},

		atomic: function(bool) {
			return this._attr('atomic', (bool || bool === undefined) && 'true' || 'false');
		},

		deatomize: function() {
			return this.atomic(false);
		},

		relevant: function(value) {

			if (/additions|removals|text|all/i.test(value)) {
				this.atomic();
			}
			else {
				value = '';
				this.deatomize();
			}
			return this._attr('relevant', value.toLowerCase());
		},

		relevantAdditions: function() {
			return this.relevant('additions');
		},

		relevantRemovals: function() {
			return this.relevant('removals');
		},

		relevantAll: function() {
			return this.relevant('all');
		},

		irrelevant: function() {
			return this.relevant('');
		},

		live: function(key) {
			return this._attr('live', key || 'polite');
		},

		dead: function() {
			return this.live('off');
		},

		assertive: function() {
			return this.live('assertive');
		},

		rude: function() {
			return this.live('rude');
		},

		role: function(role) {
			this._.attr('role', role);
			return this;
		},

		index: function(index) {
			this._.attr('tabindex', (index || 0).toString());
			return this;
		},

		noindex: function() {
			return this.index(-1);
		}
	};

	//
	// end Aria
	//--------------------------------------------------

	//
	// All MkComponents should be extending this bad boy.
	// Use: MkComponent.create() for component building.
	//--------------------------------------------------

	var _bypass = '-mk-bypass-' + uid();

	function MkComponent() {

		if (arguments[0] !== _bypass) {
			this._init.apply(this, arguments);
		}
		return this;
	}

	MkComponent._templates = {
		'no_template': [
			'<span>[no template for {{value}}]</span>'
		]
	};

	MkComponent.define = function _assign(n, o) {

		var a = MkComponent,
		p = n.split('.');

		for (var i = 0, l = p.length - 1; i < l; i++) {

			if (!a.hasOwnProperty(p[i])) {
				a[ p[ i ] ] = {};
			}
			a = a[ p[ i ] ];
		}
		return a[ p[ p.length - 1 ] ] = o;
	};

	MkComponent.create = function create(name, base, proto) {

		proto = proto || base || {};
		base  = base instanceof Function && new base(_bypass) instanceof MkComponent && base || MkComponent;

		var i, Component = function MkComponent() {

			if (arguments[0] !== _bypass) {
				this._init.apply(this, arguments);
			}
			return this;
		};

		Component.prototype = new base(_bypass);

		for(i in proto) {
			Component.prototype[i] = copy(proto[i]);
		}

		Component.prototype.__super__ = base;

		return MkComponent.define(name, Component);
	};

	MkComponent.get = function (name) {

		var o = null, mk = MkComponent,
		p = name.split('.');

		for (var i = 0, l = p.length; i < l; i++) {

			if (mk.hasOwnProperty(p[i])) {
				o = mk[ p[i] ];
				mk = o;
			}
			else {
				o = null;
			}
		}
		return o;
	};

	MkComponent.transitions = function transitions(b) {

		if (b === true) {
			transitionsEnabled = true;
		} else if (b === false) {
			transitionsEnabled = false;
		}
		return transitionsEnabled;
	};

	MkComponent.prototype = {

		// templates property.
		// see _templates();
		_templates: {},

		// used to prefix our component uids
		// so we have some visual context
		_name: '',

		// generate a unique id for your component
		// and all moving parts inside. This is useful for
		// setting dynamic id's for aria and control association.
		// the id is the fastest lookup!!!
		_uid: function _uid() {
			//only exposure you're gonna get!
			return this._name + '-' + uid();
		},

		//get a namespace variable for events
		_ns: function(event) {
			if (arguments.length > 1) {
				for(var i = 0, l = arguments.length, n = []; i < l && n.push(this._ns(arguments[i])); i++) {}
				return n.join(', ');
			}
			return event + '.' + this._name;
		},

		// generates specific name based off the component name
		// this is helpful for seperating components that extend each other.
		_class: function _class(name, asSelector) {
			return (asSelector && '.' || '') + this._name + (name && '-' + name || '');
		},

		// helper method if you hever want to copy something..
		// this removes pointer references from everything but functions
		// useful for data manipulation
		_copy: function _copy(o) {
			return copy(o);
		},

		// here is where we do all our property defining
		// so things like _name and _templates go here
		_define: function _define () {

			this._name = 'mk-component';

			this._templates = {
				// stick templates here.
				// templates are name, array[string] pairs
				// templates are passed name/value pairs for value injection
				'no_template': [
					'<span>[no template for {{value}}]</span>'
				]
			};
		},

		// Template builder. Keep html in the templates
		// rather than messy and scattered around in methods
		_template: function _template(name, data) {

			data = data || {};

			var t = this._templates.hasOwnProperty(name)
					&& this._templates[name] || null;

			if (!t) {
				 t = MkComponent._templates.no_template;
				 data = {value: name};
			}

			var h = t.join('').replace(/{{(!?\w+)}}/g, function(s, c) {
				return data[c] || '';
			});
			return $(h);
		},

		_format: function _format(str, data) {

			if (this._templates.hasOwnProperty(str)) {
				str = this._templates[str];
			}

			if (str instanceof Array) {
				str = str.join('');
			}

			return str.replace(/{{(!?\w+)}}/g, function(s, c) {
				return data[c] === undefined ? '' : data[c];
			});
		},

		_arguments:	function _arguments(args) {
		    for(var i = 0, a = [], l = args.length;
					i < l && a.push(args[i]);
					i++) { }
		    return a;
		},

		// init our component.
		// Every component should have an init method
		_init: function _init() {
			this._define();
		},

		super: function (methodname) {

			if (this.__super__) {

				var args = this._arguments(arguments);
				args.shift();

				var method = this.__super__.prototype[methodname];
				var pointer = this.__super__;
				var result;

				if (typeof method == 'function') {

					this.__super__ = this.__super__.prototype.__super__;
					result = method.apply(this, args);
					this.__super__ = pointer;
					return result;
				}
			}
			throw new Error('MkComponent: no super class or method name, ' + methodname);
		},

		// aria
		// expose the aria API for easy
		// manipulation through individual components
		aria: function(node) {
			return new Aria(node, this._name);
		},

		// transition
		// add transition callbacks which trigger
		// when css3 animations are completed.
		transition: function($el, cb) {

			var  t = transition(),
				$t = $($el);

			if (t) {
				$t.one(t, cb);
			}
			else {
				cb.apply($t[0]);
			}
			return this;
		},

		// clearTransitions
		// clear transition callbacks
		clearTransitions: function ($el) {

			var t = transition();

			if (t) $($el).off(t);
		},

		each: function (a, fn) {

	      if (a && a.length) {
	        for(var i = 0, l = a.length;
	          i < l && fn.call(this, a[i], i) !== false;
	          i++) {}
	      }
	      else {
	        for (var i in a) {
	          if (fn.call(this, i, a[i]) === false) break;
	        }
	      }
	      return this;
    }
	};

	//Expose.
	//All extending components will become static members of MkComponent.

	//for instance:
	//		var myComponent = MkComponent.create('MyComponent', {});

	//You can grab it like so:
	//		var mycomponent = $.Mk.MyComponent;

	$.Mk = MkComponent;

}(window.jQuery);
