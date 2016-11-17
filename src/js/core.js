/*
	<file:js>
		<src>dist/js/core.js</src>
	</file:js>
*/
(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( [ 'jquery' ], function ( $ ) {
			// assign to root in case there are global non-amd scripts on the page,
			// which use Mk
			return (root.Mk = factory( root, $ ));
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
					throw new Error( "Mk requires a window with a document" );
				}
				return factory( w, require( 'jquery' ) );
			};
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		root.Mk = factory( root, root.jQuery );
	}

})( typeof window !== "undefined" ? window : this, function (root, $) {


//
// check for array-like objects -
// array, NodeList, jQuery (anything with an iterator)
//

function arraylike (a) {

    var l = !!a && typeof a.length == 'number'
        && 'length' in a
        && a.length;

    if (typeof a === 'function' || a === root) {
        return false;
    }

    return a instanceof Array
        || a instanceof NodeList
        || l === 0
        || typeof l === 'number' && l > 0 && (l - 1) in a;
}

// test for object primitives vs.
// instantiated objects and prototypes
//

function basicObj (o) {

    if (!o || o.toString().toLowerCase() !== "[object object]" ) {
        return false;
    }

    var p = Object.getPrototypeOf(o),
        c = p.hasOwnProperty('constructor') && p.constructor,
        f = ({}).hasOwnProperty.toString,
        s = f.call(Object);

    if (!p) {
        return true;
    }

    return typeof c === 'function' && f.call(c) === s;
}

// check for vanulla functions
// vanilla functions have no keys and no prototype keys
//

function basicFunction (fn) {

    if (typeof fn !== 'function') {
        return false;
    }

    var keys = Object.keys(fn)
        .concat(Object.keys(fn.prototype));

    return keys.length < 1;
}

// generates unique ids
//

function uid () {
    return 'xxxx-4xxx-yxxx'.replace( /[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3 | 0x8);
        return v.toString(16);
    });
}

// deep copy objects to remove pointers
//

function copy(o) {

    var i, l ,r;

    if (o instanceof Array) {

        i = 0;
        l = o.length;
        r = [];

        for(; i < l && r.push(copy(o[i])); i++ ) {}
    }

    else if (basicObj(o)) {

        r = {};

        for(i in o) {
            r[i] = copy(o[i]);
            l = true;
        }
    }

    return r || o;
}

// loop arraylike objects, primities,
// and object instances over a callback function
//

function each (ctx, obj, fn) {

    var i = 0, l, r;

    if (arraylike(obj)) {

        l = obj.length;

        for (; i < l; i++) {

            r = fn.call(ctx, i, obj[i]);

            if (r === false) break;

            if (r === -1) {
                obj.splice(i, 1);
                i--; l--;
            }
        }
    }
    else {
        for (i in obj) {
            r = fn.call(ctx, i, obj[i]);

            if (r === false) { break; }
            else if (r === -1) { delete obj[i]; }
        }
    }
    return ctx;
}


//
// transition
//
// Give us our browser transition key if
// transitions are enabled
// --------------------------------------------------

function transition () {

    if (transition.enabled) {

        if (transition.key) {
            return transition.key;
        }

        var el = document.createElement('xanimate'), t;

        for (t in transition.keys) {
            if (typeof el.style[t] !== 'undefined') {
                return transition.key = transition.keys[t];
            }
        }
    }
    return null;
}

transition.enabled = false;

transition.key = null;

transition.keys = {
    'transition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'MozTransition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
};


// property
//
// ES5 defineProperty, propertyDescriptor, etc. to allow getters,
// setters, and hyjack vanilla functions to take advantage of super() -
// a dynamic method allowing super object references.
// -------------------------------------------------------------

function property (obj, proto, member) {

    var desc = Object.getOwnPropertyDescriptor(proto, member),
        prop, fn;

    if (typeof desc.get !== 'undefined') {
        return Object.defineProperty(obj, member, desc);
    }

    prop = proto[member];

    if (!basicFunction(prop)) {
        return obj[member] = copy(prop);
    }

    fn = wrapFunction(prop, member);

    Object.defineProperty(obj, member, {

        get: function () {
            return fn;
        },

        set: function (value) {

            var v = value;

            if (basicFunction(value)) {
                v = wrapFunction(value);
            }

            fn = v;
        }
    });
}

//
// wrap vanilla functions to allow super() cabability
//

function wrapFunction (fn, m) {

    if (fn._id_) {
        return fn;
    }

    var func = function () {

        this._pushsuper_(m);

        var r = fn.apply(this, arguments);

        this._popsuper_(m);

        return r;
    };

    func._id_ = uid();

    func.toString = function () {
        return fn.toString();
    };

    return func;
}

//
// keeps track of call stacks
// which allows super() to be called properly
// with nested functions (functions calling other functions calling super)
//

function pushsuper (m) {

    var ch = this._chain_ = this._chain_ || [],
        st = this._stack_ = this._stack_ || [],
        i  = ch.lastIndexOf(m),
        s  = this._super_,
        p  = s && s.prototype || {},
        f  = this[m];

    if (i > -1) {
        s = st[i].super.prototype._super_ || null;
        p = s && s.prototype || {};
    }

    while (s !== null
        && p.hasOwnProperty(m)
        && p[m]._id_ === f._id_) {

        s = p._super_ || null;
        p = s && s.prototype || {};
    }

    st.push({method: m, super: s});
    ch.push(m);
}

//
// pop functions out of the call stack
// to keep super() context in place
//

function popsuper (m) {

    var ch = this._chain_ = this._chain_ || [],
        st = this._stack_ = this._stack_ || [],
        i  = ch.lastIndexOf(m);

    if (i > -1) {

        ch.splice(i, 1);
        st.splice(i, 1);
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
var _s = /[\r|\t|\n]+/g;

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

// find template

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

// parse statements only (handlbars that open/close)

template.statements = function (s, k, c, h, t, d) {

    var p = c.split(':'),
        x = p[ 0 ],
        a = p[ 1 ];

    if (template.map.hasOwnProperty(x)) {
        //if statements get special handling and passed the entire object
        return template.map[ x ]( h, k, t, x == 'if' ? d : (d[ a ] || d), a );
    }
    return '';
};

// parse injections (handlebars that are self closing)

template.inject = function (s, k, c, t, d) {

    var p = c.split( ':' ),
        x = p[ 0 ],
        a = p[ 1 ];

    if (a && template.map.hasOwnProperty(x)) {
        return template.map[x](a, k, t, d, a);
    }

    if (d.hasOwnProperty(x) && (typeof d[x] !== 'undefined') && d[x] !== null) {
        return d[x];
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

// a map of the different statements
// allowed in templates
//

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
// simple device checking
//

var agent  = navigator.userAgent,
    device = {

        agentexp: /(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i,

        get is () {
            return this.agentexp.test(agent)
        },

        get isAndroid () {
            return this.id === 'android';
        },

        get isWebos () {
            return this.id === 'webos';
        },

        get isiPhone () {
            return this.id === 'iphone';
        },

        get isiPad () {
            return this.id === 'ipad';
        },

        get isiPod () {
            return this.id === 'ipod';
        },

        get isBlackberry () {
            return this.id === 'blackberry';
        },

        get isIEMobile () {
            return this.id === 'iemobile';
        },

        get isOperaMini () {
            return this.id === 'opera mini';
        },

        get id () {
            return ((this.agentexp.exec(agent) || [])[1] || '').toLowerCase();
        }
};


/*
    Super light-weight DOM library
    We've chosen to leave jQuery out of the default build
    and use a very light weight roll of common DOM functionality.
    You can always replace this implementation with jQuery or any other
    by:

    1. using AMD, define a module called MkDOM as a dependency of Core.
    2. Vanilla JavaScript, just set window.MkDOM to a different library.

    The Core.$ will be overridden with the new library you've specified.
    Make sure method names for the below are the SAME or current components will break
    on referencing non existent members.
*/

var dom = (function () {
    /*
        Members:

        length

        is()
        val()
        each()
        find()
        filter()
        parent() (also does closest)
        hasClass()
        addClass()
        removeClass()
        attr()
        prop()
        data()
        html()
        text()
        markup()
        appendTo()
        prependTo()
        append()
        prepend()
        remove()
        on()
        one()
        off()
        emit()
        ajax()
    */

    var
    doc = document,
    //
    // elem cache system
    // ------------------------------------
    cache = {},
    //
    // shorthand slice
    // ------------------------------------
    slice = [].slice,
    //
    // clearing out arraylike objects
    // ------------------------------------
    splice = [].splice,
    //
    // making objects arraylike
    // ------------------------------------
    push = [].push,
    //
    // tag/markup testing
    // ------------------------------------
    tg = /^\s*<([^>\s]+)/,
    //
    // nodeType testing
    // ------------------------------------
    nt = /1|9|11/,
    //
    // no operation
    // ------------------------------------
    noop = function () {},
    //
    // html creation wrappers
    // -------------------------------------
    wrap = {
    	option: [ 1, '<select multiple="multiple">', '</select>' ],
    	thead: [ 1, '<table>', '</table>' ],
    	col: [ 2, '<table><colgroup>', '</colgroup></table>' ],
    	tr: [ 2, '<table><tbody>', '</tbody></table>' ],
    	td: [ 3, '<table><tbody><tr>', '</tr></tbody></table>' ],
        li: [1, '<ul>', '</ul>'],
        dd: [1, '<dl>', '</dl>'],
    	defaultt: [ 0, "", "" ]
    };
    //
    // element wrap duplicates
    // ----------------------------------------
    wrap.caption = wrap.thead;
    wrap.optgroup = wrap.option;
    wrap.tbody = wrap.thead;
    wrap.tfoot = wrap.thead;
    wrap.dt = wrap.dd;
    //
    // data - store/retrieve data and data attributes
    // ----------------------------------------
    function data (n, k, vl) {

        if (n) {

            var id = n._id = n._id || uid(),
                c  = cache[id] || {},
                v  = vl;

            if (k === null) {

                n._id = null;
                delete cache[id];
                return c;
            }

            // undefined
            if (v === void+1) {
                v = c[k] || n.getAttribute('data-' + k) || null;
                c[k] = v;
            }
            // remove key
            else if (vl === null) {
                v = c[k];
                delete c[k];
            }
            // set key
            else {
                c[k] = v;
            }

            cache[id] = c;

            return v;
        }
    }

    function remove (n) {

        var d;

        each(this, n.childNodes, function (i, c) {
            if (c && c.nodeType === 1) {
                remove(c);
            }
        });

        var d = data(n, null);

        if (d && d.events) {
            each(this, d.events, function (t, v) {
                console.info('removing', t)
                off(n, t);
            });
        }

        n.parentNode.removeChild(n);
    }

    //
    // jsonp
    // -----------------------------------

    function xhr (o) {
        this.init(o);
    }

    xhr.prototype = {

        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
        },

        xhr: null,

        open: false,

        options: null,

        url: function (u) {

            u = (u || location.href);//.replace(/^http[s]?\:\/\//, '');

            var t = u.lastIndexOf('/');

            if (t > -1 && (t = u.indexOf('#')) > -1) {
                u = u.substr(0, t)
            }
            return u;
        },

        qs: function (o) {

            o = o || '';

            if (typeof o !== 'string') {

                var d = [];

                each(this, o, function (n, v) {
                    d.push(n + '=' + encodeURIComponent(v));
                });

                return d.join('&');
            }
            return o;
        },

        init: function (o) {

            o = copy(o || {});

            o.url = this.url(o.url);
            o.data = this.qs(o.data);
            o.method = (o.method || 'GET').toUpperCase();
            o.type = o.type || 'html';
            o.headers = o.headers || {};
            o.async = o.async || true;
            o.encode = o.encode || true;
            o.encoding = o.encoding || 'utf-8';
            o.user = o.user || '';
            o.password = o.password || '';

            o.complete = o.complete || noop;
            o.success = o.success || noop;
            o.error = o.error || noop;

            if (o.data && o.method === 'GET') {
                o.url  = o.url.indexOf('?') > -1 && o.url || o.url + '?';
                o.url += o.data;
                o.data = null;
            }

            each(this, this.headers, function (n, v) {
                if (o.headers.hasOwnProperty(n) !== true) {
                    o.headers[n] = v;
                }
            });

            if (o.encode && ['POST', 'PUT'].indexOf(o.type) > -1) {
                o.headers['Content-type'] =
                    'application/x-www-form-urlencoded' + o.encoding
            }

            this.options = o;

            if (o.now !== false) {
                this.send();
            }
            return this;
        },

        jsonp: function jsonp () {

            if (this.open) {
                return this;
            }

            var x = this,
                o = x.options,
                s = doc.createElement('script'),

                id = o.jsonpid = 'MKUI' + uid().split('-').join(''),
                qs = 'callback=' + id;

            s.type = 'text/javascript';
            s.language = 'javascript';
            s.async = o.async;
            s.src = o.url + (o.url.indexOf('?') > -1 && '&' || '?') + qs;
            s.id = o.scriptid = uid();

            s.onerror = function () {
                o.error.call(x);
            };

            s.onload = function () {
                o.complete.call(x);
            };

            var cb = function (data) {

                x.response = data;
                x.status = 200;

                s.onload  = null;
                s.onerror = null;
                s.parentNode.removeChild(s);

                o.success.call(x, data);

                delete root[id];
            };

            root[id] = cb;

            doc.documentElement
                .firstChild.appendChild(s);

            this.open = true;
            this.status = 0;

            return this;
        },

        send: function () {

            if (this.open) {
                return this;
            }

            var x = this,
                o = x.options,
                xhr;

            if (o.type === 'jsonp') {
                return this.jsonp();
            }

            xhr = this.xhr = new XMLHttpRequest();

            xhr.open(o.method, o.url, o.async, o.user, o.password);
            xhr.onreadystatechange = function () {
                x.stateChange();
            };

            if (o.user && 'withCredentials' in xhr) {
                xhr.withCredentials = true;
            }

            each(this, o.headers, function (n, v) {
                xhr.setRequestHeader(n, v);
            });

            if (o.type && o.type !== 'text') {
                xhr.responseType = o.type;
            }

            x.open = true;
            x.status = 0;

            xhr.send(o.data);

            if (o.async !== true) {
                this.stateChange();
            }
            return this;
        },

        abort: function () {

            this.open = false;
            this.status = 0;

            if (this.xhr) {
                this.xhr.abort();
                this.xhr.onreadystatechange = null;
                this.xhr = null;
                return this;
            }

            var x = this,
                o = x.options,
                s = doc.getElementById(o.scriptid),
                id = o.jsonpid;

            if (s) {
                s.parentNode.removeChild(s);
            }

            root[id] = function () {
                delete root[id];
            };

            root[id]();

            return this;
        },

        stateChange: function () {

            var xhr = this.xhr,
                x = this,
                o = x.options;

            if (xhr.readyState !== 4) {
                return;
            }

            o.complete.call(x, xhr);

            x.status = xhr.status;
            x.statusText = xhr.statusText;

            if (x.status === 1223) {
                x.status = 204;
                x.statusText = 'No Content';
            }

            x.open = false;
            x.response = xhr.response || null;

            if (xhr.responseType === '' || xhr.responseType === 'text') {
                x.response = xhr.responseText;
            }

            xhr.onreadystatechange = function () {};

            if (x.status >= 200 && x.status < 300) {
                o.success.call(x, x.response, xhr);
            } else {
                o.error.call(x, xhr);
            }
        }
    };

    //
    // dom events
    // -----------------------------------

    function del (p, n, x) {

        var r = {s: false, t: p};

        if (!x) {
            r.s = true;
        }
        else {
            new dom(x, p).each(function (i, el) {

                if (n === el || new dom(n).parent(el).length) {
                    r.s = true;
                    r.t = el;
                    return false;
                }
            });
        }

        return r;
    }

    function event (n, a, t, s, f, o, x) {

        var h, d;

        if (a) {

            h = function (e) {

                var z = false,
                    w = del(this, e.target, x),
                    r;

                if (e.ns) {
                    if (e.ns === s && w.s) {
                        r = f.apply(w.t, [e].concat(e.data));
                        z = true;
                    }
                }
                else if (w.s) {
                    r = f.call(w.t, e);
                    z = true;
                }

                if (z && o) {
                    event(n, false, t, s, f, o, x);
                }
                return r;
            };

            d = data(n, 'events') || {};

            d[t] = d[t] || [];

            d[t].push({
                type: t,
                ns: s,
                original: f,
                handler: h,
                delegate: x
            });

            data(n, 'events', d);

            n.addEventListener(t, h, false);

            return;
        }

        d = (data(n, 'events') || {})[t] || [];

        each(this, d, function (i, o) {
            if (!s || s && o.ns === s) {
                if (!f || f === o.original) {
                    n.removeEventListener(t, o.handler);
                    return -1;
                }
            }
        });
    }

    function on (n, t, d, h, o, x) {

        var p = t.split('.'),
            e = p.shift();

        event(n, true, e, p.join('.'), h, o, x);
    }

    function off (n, t, h) {

        var p = t.split('.'),
            e = p.shift();

        event(n, false, e, p.join('.'), h);
    }

    function emit (n, t, d) {

        var p = t.split('.'),
            e = p.shift(),
            ev = new Event(e);

        ev.ns = p.join('.');
        ev.data = d || [];

        n.dispatchEvent(ev);
    }

    function dom (s, c) {
        this.find(s, c);
    }

    dom.ajax = function () {
        return new xhr(o);
    };

    dom.prototype = {

        length: 0,

        context: null,

        constructor: dom,

        each: function (fn) {
            return each(this, this, fn);
        },

        find: function (s, c) {

            s = s || doc;
            c = c || this.length && this || [doc];

            if (typeof c === 'string') {
                c = new dom(c, doc);
            } else if (c.nodeType) {
                c = [c];
            }

            var n = s;

            if (typeof s === 'string') {

                if (tg.test(s)) {
                    n = this.markup(s);
                }
                else {

                    n = [];

                    each(this, c, function (i, el) {
                        n = n.concat(slice.call(el.querySelectorAll(s)));
                    });
                }
            }

            if (n && nt.test(n.nodeType)) {
                n = [n];
            }

            if (arraylike(n)) {
                n = slice.call(n);
            }

            splice.call(this, 0, this.length || 0);
            push.apply(this, n);

            this.context = c;

            return this;
        },

        is: function (s) {

            var elems = new dom(s, this.context),
                result = false;

            this.each(function (i, el) {
                elems.each(function (x, _el) {
                    if (el === _el) {
                        result = true; return false;
                    }
                });
                if (result) return false;
            });

            return result;
        },

        filter: function (s) {

            var elems = new dom(s, this.context),
                filtered = [];

            this.each(function (i, el) {
                elems.each(function (x, _el) {
                    if (el === _el) filtered.push(el);
                });
            });
            return new dom(filtered, this.context);
        },

        parent: function (s, c) {

            var p = [], ps;

            if (arguments.length) {

                ps = new dom(s, c);

                this.each(function (i, el) {

                    while (el.parentNode) {
                        ps.each(function (x, _el) {

                            if (_el === el.parentNode) {

                                if (p.indexOf(_el) < 0) {
                                    p.push(_el);
                                }
                                return false;
                            }
                        });
                        el = el.parentNode;
                    }
                });
            }
            else {
                this.each(function (i, el) {
                    if (el.parentNode) p.push(el.parentNode);
                });
            }
            return new dom(p);
        },

        markup: function (s) {

            // if we support html5 templates (everybody but IE)
            var c = doc.createElement('template');

            if (c.content) {
                c.innerHTML = s;
                return slice.call(c.content.childNodes);
            }

            // IE does this...
            var t = tg.exec(s)[1] || null,
                a = t && wrap.hasOwnProperty(t) && wrap[t] || wrap.defaultt,
                i = 0;

            c = doc.createElement('div');
            c.innerHTML = a[1] + s + a[2];

            while (i < a[0]) {
                c = c.firstChild;
                i++;
            }

            return slice.call(c.childNodes);
        },

        html: function (s) {

            if (s === void+1) {
                if (this.length) {
                    return this[0].innerHTML;
                }
                return null;
            }

            return this.each(function (i, el) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
                each(this, this.markup(s), function (x, f) {
                    el.appendChild(f);
                });
            });
        },

        text: function (s) {

            if (s === void+1) {
                if (this.length) {
                    return this[0].textContent;
                }
                return null;
            }

            return this.each(function (i, el) {
                el.textContent = s;
            });
        },

        nv: function (n, v, fn) {

            if (typeof n === 'object') {
                for (var i in n) {
                    fn.call(this, i, n[i]);
                }
                return this;
            }
            return fn.call(this, n, v);
        },

        attr: function (n, v) {
            return this.nv(n, v, function (_n, _v) {

                if (_v === void+1) {
                    return this.length && this[0].getAttribute(_n);
                }
                return this.each(function (i, el) {
                    if (_v === null) {
                        el.removeAttribute(_n);
                        return;
                    }
                    el.setAttribute(_n, _v);
                });
            });
        },

        prop: function (n, v) {
            return this.nv(n, v, function (_n, _v) {
                if (_v === void+1) {
                    return this.length && this[0][_n] || null;
                }
                return this.each(function (i, el) {
                    el[_n] = _v;
                });
            });
        },

        val: function (v) {

            if (v === void+1 && this.length) {
                return this[0].value;
            }

            return this.each(function(i, el) {
                el.value = v;
            })
        },

        data: function (n, v) {
            return this.nv(n, v, function (_n, _v) {
                if (_v === void+1) {
                    return data(this[0], _n);
                }
                return this.each(function (i, el) {
                    data(el, _n, _v);
                });
            });
        },

        css: function (n, v) {
            return this.nv(n, v, function (_n, _v) {
                if (_v === void+1 && this.length) {
                    return getComputedStyle(this[0]).getPropertyValue(_v);
                }
                return this.each(function (i, el) {
                    el.style[_n] = typeof _v === 'number' && (_v + 'px') || _v;
                });
            });
        },

        hasClass: function (v) {

            var r = false;
            this.each(function (i, el) {
                if (el.classList.contains(v)) {
                    r = true; return false;
                }
            });
            return r;
        },

        addClass: function (value) {

            var values = value.split(' '), c;

            return each(this, values, function (i, v) {
                this.each(function (x, el) {
                    el.classList.add(v);
                });
            });
        },

        removeClass: function (value) {

            var values = value.split(' '), c, _v;

            return each(this, values, function (i, v) {
                this.each(function (x, el) {
                    el.classList.remove(v);
                });
            });
        },

        appendTo: function (s, c) {

            var elem = new dom(s, c)[0] || null;

            if (elem) {
                this.each(function (i, el) {
                    elem.appendChild(el);
                });
            }
            return this;
        },

        prependTo: function (s, c) {

            var elem = new dom(s, c)[0] || null;

            if (elem) {
                this.each(function (i, el) {
                    if (elem.firstChild) {
                        elem.insertBefore(el, elem.firstChild);
                        return;
                    }
                    elem.appendChild(el);
                });
            }
            return this;
        },

        append: function (s, c) {

            if (this.length) {

                var elem = this[this.length - 1];

                new dom(s, c).each(function (i, el) {
                    elem.appendChild(el);
                });
            }
            return this;
        },

        prepend: function (s, c) {

            if (this.length) {

                var elem = this[this.length - 1];

                new dom(s, c).each(function (i, el) {
                    if (elem.firstChild) {
                        elem.insertBefore(el, elem.firstChild);
                        return;
                    }
                    elem.appendChild(el);
                });
            }
        },

        remove: function (s) {

            var o = this, e;

            if (arguments.length) {
                o = new dom(s, this);
            }

            o.each(function (i, el) {
                remove(el);
            });

            return this;
        },

        on: function (t, d, h) {

            if (!h) {
                h = d;
                d = null;
            }

            return this.each(function (i, el) {
                on(el, t, '', h, false, d);
            });
        },

        one: function (t, d, h) {

            if (!h) {
                h = d;
                d = null;
            }

            return this.each(function (i, el) {
                on(el, t, '', h, true, d);
            });
        },

        off: function (t, h) {
            return this.each(function (i, el) {
                off(el, t, h);
            });
        },

        emit: function (t, d) {
            return this.each(function (i, el) {
                emit(el, t, d);
            });
        }
    };

    return dom;

})();


function Mk() {}

Mk._$ = function (s, c) {
    return new dom(s, c);
};

Mk._uid = uid;

Mk._copy = copy;

Mk._each = each;

Mk._property = property;

Mk._pushsuper = pushsuper;

Mk._popsuper = popsuper;

Mk._transition = transition;

Mk._template = template;

Mk._eventEmitter = eventEmitter;

Mk._device = device;

Mk._keycodes = {
    backspace: 8, tab: 9, enter: 13, esc: 27, space: 32,
    pageup: 33, pagedown: 34, end: 35, home: 36,
    left: 37, up: 38, right: 39, down: 40, left: 37, right: 39,
    comma: 188
};

Mk.define = function (n, o) {

    var a = Mk,
        p = n.split( '.' );

    for (var i = 0, l = p.length - 1; i < l; i++) {

        if (!a.hasOwnProperty(p[ i ])) {
            a[ p[ i ] ] = {};
        }
        a = a[ p[ i ] ];
    }
    return a[ p[ p.length - 1 ] ] = o;
};

Mk.get = function (n) {

    var o = null,
        m = Mk,
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

Mk.transitions = function (b) {

    if (b === true) {
        Mk._transition.enabled = true;
    } else if (b === false) {
        Mk._transition.enabled = false;
    }
    return Mk._transition.enabled;
};

Mk.create = function (name, base, proto) {

    name = name || '';

    proto = proto || base || {};

    base = typeof base === 'function'
        && base.prototype instanceof Mk
        && base || Mk;

    var member, statics, obj = function () {
        this._init.apply( this, arguments );
        return this;
    };

    obj.prototype = Object.create(base.prototype);

    for (member in proto) {
        Mk._property(obj.prototype, proto, member);
    }

    if (base !== Mk) {
        for (statics in base) {
            Mk._property(obj, base, statics);
        }
    }

    obj.prototype.constructor = obj;
    obj.prototype._super_ = base;

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

    get _pushsuper_ () {
        return Mk._pushsuper;
    },

    get _popsuper_ () {
        return Mk._popsuper;
    },
    /*
    <property:super>
        <desc>The super is a property as well as a function. It is dynamic in that it will return you the same super method as derived method you are invoking, but in correct context. Super is also recursive and can be chained down until you reach the Core object, Mk.</desc>
    </property:super>
    */
    get super () {

        var s = this._stack_[this._stack_.length - 1], m;

        if (s) {
            m = s.super && s.super.prototype
                && s.super.prototype[s.method];
        }
        return m;
    },
    /*
    <property:keycode>
        <desc>Object containing friendly named keycodes for keyboard events.</desc>
    </property:super>
    */
    get keycode () {
        return Mk._keycodes;
    },
    /*
    <property:transitions>
        <desc>Boolean representing if transitions are turned on or not.</desc>
    </property:transitions>
    */
    get transitions () {
        return Mk._transition.enabled;
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
        return Mk._device;
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
        return new Mk._$( s, c );
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
    <method:copy>
        <invoke>.copy(object)</invoke>
        <param:object>
            <type>Mixed</type>
            <desc>Object (of any type) to copy.</desc>
        </param:object>
        <desc>Deep copy an object to remove pointers.</desc>
    </method:copy>
    */
    copy: function (o) {
        return Mk._copy( o );
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
        return Mk._template(
            n, this.name, this.config.templates, d) ;
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
        return Mk._template(
            n, this.name, this.config.formats, d);
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
    each: function (who, fn) {
        return Mk._each(this, who, fn);
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

        var $n = this.$(node),
             t = Mk._transition(),
             c = this;

        cb = cb || function () {};

        if (t) {

            $n.addClass('transition');

            $n.one(t, function (e) {
                $n.removeClass('transition');
                cb.call(c, e, $n);
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

        var t = Mk._transition();

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

        var c = this;
        return setTimeout(function () {
            fn.call(c);
        }, ms || 1);
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
    on: function ( event, handler ) {

        Mk._eventEmitter.on(
            this.events,
            event,
            handler,
            this
        );
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
    one: function ( event, handler ) {

        Mk._eventEmitter.one(
            this.events,
            event,
            handler,
            this
        );
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
    off: function ( event, handler ) {

        Mk._eventEmitter.off(
            this.events,
            event,
            handler
        );
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
    emit: function ( event /*, arguments */ ) {

        Mk._eventEmitter.emit(
            this.events, arguments);
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
    _init: function ( r, o ) {

        // define properties such as:
        // templates, formats, name, etc.
        this._define( r, o );

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

        this.each(o, function (n, v) {

            var looped = false;

            if (typeof v === 'object' && this.config.hasOwnProperty(n)) {

                this.each(v, function (k, vv) {
                    this.config[n][k] = vv;
                    looped = true;
                });
            }

            if (looped === false) {
                this.config[n] = v;
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
    _param: function (name, type, config, defaultt, elem) {

        var value, t;

        if (config.hasOwnProperty(name)) {
            value = config[name];
        }

        if (typeof value === 'undefined' && type !== 'undefined') {
            value = (elem || this.root).data(name);
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
