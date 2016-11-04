
(function ( root, factory ) {

	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( [ 'jquery' ], function ( $ ) {
			// assign to root in case there are global non-amd scripts on the page,
			// which use mkNasty
			return (root.mkNasty = factory( root, $ ));
		});
	}

	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {

		module.exports = root.document ?

			factory( root, require( 'jquery' ) ) :

			function( w ) {
				if ( !w.document ) {
					throw new Error( "mkNasty requires a window with a document" );
				}
				return factory( w, require( 'jquery' ) );
			};
	}

	//
	// Everybody else
	// -----------------------------------------------------
	else {

		root.mkNasty = factory( root, root.jQuery );
	}

})( typeof window !== "undefined" ? window : this, function ( root, $ ) { 

	var version = 'v1.0.0';

	//
	// uid()
	// Generate a unique id
	// --------------------------------------

	function uid() {
		return 'xxxx-4xxx-yxxx'.replace( /[xy]/g, function( c ) {
			var r = Math.random()*16|0, v = c == 'x' ? r : ( r&0x3 | 0x8 );
			return v.toString( 16 );
		});
	}

	//
	// copy()
	// Copy primitive types removing pointers
	// ---------------------------------------

	function copy(o) {

		if (o instanceof Array) {
			for( var i = 0, l = o.length, r = [];
					i < l && r.push(copy( o[i] ));
					i++ ) { /* fast as hell */ }

			return r;
		}

		if (o !== null 
			&& typeof o === 'object' 
			&& !o.hasOwnProperty('constructor') 
			&& !o.constructor.hasOwnProperty('isPrototypeOf')) {

			var r = {}, i, p = false;

			for(i in o) {
				p = true;
				r[i] = copy(o[i]);
			}

			if (p === false) {
				r = o;
			}
			return r;
		}
		return o;
	}

	function each(context, who, fn) {

		who = who || null;

		if (who && (who instanceof Array || who instanceof NodeList || (who.length !== undefined))) {
			for (var i = 0, l = who.length, r; 
				i < l && (r = fn.call(context, i, who[i])) !== false; 
				i++) { 
					if (r === -1) {
						who.splice(i, 1);
						i--; l--;
					}
				}
		}
		else if (who && typeof who === 'object' 
			&& !who.hasOwnProperty( 'constructor') 
			&& !who.constructor.hasOwnProperty('isPrototypeOf')) {

			for (var i in who) {
		      if (fn.call( context, i, who[ i ] ) === false) { break; }
		    }
		}
		else if (who) {
			fn.call(context, 0, who);
		}
		return context;
	}

	//
	// transition
	//
	// Give us our browser transition key if 
	// transitions are enabled
	// --------------------------------------------------

	function transition() {

		if (transition.enabled) {

			var el = 
			document.createElement('xanimate'), 
			t;

			for (t in transition.keys) {
				if (typeof el.style[t] !== 'undefined') {
					return transition.keys[t];
				}
			}
		}
		return null;
	}

	transition.enabled = false;

	transition.keys = {
		'transition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'MozTransition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd'
	};

	// property
	//
	// create copies of properties when possible while 
	// creating unique getter/setters for each member. Also, 
	// functions get a special super() capability which calls the 
	// samely named super class method in context [is recursive].
	// -------------------------------------------------------------

	function property(o, p, m) {

		var d = Object.getOwnPropertyDescriptor(p, m);

		if (typeof d.get !== 'undefined') {
			Object.defineProperty(o, m, d);
			return;
		}

		var  v = p[m],
			_v = copy(v);

		if (typeof _v === 'function') {
			_v = wrapFunction(_v, m);
		}

		Object.defineProperty(o, m, {

			get: function () {
				return _v;
			},

			set: function (value) {

				if (typeof value === 'function' 
					&& value.hasOwnProperty('constructor') === false
					&& value.__id__ === undefined) {
					value = wrapFunction(value, m);
				}
				_v = value;
			}
		});
	}

	function wrapFunction (fn, m) {

		if (fn.__id__) return fn;

		var func = function () {

			var result;

			pushStack(this, m);
			result = fn.apply(this, arguments);
			popStack(this, m);
			return result;
		};

		func.toString = function () {
			return fn.toString();
		};

		func.__id__ = uid();

		return func;
	}

	function pushStack (o, m) {

		var c = o.__chain__ = o.__chain__ || [],
			s = o.__stack__ = o.__stack__ || [],
			e = {method: m, super: o.__base__},
			i = c.lastIndexOf(m);

		if (i > -1) {
			e.super = e.super.prototype.__base__ || null;
		} 

		while (e.super !== null 
			&& (e.super.prototype[m] || '').__id__ === o[m].__id__) {
			e.super = e.super.prototype.__base__ || null;
		}

		s.push(e)
		c.push(m);
	}

	function popStack (o, m) {

		var c = o.__chain__ = o.__chain__ || [],
			s = o.__stack__ = o.__stack__ || [],
			i = c.lastIndexOf(m);

		if (i > -1) {
			c.splice(i, 1);
			s.splice(i, 1);
		}
	}

	//
	// Template Engine
	// lightweight template system
	//
	// features:
	//
	// data - {{<datapoint>}}
	// inject data points by (key) datapoint name.
	//
	// highlight - {{highlight:<datapoint>}}
	// inject identifying markup around a selected portion of matched text.
	//
	// template - {{template:<template name>}}
	// nest templates by using the keyword 'template' followed by a colon.
	//
	// loop - {{loop:<datapoint>}}{{/loop:datapoint}}
	// loop arrays, arrays of ojects, or objects with the 'loop' keyword.
	// you must close the loop using the data point name (key) of access.
	// $index is a hidden variable containing the increment index.
	//
	// scope - {{scope:<datapoint>}}{{/scope:datapoint}}
	// change object scope using the keyword 'scope.'
	// you must close the scope using the data point name (key) of access.
	//
	// Add your own rules by following the syntax style and creating callbacks in 
	// the tempalte.map object. to add custom markup injections, add markup templates 
	// to the templates._markup object.
	//
	// ---------------------------------------------------------------------------

	var _d = /{{([^{]+)}}/g;
	var _n = /{{([^}]+)}}(.*)({{\/\1}})/g;
	var _s = /\r|\t/g;

	function template (n, k, t, d) {

		n = n || '';
		t = t || {};
		d = d || {};

		d.$key = k;

		var tmp = template.get(n, t);

		tmp = tmp.replace(_s, '');

		tmp = tmp.replace(_n, function (s, c, h) {
			return template.statements(s, k, c, h, t, d);
		});

		tmp = tmp.replace(_d, function (s, c) {
			return template.inject(s, k, c, t, d)
		});

		return tmp;
	}

	template.get = function (n, t) {

		var tmp = n;

		if (t && t.hasOwnProperty(n)) {
			tmp = t[n];
		}

		if (tmp instanceof Array) {
			tmp = tmp.join('');
		}

		return tmp;
	};

	template.statements = function (s, k, c, h, t, d) {

		var p = c.split(':'),
			x = p[ 0 ],
			a = p[ 1 ];

		if ( template.map.hasOwnProperty( x ) ) {
			//if statements get special handling and passed the entire object
			return template.map[ x ]( h, k, t, x == 'if' ? d : (d[ a ] || d), a );
		}
		return '';
	};

	template.inject = function (s, k, c, t, d) {

		var p = c.split( ':' ),
			x = p[ 0 ],
			a = p[ 1 ];

		if ( a && template.map.hasOwnProperty( x ) ) {
			return template.map[ x ]( a, k, t, d, a );
		}

		if ( d.hasOwnProperty( x ) ) {
			return d[ x ];
		}

		return '';
	};

	template.markup = {

		highlight: [
			'<span class="highlight">',
				'$1',
			'</span>'
		],

		error: [
			'<span class="error">',
				'{{template}} not found',
			'</span>'
		]
	};

	template.map = {

		'loop': function (h, k, t, d, a) {


			var b = [], i, x, l, di, idx;

			if (typeof d === 'number' || (x = parseInt(a, 10)) > -1) {

				for (i = 0; i < (x || d); i++) {
					d.$index = i;
					b.push(template(h, k, t, d));
				}
			}
			else if (d instanceof Array) {

				for(i = 0, l = d.length; i < l; i++) {

					di = d[i];

					if (typeof di !== 'object') {
						di = {key: '', value: d[i]};
					}

					di.$index = i;
					b.push(template(h, k, t, di));
				}
			}
			else {
				for (i in d) {

					idx = idx || 0;

					b.push(template(h, k, t, {
						key: i, 
						value: d[i],
						$index: idx++
					}));
				}
			}
			return b.join('');
		},

		'if': function (h, k, t, d, a) {

			if (d.hasOwnProperty(a)) {

				var dp = d[a];

				if ((dp !== undefined && dp !== null && dp !== '' && dp !== false) 
					|| (dp instanceof Array && dp.length > 0)) {
					return template(h, k, t, d);
				}
			}
			return '';
		},

		'highlight': function (h, k, t, d, a) {

			var hl = d.highlight || '',
				v  = d[h], w;

			if (hl) {
				w = template.get('highlight', template.markup);
				v = v.replace(new RegExp('(' + hl + ')', 'gi'), w);
			}
			return v;
		},

		'scope': function (h, k, t, d, a) {
			return template(h, k, t, d);
		},

		'template': function (h, k, t, d, a) {
			return template(h, k, t, d);
		}
	};

	// eventEmitter
	// used for behavior hooks into components
	// and JavaScript event UI
	// --------------------------------------------------

	var eventEmitter = {

		xname: /^(\w+)\.?/,

		xns: /^\w+(\.?.*)$/,

		_add: function ( bucket, name, handler, context, single ) {

			var e = this.e( name );

			if ( bucket.hasOwnProperty( e.name ) !== true ) {
				 bucket[ e.name ] = [];
			}

			bucket[ e.name ].push({
				ns: e.ns || undefined,
				handler: handler || function () {},
				context: context || null,
				single: single === true
			});
		},

		e: function (e) {

			return {
				name: this.xname.exec( e )[ 1 ] || '',
				ns: ( this.xns.exec( e ) || [] )[ 1 ] || undefined
			};
		},

		args: function (args) {

		    for( var i = 0, a = [], l = args.length;
					i < l && a.push( args[ i ] );
					i++) { }

		    return a;
		},

		on: function on(bucket, event, handler, context) {
			return this._add(bucket, event, handler, context, false);
		},

		one: function(bucket, event, handler, context) {
			return this._add(bucket, event, handler, context, true);
		},

		off: function off (bucket, event, handler) {

			var e = this.e(event), stack, item, ns;

			if (bucket.hasOwnProperty(e.name)) {

				stack = bucket[ e.name ];
				ns = e.ns || undefined;

				for (var i = 0, l = stack.length; i < l; i++) {

					item = stack[ i ];

					if (item.ns === ns && (typeof handler === 'undefined' || handler === item.handler)) {
						stack.splice(i, 1);
						l = stack.length;
						i--;
					}
				}
			}
		},

		emit: function emit (bucket, argz /*, arguments */) {

			var args = this.args(argz),
				event = args.shift(),
				e = this.e( event ), 
				stack, item;

			if (bucket.hasOwnProperty(e.name)) {

				stack = bucket[e.name];

				for (var i = 0, l = stack.length; i < l; i++) {

					item = stack[ i ];

					if (!e.ns || item.ns === e.ns) {

						item.handler.apply(item.context || root, args);

						if (item.single) {
							
							stack.splice(i, 1);
							l = stack.length;
							i--;
						}
					}
				}
			}
		}
	};
	
	//
	// mkNasty
	// -----------------------------------

	function mkNasty() {}

	mkNasty._$ = $;

	mkNasty._uid = uid;

	mkNasty._copy = copy;

	mkNasty._each = each;

	mkNasty._property = property;

	mkNasty._transition = transition;

	mkNasty._template = template;

	mkNasty._eventEmitter = eventEmitter;

	mkNasty._keycodes = {
		backspace: 8, tab: 9, enter: 13, esc: 27, space: 32,
		pageup: 33, pagedown: 34, end: 35, home: 36,
		left: 37, up: 38, right: 39, down: 40, left: 37, right: 39,
		comma: 188
	};

	mkNasty.define = function (n, o) {

		var a = mkNasty, 
			p = n.split( '.' );

		for (var i = 0, l = p.length - 1; i < l; i++) {

			if (!a.hasOwnProperty(p[ i ])) {
				a[ p[ i ] ] = {};
			}
			a = a[ p[ i ] ];
		}
		return a[ p[ p.length - 1 ] ] = o;
	};

	mkNasty.get = function (n) {

		var o = null, 
			m = mkNasty,
			p = n.split('.');

		for (var i = 0, l = p.length; i < l; i++) {

			if (m.hasOwnProperty( p [ i ] )) {
				o = m[ p[ i ] ];
				m = o;
			}
			else {
				o = null;
			}
		}
		return o;
	};

	mkNasty.transitions = function (b) {

		if (b === true) {
			mkNasty._transition.enabled = true;
		} else if (b === false) {
			mkNasty._transition.enabled = false;
		}
		return mkNasty._transition.enabled;
	};

	mkNasty.create = function (name, base, proto) {

		name = name || '';

		proto = proto || base || {};

		base = typeof base === 'function' 
			&& base.prototype instanceof mkNasty 
			&& base || mkNasty;

		var obj = function () {
			this._init.apply( this, arguments );
			return this;
		};

		obj.prototype = Object.create(base.prototype);

		for (var member in proto) {
			mkNasty._property( obj.prototype, proto, member );
		}

		obj.prototype.constructor = obj;

		obj.prototype.__base__	= base;
		obj.prototype.__super__ = base;

		return this.define( name, obj );
	};

	mkNasty.prototype = {

		name: '',

		constructor: mkNasty,

		templates: {},

		formats: {},

		config: null,

		events: null,

		root: null,

		get keycode () {
			return mkNasty._keycodes;
		},

		get transitions () {
			return mkNasty._transition.enabled;
		},

		get version () {
			return 'v1.0.0';
		},

		get element () {
			return this.root[0];
		},

		super: function () {

			var s = this.__stack__[this.__stack__.length - 1],
				m = s.super && s.super.prototype[s.method] || null;

			if (m) {
				return m.apply(this, arguments);
			}
			return undefined;
		},

		$: function (s, c) {
			return mkNasty._$( s, c );
		},

		uid: function () {
			return mkNasty._uid();
		},

		copy: function (o) {
			return mkNasty._copy( o );
		},

		template: function (n, d) {
			return mkNasty._template( 
				n, this.name, this.config.templates, d) ;
		},

		format: function (n, d) {
			return mkNasty._template( 
				n, this.name, this.config.formats, d);
		},

		html: function (t, d) {
			return this.$(this.template(t, d));
		},

		each: function (who, fn) {
			return mkNasty._each(this, who, fn);
		},

		node: function (n, c) {
			return this.$(this.selector(n), c || this.root || null);
		},

		selector: function (n) {
			return '.' + (this.name && this.name + '-') + n;
		},

		transition: function (node, cb) {

			var $n = this.$(node),
				 t = mkNasty._transition(),
				 c = this;

			if (t) {

				$n.addClass('transition');

				$n.one(t, function (e) {

					var el = c.$(this);

					cb.call(c, e, el);
					el.removeClass('transition');
				});
				return this;
			}

			$n.removeClass('transition');

			return this.each($n, function (i, n) {
				setTimeout( function () {
					cb.call(c, {}, c.$(n));
				}, 1);
			});
		},

		delay: function (fn, ms) {

			var c = this;
			return setTimeout(function () {
				fn.call(c);
			}, ms || 1);
		},

		on: function ( event, handler ) {

			mkNasty._eventEmitter.on( 
				this.events,
				event,
				handler,
				this
			);
			return this;
		},

		one: function ( event, handler ) {

			mkNasty._eventEmitter.one(
				this.events,
				event,
				handler,
				this
			);
			return this;
		},

		off: function ( event, handler ) {

			mkNasty._eventEmitter.off(
				this.events,
				event,
				handler
			);
			return this;
		},

		emit: function ( event /*, arguments */ ) {

			mkNasty._eventEmitter.emit(
				this.events, arguments);
			return this;
		},

		_init: function ( r, o ) {

			// define properties such as:
			// templates, formats, name, etc.
			this._define( r, o );

			//build markup or invoke logic
			this._build();

			//bind events, hooks, messages, etc.
			this._bind();
		},

		_define: function ( r, o ) {

			this.root = this.$( r );

			this.events = {};

			this.config = {
				templates: {},
				formats: {}
			};

			this.each(this.formats, function ( n, v ) {
				this.config.formats[ n ] = v;
			});

			this.each(this.templates, function ( n, v ) {
				this.config.templates[ n ] = v;
			});

			this._config( o );

			return this;
		},

		_config: function ( o ) {

			o = o || {};

			this.each(o, function ( n, v ) {
				if ( n !== 'templates' && n !== 'formats') {
					this.config[ n ] = v;
				}
			});

			this.each(o.formats || {}, function ( n, v ) {
				this.config.formats[ n ] = v;
			});

			this.each(o.templates || {}, function (  n, v ) {
				this.config.templates[ n ] = v;
			});
		},

		_param: function (name, type, config, defaultt) {

			var value, t;

			if (config.hasOwnProperty(name)) {
				value = config[name];
			}

			if (typeof value === 'undefined' && type !== 'undefined') {
				value = this.root.data(name);
			}

			t = typeof value;

			if (t !== type) {

				switch(t) {

					case 'boolean':
						value = value === 'true' || 'false';
						break;

					case 'number':
						value = parseFloat(value, 10);
						break;

					case 'string':
						value = value.toString();

					case 'undefined':
						value = defaultt;
						break;

					case 'object':
						value = value === null 
							? defaultt : value;
						break;
				}
			}

			config[name] = value;

			return this;
		},

		_build: function () {},

		_bind: function () {}
	};

	return mkNasty;
});
