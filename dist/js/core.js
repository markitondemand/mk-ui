/*
	<file:js>
		<src>dist/js/core.js</src>
	</file:js>
*/
(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define([], function () {
			return (root.Mk = factory(root));
		});
	}
	else if (typeof module === 'object' && module.exports) {

		module.exports = root.document ?

			factory(root) :

			function (w) {
				if (!w.document) {
					throw new Error('Mk[ui] requires a window with a document');
				}
				return factory(w);
			};
	}
	else {
		root.Mk = factory(root);
	}

})(typeof window !== 'undefined' && window || this, function (root) {

'use strict';

var prop = ({}).hasOwnProperty;

function Mk () {}

Mk.$ = function (s, c) {
	return root.jQuery(s, c);
};


Mk.fn = {

    noop: function () {},

    keycodes: {
        backspace: 8, tab: 9, enter: 13, esc: 27, space: 32,
        pageup: 33, pagedown: 34, end: 35, home: 36,
        left: 37, up: 38, right: 39, down: 40, left: 37, right: 39,
        comma: 188
    },

    uid: function () {

        return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {

            var r = Math.random() * 16 | 0,
                v = c == 'x' && r || (r&0x3 | 0x8);

            return v.toString(16);
        });
    },

    property: function (o, p, m) {

        var d = Object.getOwnPropertyDescriptor(p, m),
            v = (d.get !== void+1 || d.set !== void+1) && d || {value: p[m]}, f;

        if (Mk.type(v.value, 'function')) {

            f = Mk.fn.wrapFunction(p[m], m);
            v = {
                get: function () {
                    return f;
                },
                set: function (value) {

                    if (Mk.type(value, 'function')) {
                        f = Mk.fn.wrapFunction(value, m);
                        return;
                    }
                    f = value;
                }
            };
        }
        Object.defineProperty(o, m, v);
    },

    wrapFunction: function (f, m) {

        if (f._id_) {
            return f;
        }

        var w = function () {
            this._pushSuper(m);
            var r = f.apply(this, arguments);
            this._popSuper(m);
            return r;
        };

        w._id_ = Mk._uid();

        w.toString = function () {
            return f.toString();
        };

        return w;
    },

    pushSuper: function (m) {
        this._chain_ = this._chain_ || [];
        this._chain_.push(m);
    },

    popSuper: function (m) {
        this._chain_.splice(
            this._chain_.lastIndexOf(m), 1);
    },

    each: function (c, o, f) {

        var i = 0, l, r;

        if (Mk.type(o, 'arraylike')) {

            l = o.length;

            for (; i < l; i++) {

                r = f.call(c, o[i], i, o);

                if (r === false) {
                    break;
                }

                if (r === -1) {
                    [].splice.call(o, i, 1);
                    i--; l--;
                }
            }
        }
        else {

            for (i in o) {

                r = f.call(c, o[i], i, o);

                if (r === false) {
                    break;
                }
                if (r === -1) {
                    delete o[i];
                }
            }
        }
        return c;
    },

    find: function (c, o, f) {

        var v;

        Mk.fn.each(c, o, function (e, i, oo) {

            v = f.call(this, e, i, oo);

            if (v !== void+1) {
                return false;
            }
        });
        return v;
    },

    map: function (c, o, f) {

        var a, r, i;

        if (Mk.type(o, 'arraylike')) {

            a = [];

            Array.prototype.map.call(o, function (e, x, z) {

                r = f.call(c, e, x, z);

                if (r !== void+1) {
                    a.push(r);
                }
            });
        }
        else {

            a = {};

            for (i in o) {

                r = f.call(c, o[i], i, o);

                if (r !== void+1) {
                    a[i] = r;
                }
            }
        }
        return a;
    },

    filter: function (c, o, f) {

        if (Mk.type(o, 'arraylike')) {
            return Array.prototype.filter.call(o, function (x, y, z) {
                f.call(c, x, y, z);
            });
        }

        var n = {}, i;

        for (i in o) {

            if (f.call(c, o[i], i, o) !== false) {
                n[i] = o[i];
            }
        }
        return n;
    },

    eventEmitter: {

        _add: function (b, n, h, c, s) {

            var e = this.e(n);

            if (!prop.call(b, e.name)) {
                 b[e.name] = [];
            }

            b[e.name].push({
                ns: e.ns || undefined,
                handler: h || noop,
                context: c || null,
                single:  s === true
            });
        },

        e: function (e) {

            return {
                name: /^(\w+)\.?/.exec( e )[ 1 ] || '',
                ns: ( /^\w+(\.?.*)$/.exec( e ) || [] )[ 1 ] || undefined
            };
        },

        args: function (args) {

            for( var i = 0, a = [], l = args.length;
                    i < l && a.push(args[ i ]);
                    i++) { }

            return a;
        },

        on: function on(b, e, h, c) {
            return this._add(b, e, h, c, false);
        },

        one: function(b, e, h, c) {
            return this._add(b, e, h, c, true);
        },

        off: function off (b, ev, h) {

            var e = this.e(ev),
                i = 0, s, item, ns, l;

            if (prop.call(b, e.name)) {

                s = b[e.name];
                ns = e.ns || void+1;
                l = s.length;

                for (; i < l; i++) {

                    item = s[i];

                    if (item.ns === ns && (Mk.type(h, 'u') || h === item.handler)) {
                        s.splice(i, 1);
                        l--;
                        i--;
                    }
                }
            }
        },

        emit: function emit (b, argz /*, arguments */) {

            var args = this.args(argz),
                ev = args.shift(),
                e = this.e(ev),
                i = 0, s, item, l;

            if (prop.call(b, e.name)) {

                s = b[e.name];
                l = s.length;

                for (; i < l; i++) {

                    item = s[ i ];

                    if (!e.ns || item.ns === e.ns) {

                        item.handler.apply(item.context || root, args);

                        if (item.single) {
                            s.splice(i, 1);
                            l--; i--;
                        }
                    }
                }
            }
        }
    },

    device: {

        exp: /(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i,

        get is () {
            return this.exp.test(navigator.userAgent);
        },

        get key () {

            var ua = navigator.userAgent,
                m  = (this.exp.exec(ua) || [])[1] || '';

            return m.toLowerCase();
        }
    }
};


/*
    Mk.type
    More complex typing
    Pass in a type or multiple types (pipe delimited)
    returns boolean

    types:
        string
        number
        object
        boolean
        function
        undefined
        null
        empty
        array
        arraylike
        class
        instance
        node
        nodelist
        window
        date
*/

Mk.type = function (o, t) {

    var c = t.toLowerCase().split('|'),
        r = false;

    for (var i = 0, l = c.length; i < l; i++) {

        if (Mk.fn.type.is(o, c[i])) {
            return true;
        }
    }
    return r;
};

Mk.fn.type = {

    is: function (o, t) {

        var r = typeof o == t;

        switch (t) {

            case 'empty':
                r = o === ''
                    || o === null
                    || o === void+1
                    || o === false;
                    break;

            case 'array':
                r = o instanceof Array;
                break;

            case 'null':
                r = o === null;
                break;

            case 'date':
                r = o instanceof Date;
                break;

            case 'instance':
                r = this.instance(o);
                break;

            case 'nodelist':
                r = o instanceof NodeList;
                break;

            case 'node':
                r = /1|9|11/.test(o && o.nodeType || 0);
                break;

            case 'window':
                r = o === window;
                break;

            case 'arraylike':
                r = this.arraylike(o);
                break;

            case 'class':
                r = this.clazz(o);
                break;

            case 'function':
                r = typeof o == 'function'
                    && !this.clazz(o);

                break;
        }
        return r;
    },

    arraylike: function (o) {

        if (Mk.type(o, 'function|string|window')) {
            return false;
        }

        var n = !!o && typeof o.length == 'number',
            l = n && 'length' in o && o.length;

        return Mk.type(o, 'array|nodelist')
            || l === 0 || n && l > 0 && (l - 1) in o;
    },

    instance: function (o) {

        var p = Object.getPrototypeOf(o),
            c = p && p.hasOwnProperty('constructor') && p.constructor,
            f = ({}).hasOwnProperty.toString;

        return (typeof c == 'function' && f.call(c) === f.call(Object)) !== true;
    },

    clazz: function (o) {

        return typeof o == 'function'
            && Object.keys(o).concat(
                Object.keys(o.prototype)).length > 0;
    }
};


//
// transition
//
// Give us our browser transition key if
// transitions are enabled
// --------------------------------------------------

Mk.transitions = {

    _enabled: false,

    _key: null,

    _keys: {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    },

    get enabled () {
        return this._enabled;
    },

    get disabled () {
        return this._enabled !== true;
    },

    get key () {

        if (this.enabled) {

            if (this._key) {
                return this._key;
            }

            var keys = this._keys,
                el = document.createElement('xanimate'), t;

            for (t in keys) {
                if (!Mk.type(el.style[t], 'undefined')) {
                    return this._key = keys[t];
                }
            }
        }
        return void+1;
    },

    enable: function () {
        return this._enabled = true;
    },

    disable: function () {
        return this._enabled = false;
    }
};


Mk.template = function (n, k, t, d) {
    return Mk.fn.template.parse(n, k, t, d);
}

Mk.fn.template = {

    markup: {
        highlight: '<span class="highlight">$1</span>',
        error: '<span class="error">{{template}} not found</span>'
    },

    parse: function (n, k, t, d) {

        n = n || '';
        t = t || {};
        d = d || {};

        d.$key = k;

        var tmp = this;

        return tmp
        .get(n, t)
        .replace(/[\r|\t|\n]+/g, '')
        .replace(/{{([^}]+)}}(.*)({{\/\1}})/g, function (s, c, h) {
            return tmp.statements(s, k, c, h, t, d);
        })
        .replace(/{{([^{]+)}}/g, function (s, c) {
            return tmp.inject(s, k, c, t, d)
        });
    },

    get: function (n, t) {

        var tmp = n;

        if (t && prop.call(t, n)) {
            tmp = t[n];
        }

        if (tmp instanceof Array) {
            tmp = tmp.join('');
        }
        return tmp;
    },

    statements: function (s, k, c, h, t, d) {

        var p = c.split(':'),
            x = p[ 0 ],
            a = p[ 1 ];

        if (prop.call(this.map, x)) {
            return this.map[ x ]( h, k, t, x == 'if' ? d : (d[ a ] || d), a );
        }
        return '';
    },

    inject: function (s, k, c, t, d) {

        var p = c.split( ':' ),
            x = p[ 0 ],
            a = p[ 1 ];

        if (a && prop.call(this.map, x)) {
            return this.map[x](a, k, t, d, a);
        }

        if (prop.call(d, x) && !Mk.type(d[x], 'undefined|null')) {
            return d[x];
        }
        return '';
    },

    map: {

        'loop': function (h, k, t, d, a) {

            var b = [], i, x, l, di, idx;

            if (Mk.type(d, 'number') || (x = parseInt(a, 10)) > -1) {

                for (i = 0; i < (x || d); i++) {

                    d.$index = i;
                    b.push(Mk.template(h, k, t, d));
                }
            }
            else if (d instanceof Array) {

                for(i = 0, l = d.length; i < l; i++) {

                    di = d[i];

                    if (!Mk.type(di, 'object')) {
                        di = {key: '', value: d[i]};
                    }

                    di.$index = i;
                    b.push(Mk.template(h, k, t, di));
                }
            }
            else {
                for (i in d) {

                    idx = idx || 0;

                    b.push(Mk.template(h, k, t, {
                        key: i,
                        value: d[i],
                        $index: idx++
                    }));
                }
            }
            return b.join('');
        },

        'if': function (h, k, t, d, a) {

            if (prop.call(d, a)) {

                var dp = d[a];

                if ((!Mk.type(dp, 'empty'))
                    || (dp instanceof Array && dp.length > 0)) {
                    return Mk.template(h, k, t, d);
                }
            }
            return '';
        },

        'highlight': function (h, k, t, d, a) {

            var tp = Mk.template,
                hl = d.highlight || '',
                v  = d[h], w;

            if (hl) {
                w = tp.get('highlight', tp.markup);
                v = v.replace(new RegExp('(' + hl + ')', 'gi'), w);
            }
            return v;
        },

        'scope': function (h, k, t, d, a) {
            return Mk.template(h, k, t, d);
        },

        'template': function (h, k, t, d, a) {
            return Mk.template(h, k, t, d);
        }
    }
};


Mk.define = function (n, o) {

    var a = Mk,
        p = n.split( '.' );

    for (var i = 0, l = p.length - 1; i < l; i++) {
        if (prop.call(a, p[i])) {
            a[p[i]] = {};
        }
        a = a[p[i]];
    }
    return a[p[p.length - 1]] = o;
};

Mk.get = function (n) {

    var o = null,
        m = Mk,
        p = n.split('.');

    for (var i = 0, l = p.length; i < l; i++) {
        if (prop.call(m, p[i])) {
            o = m[p[i]];
            m = o;
        }
        else {
            o = null;
        }
    }
    return o;
};

Mk.create = function (name, base, proto) {

    name = name || '';

    proto = proto || base || {};

    base = typeof base == 'function'
        && base.prototype instanceof Mk
        && base || Mk;

    var o, m, s,
        obj = function () {
            this._init.apply(this, arguments);
            return this;
        };

    o = obj.prototype = Object.create(base.prototype);

    for (m in proto) {
        Mk.fn.property(o, proto, m);
    }

    if (base !== Mk) {

        for (s in base) {

            Mk.fn.property(obj, base, s);
        }
    }

    o.constructor = obj;
    o._super_ = base;
    o._chain_ = null;

    return this.define(name, obj);
};


Mk.prototype = {
    /*
        <property:name>
            <desc>Unique name used for each object derived from Mk. This name will be used in templating signatures, markup, event emitters, and selectors.</desc>
        </property:name>
    */
    name: '',

    constructor: Mk,
    /*
        <property:templates>
            <desc>Contains default templates for generating markup. See the Templates section for more details.</desc>
        </property:templates>
    */
    templates: {},
    /*
        <property:formats>
            <desc>Contains default formats for text. See the Templates section for more details.</desc>
        </property:formats>
    */
    formats: {},
    /*
    <property:config>
        <desc>Configuration object of settings built of attributes and parameters passed into each instance.</desc>
    </property:config>
    */
    config: null,
    /*
    <property:events>
        <desc>Event Emitter handlers are stored here.</desc>
    </property:events>
    */
    events: null,
    /*
    <property:root>
        <desc>The root elements passed in as the first parameter to each instance of an Mk object.</desc>
    </property:root>
    */
    root: null,

    get _pushSuper () {
        return Mk.fn.pushSuper;
    },

    get _popSuper () {
        return Mk.fn.popSuper;
    },
    /*
    <property:super>
        <desc>The super is a property as well as a function. It is dynamic in that it will return you the same super method as derived method you are invoking, but in correct context. Super is also recursive and can be chained down until you reach the Core object, Mk.</desc>
    </property:super>
    */
    get super () {

        var p = this,
            c = p._chain_ || [],
            m = c[c.length - 1],
            d = c.reduce(function(a, b) {
                if (b === m) a++;
                return a;
            }, 0);

        while (d--) {
            p = p._super_.prototype;
        }

        if (p && prop.call(p, m)) {
            return p[m];
        }
        return null;
    },
    /*
    <property:keycode>
        <desc>Object containing friendly named keycodes for keyboard events.</desc>
    </property:super>
    */
    get keycode () {
        return Mk.fn.keycodes;
    },
    /*
    <property:transitions>
        <desc>Boolean representing if transitions are turned on or not.</desc>
    </property:transitions>
    */
    get transitions () {
        return Mk.transitions.enabled;
    },
    /*
    <property:version>
        <desc>Current version.</desc>
    </property:version>
    */
    get version () {
        return 'v1.0.0';
    },
    /*
    <property:element>
        <desc>The root as a raw Node.</desc>
    </property:element>
    */
    get element () {
        return this.root[0];
    },
    /*
    <property:device>
        <desc>Returns device API. See Device for more details.</desc>
    </property:device>
    */
    get device () {
        return Mk.fn.device;
    },
    /*
    <method:$>
        <invoke>.$(selector, context)</invoke>
        <param:selector>
            <type>Mixed - String/Node/NodeList/Wrapper</type>
            <desc>A selector, Node, NodeList, or wrapped ($) node.</desc>
        </param:selector>
        <param:context>
            <type>Mixed - String/Node/Wrapper</type>
            <desc>A parent selector, node, or wrapped ($) node.</desc>
        </param:context>
        <desc>DOM manipulation wrapper. Default is jQuery but can be changed to anything.</desc>
    </method:$>
    */
    $: function (s, c) {
        return Mk.$(s, c);
    },
    /*
    <method:uid>
        <invoke>.uid()</invoke>
        <desc>Generates a unique id.</desc>
    </method:uid>
    */
    uid: function () {
        return Mk._uid();
    },
    /*
    <method:template>
        <invoke>.template(name, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the template.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to template parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured tempates and returns parse string.</desc>
    </method:template>
    */
    template: function (n, d) {
        return Mk.template(n, this.name, this.config.templates, d);
    },
    /*
    <method:format>
        <invoke>.format(name, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the format.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to format parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured formats and returns parse string.</desc>
    </method:format>
    */
    format: function (n, d) {
        return Mk.template(n, this.name, this.config.formats, d);
    },
    /*
    <method:html>
        <invoke>.html(template, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the template.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to template parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured templates and returns a wrapped ($) Node/DocumentFragment.</desc>
    </method:html>
    */
    html: function (t, d) {
        return this.$(this.template(t, d));
    },
    /*
    <method:each>
        <invoke>.each(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loops objects and array-like objects running a function on each iteration. Return false to break loop. Return -1 to splice/delete item from object.</desc>
    </method:each>
    */
    each: function (o, f) {
        return Mk.fn.each(this, o, f);
    },
    /*
    <method:find>
        <invoke>.find(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loops objects and array-like objects running a function on each iteration. The first value to be returned will stop loop and assign from callback.</desc>
    </method:find>
    */
    find: function (o, f) {
        return Mk.fn.find(this, o, f);
    },
    /*
    <method:map>
        <invoke>.map(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loop objects and array-like objects and return a value on each iteraction to be 'mapped' to a new object (like Array's map). Return nothing, or undefined, to exclude adding anything for that iteration.</desc>
    </method:map>
    */
    map: function (o, f) {
        return Mk.fn.map(this, o, f);
    },
    /*
    <method:filter>
        <invoke>.filter(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loop objects and array-like objects and return true or false to specify whether to filter the element out of the new return object. (like Array's filter).</desc>
    </method:filter>
    */
    filter: function (o, f) {
        return Mk.fn.filter(this, o, f);
    },
    /*
    <method:node>
        <invoke>.node(selector[, context])</invoke>
        <param:selector>
            <type>String</type>
            <desc>A selector to be run through the selector() prefixer.</desc>
        </param:selector>
        <param:context>
            <type>Mixed</type>
            <desc>Selector/Node/Wrapped ($) Node to be used as context element. Default is root.</desc>
        </param:context>
        <desc>Shadow nodes created by Mk components have prefixed names. This method runs your selector through the prefixed name and root context to easily find your element.</desc>
    </method:node>
    */
    node: function (n, c) {
        return this.$(this.selector(n), c || this.root || null);
    },
    /*
    <method:selector>
        <invoke>.selector(name)</invoke>
        <param:name>
            <type>String</type>
            <desc>A selector to be prefixed with component naming.</desc>
        </param:name>
        <desc>Takes a base string selector (ie: 'list') and returns the component's true selector (ie: mk-core-list).</desc>
    </method:selector>
    */
    selector: function (n) {
        return '.' + this.name + (n && '-' + n || '');
    },
    /*
    <method:transition>
        <invoke>.transition(node, handler)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node to bind transition event handler on.</desc>
        </param:node>
        <param:handler>
            <type>Function</type>
            <desc>Event handler to be bound.</desc>
        </param:handler>
        <desc>Binds transition event to a node(s). If transitions are disabled, or not supported, handler is executed in setTimeout (1 millisecond).</desc>
    </method:transition>
    */
    transition: function (node, cb) {

        var  n = this.$(node),
             t = Mk.transitions.key,
             c = this;

        cb = cb || function () {};

        if (t) {

            n.addClass('transition');

            n.one(t, function (e) {
                n.removeClass('transition');
                cb.call(c, e, n);
            });

            return this;
        }

        n.removeClass('transition');

        return this.each(n, function (_n) {
            setTimeout( function () {
                cb.call(c, null, c.$(_n));
            }, 1);
        });
    },
    /*
    <method:clearTransitions>
        <invoke>.clearTransitions(node)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node to bind transition event handler on.</desc>
        </param:node>
        <desc>Clear transition handlers on node.</desc>
    </method:clearTransitions>
    */
    clearTransitions: function (n) {

        var t = Mk.transitions.key;

        if (t) {
            this.$(n).off(t);
        }
        return this;
    },
    /*
    <method:transitioning>
        <invoke>.transitioning(node)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node.</desc>
        </param:node>
        <desc>Returns true if element is currently transitioning. False for anything else.</desc>
    </method:clearTransitions>
    */
    transitioning: function (n) {
        return this.$(n).hasClass('transition');
    },
    /*
    <method:delay>
        <invoke>.delay(fn[, milliseconds])</invoke>
        <param:fn>
            <type>Function</type>
            <desc>Function to be invoked when delay ends.</desc>
        </param:fn>
        <param:milliseconds>
            <type>Number</type>
            <desc>Number of milliseconds for the timer. Default is 1.</desc>
        </param:milliseconds>
        <desc>Runs a timer on invoking a function. Useful for rendering race conditions and transition effects. For rendering race conditions, no milliseconds are necessary as the default (1) handles that.</desc>
    </method:delay>
    */
    delay: function (fn, ms) {

        var c = this, t;

        t = setTimeout(function () {

            fn.call(c);

            clearTimeout(t);
            t = null;

        }, ms || 1);

        return t;
    },
    /*
    <method:on>
        <invoke>.on(event, handler)</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Handler to invoke when event type has been emit.</desc>
        </param:handler>
        <desc>Binds a handler to an event type through the Event Emitter. Allows for namespaced events.</desc>
    </method:on>
    */
    on: function (e, h) {

        Mk.fn.eventEmitter.on(
            this.events, e, h, this);

        return this;
    },
    /*
    <method:one>
        <invoke>.one(event, handler)</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Handler to invoke when event type has been emit.</desc>
        </param:handler>
        <desc>Binds a handler to an event type through the Event Emitter. Once fired, an event bound through one() will be removed. Allows for namespaced events.</desc>
    </method:one>
    */
    one: function (e, h) {

        Mk.fn.eventEmitter.one(
            this.events, e, h, this);

        return this;
    },
    /*
    <method:off>
        <invoke>.off(event[, handler])</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Optional handler to remove. Defaults to remove all handlers for event type.</desc>
        </param:handler>
        <desc>Removes a handler (or all handlers) from an event type.</desc>
    </method:off>
    */
    off: function (e, h) {

        Mk.fn.eventEmitter.off(this.events, e, h);
        return this;
    },
    /*
    <method:emit>
        <invoke>.emit(event[, argument1, arguments2, ...])</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:arguments>
            <type>Mixed</type>
            <desc>Any other arguments passed through emit will be applied to the handlers invoked on the event.</desc>
        </param:arguments>
        <desc>Invokes handler(s) bound to event type.</desc>
    </method:emit>
    */
    emit: function (e /*, arguments */) {

        Mk.fn.eventEmitter.emit(this.events, arguments);
        return this;
    },
    /*
    <method:_init>
        <invoke>._init(root[, config])</invoke>
        <param:root>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node set to be the root.</desc>
        </param:root>
        <param:config>
            <type>Object</type>
            <desc>Configuration object passed into an instance as settings.</desc>
        </param:config>
        <desc>Internal, private, method used as a contructor. Useful when building your own custom components. Invoked internally only.</desc>
    </method:_init>
    */
    _init: function (r, o) {

        // define properties such as:
        // templates, formats, name, etc.
        this._define(r, o);

        //build markup or invoke logic
        this._build();

        //bind events, hooks, messages, etc.
        this._bind();
    },
    /*
    <method:_define>
        <invoke>._define(root[, config])</invoke>
        <param:root>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node set to be the root.</desc>
        </param:root>
        <param:config>
            <type>Object</type>
            <desc>Configuration object passed into an instance as settings.</desc>
        </param:config>
        <desc>A setup function called by _init. This initializes the root, events, config object, formats, templates, etc. Invoked internally only.</desc>
    </method:_define>
    */
    _define: function (r, o) {

        this.root = this.$(r);

        this.events = {};

        this.config = {
            templates: {},
            formats: {}
        };

        this.each(this.formats, function (v, n) {
            this.config.formats[ n ] = v;
        });

        this.each(this.templates, function (v, n) {
            this.config.templates[ n ] = v;
        });

        this._config(o);

        return this;
    },
    /*
    <method:_config>
        <invoke>._config(object)</invoke>
        <param:object>
            <type>Object</type>
            <desc>An object of end developer settings passed in and added to the config property.</desc>
        </param:object>
        <desc>Internal method, invoked by _init, responsible for setting object properties onto the internal configuration object.</desc>
    </method:_config>
    */
    _config: function (o) {

        o = o || {};

        var c = this.config;

        this.each(o, function (v, n) {

            if (Mk.type(v, 'object|arraylike') && prop.call(c, n)) {
                this.each(v, function (e, k) {
                    c[n][k] = e;
                });
            }
            else {
                c[n] = v;
            }
        });
        return this;
    },
    /*
    <method:_param>
        <invoke>._param(name, type, config, default[, node])</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of config property.</desc>
        </param:name>
        <param:type>
            <type>String</type>
            <desc>Type to case value to.</desc>
        </param:type>
        <param:config>
            <type>Object</type>
            <desc>Object to set result value on.</desc>
        </param:config>
        <param:default>
            <type>Mixed</type>
            <desc>Default value to set if no value is found through all other means.</desc>
        </param:default>
        <param:node>
            <type>Wrapped Node ($)</type>
            <desc>Optional Node to search for configurations on. Default is root.</desc>
        </param:node>
        <desc>Runs logic to find a configuration setting. It will first look to see if the value lives on config already. If not, it will check for the value on the node (or root if no node is specified). Lastly, it will type case the value based on the type specified. The final result will be set on the config object passed in.</desc>
    </method:_param>
    */
    _param: function (n, ty, o, d, el) {

        var v, t;

        if (prop.call(o, n)) {
            v = o[n];
        }

        if (v === void+1 && ty != 'undefined') {
            v = this.$(el || this.root).data(n);
        }

        t = typeof(v);

        if (t !== ty) {

            switch(ty) {

                case 'boolean':
                    v = v === 'true' || false;
                    break;

                case 'number':
                    v = parseFloat(v, 10);
                    break;

                case 'string':
                    v = v + '';

                case 'undefined':
                    v = d;
                    break;

                case 'object':
                    v = v === null
                        ? d : v;
                    break;
            }
        }

        o[n] = v;

        return this;
    },
    /*
    <method:_build>
        <invoke>._build()</invoke>
        <desc>Internal Placeholder method for building the components UI. Invoked internally by _init.</desc>
    </method:_build>
    */
    _build: function () {},
    /*
    <method:_bind>
        <invoke>._bind()</invoke>
        <desc>Internal Placeholder method for binding the components UI events. Invoked internally by _init.</desc>
    </method:_bind>
    */
    _bind: function () {}
};


    return Mk;
});
