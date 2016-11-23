/*
	<file:js>
		<src>dist/js/core.js</src>
	</file:js>
*/
(function (root, factory) {

	if (typeof define === "function" && define.amd) {
		define([], function () {
			return (root.Mk = factory(root));
		});
	}
	else if (typeof module === "object" && module.exports) {

		module.exports = root.document ?

			factory(root) :

			function (w) {
				if (!w.document) {
					throw new Error("Mk[ui] requires a window with a document");
				}
				return factory(w);
			};
	}
	else {
		root.Mk = factory(root);
	}

})(typeof window !== "undefined" && window || this, function (root) {

"use strict";

var prop = ({}).hasOwnProperty;

var noop = function () {};

var Mk = function () {};

Mk.fn = {};

Mk.$ = function (s, c) {
	return root.jQuery(s, c);
};


Mk.fn.uid = function () {

    return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {

        var r = Math.random() * 16 | 0,
            v = c == 'x' && r || (r&0x3 | 0x8);

        return v.toString(16);
    });
};


Mk.type = function (obj, type) {

    var types = type.toLowerCase().split("|"),
        count = types.length,
        table = Mk.fn.typemap,
        i = 0, fn, ty;

    for (; i < count; i++) {

        ty = types[i];
        fn = prop.call(table, ty) ? table[ty] : table.defaultt;

        if (fn(obj, ty)) {
            return true;
        }
    }
    return false;
};

Mk.fn.typemap = {

    "index": function (o, i) {
        return o.indexOf(i) > -1;
    },

    "array": function (o) {
        return o instanceof Array;
    },

    "empty": function (o) {
        return o === "" || o === null
            || o === void+1 || o === false;
    },

    "null": function (o) {
        return o === null;
    },

    "date": function (o) {
        return o instanceof Date || o === Date;
    },

    "nodelist": function (o) {
        return o instanceof NodeList;
    },

    "node": function (o) {
        return /1|9|11/.test(o && o.nodeType || 0);
    },

    "window": function (o) {
        return o && o === o.window;
    },

    "function": function (o) {
        return typeof o === "function"
            && !Mk.fn.typemap.classlike(o);
    },

    "arraylike": function (o) {

        if (Mk.type(o, "function|string|window")) {
            return false;
        }

        var n = !!o && typeof o.length === "number",
            l = n && "length" in o && o.length;

        return Mk.type(o, "array|nodelist")
            || l === 0 || n && l > 0 && (l - 1) in o;
    },

    "instance": function (o) {

        var p = Object.getPrototypeOf(o),
            c = p && p.hasOwnProperty("constructor") && p.constructor,
            f = ({}).hasOwnProperty.toString;

        return (typeof c === "function" && f.call(c) === f.call(Object)) !== true;
    },

    "descriptor": function (o) {

        var index = Mk.fn.typemap.index,
            keys  = Object.keys(o) || [];

        if (index(keys, "enumerable") && index(keys, "configurable")) {

            if (index(keys, "value")) {
                return index(keys, "writable");
            }

            if (index(keys, "get")) {
                return index(keys, "set");
            }
        }
        return false;
    },

    "classlike": function (o) {
        return typeof o === "function"
            && Object.keys(o.prototype).length > 0;
    },

    "object": function (o) {
        return !!o && typeof o === "object" && !(o instanceof Array);
    },

    "defaultt": function (o, t) {
        return typeof o === t;
    }
};


Mk.fn.each = function (context, obj, callback) {

    var i = 0, count, result;

    if (Mk.type(obj, 'arraylike')) {

        count = obj.length;

        for (; i < count; i++) {

            result = callback.call(context, obj[i], i, obj);

            if (result === false) {
                break;
            }

            if (result === -1) {
                [].splice.call(obj, i, 1);
                i--; count--;
            }
        }
    }

    else {

        for (i in obj) {

            result = callback.call(context, obj[i], i, obj);

            if (result === false) {
                break;
            }

            if (result === -1) {
                delete o[i];
            }
        }
    }

    return context;
};

Mk.fn.find = function (context, obj, callback) {

    var result;

    Mk.fn.each(context, obj, function (o, i, orig) {

        result = callback.call(this, o, i, orig);

        if (result !== void+1) {
            return false;
        }
    });

    return result;
};

Mk.fn.map = function (context, obj, callback) {

    var map, result, i;

    if (Mk.type(obj, 'arraylike')) {

        map = [];

        Array.prototype.map.call(obj, function (o, x, orig) {

            result = callback.call(context, o, x, orig);

            if (result !== void+1) {
                map.push(result);
            }
        });
    }
    else {

        map = {};

        for (i in o) {

            result = callback.call(context, obj[i], i, obj);

            if (result !== void+1) {
                map[i] = result;
            }
        }
    }

    return map;
};

Mk.fn.filter = function (context, obj, callback) {

    if (Mk.type(obj, 'arraylike')) {
        return Array.prototype.filter.call(obj, function (o, i, orig) {
            return callback.call(context, o, i, orig);
        });
    }

    var result = {}, i;

    for (i in obj) {
        if (callback.call(context, obj[i], i, obj) !== false) {
            result[i] = obj[i];
        }
    }
    return result;
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

function $(s, c) {
    return this.find(s, c);
}

$._cache = {};

$._wraps = {
    option: [1, '<select multiple="multiple">', '</select>'],
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    li: [1, '<ul>', '</ul>'],
    dd: [1, '<dl>', '</dl>'],
    defaultt: [ 0, "", ""]
};

$._wraps.optgroup  = $._wraps.option;
$._wraps.caption   = $._wraps.thead;
$._wraps.tbody     = $._wraps.thead;
$._wraps.tfoot     = $._wraps.thead;
$._wraps.dt        = $._wraps.dd;


$.data = function (node, key, value) {

    // get/create a unique id for our node
    // for memory leaks, we only assign a string to the node,
    // the object is kept entirely seperate
    var id = node._id_ || Mk.fn.uid(),
        // default out the value.
        val = value,
        // pull the cache object or create a new empty primitive
        cache = $._cache[id] || {};

    // if the key is explicitly null, we want to remove the entire cache entry.
    // remove the node id, and delete the cache. Finally, return it to
    // the user for future use.

    if (key === null) {
        node._id_ = null;
        delete $._cache[id];

        return cache;
    }

    // if the value is explicitly null we want to remove that entry.
    // assign the entry to val then delete it from the larger cache entry.

    if (val === null) {
        val = cache[key];
        delete cache[key];

        return val;
    }

    // if value is undefined, we want to pull from cache
    // or if node is a legit DOM node, pull from a data attribute.
    // we are not going to cache data attributes here because they may change.

    if (val === void+1) {

        val = cache[key];

        if (val === void+1 && /1|9|11/.test(node.nodeType)) {
            val = node.getAttribute('data-' + key) || null;
        }
    }

    // finally, we're just going to set the cache entry to
    // our value. Nothing crazy to see here.

    else {
        cache[key] = val;
    }

    // reassign the id incase this is the first entry
    node._id_ = id;
    // reassign the cache in case this is the first entry
    $._cache[id] = cache;

    return val;
}


$.remove = function (node) {

    // we are only dealing with node types of 1
    // 9 and 11 get ignored, even though they are nodes.
    if (node && node.nodeType === 1) {
        // recursively look children and call remove
        // we do this because of the following steps
        Mk.fn.each(this, node.childNodes, function (child) {
            $.remove(child);
        });

        // pull the data entry and remove it from cache
        // frees up memory
        var data = $.data(node, null);

        // loop events associated with the node and remove all listeners
        // frees up memory
        if (data && data.events) {
            Mk.fn.each(this, data.events, function (obj, type) {
                $.off(node, type);
            });
        }
        // finally, remove the element
        node.parentNode.removeChild(node);
    }
}


$.ajax = function (o) {
    return new this.xhr(o);
}

$.xhr = function (o) {
    this.init(o);
}

$.xhr.prototype = {

    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    },

    xhr: null,

    open: false,

    options: null,

    url: function (u) {

        u = (u || location.href);

        var t = u.lastIndexOf('/');

        if (t > -1 && (t = u.indexOf('#')) > -1) {
            u = u.substr(0, t)
        }
        return u;
    },

    qs: function (o) {

        o = o || '';

        if (!Mk.type(o, 'string')) {
            return Mk.fn.map(this, o, function(v, n) {
                return n + '=' + encodeURIComponent(v);
            }).join('&');
        }
        return o;
    },

    init: function (o) {

        o = o || {};

        o.url = this.url(o.url);
        o.data = this.qs(o.data);
        o.method = (o.method || 'GET').toUpperCase();
        o.type = o.type || 'text';
        o.headers = o.headers || {};
        o.async = o.async || true;
        o.encode = o.encode || true;
        o.encoding = o.encoding || 'utf-8';
        o.user = o.user || '';
        o.password = o.password || '';

        // callbacks
        o.complete = o.complete || noop;
        o.success = o.success || noop;
        o.error = o.error || noop;

        if (o.data && o.method === 'GET') {
            o.url  = o.url.indexOf('?') > -1 && o.url || o.url + '?';
            o.url += o.data;
            o.data = null;
        }

        Mk.fn.each(this, this.headers, function (v, n) {
            if (prop.call(o.headers, n) !== true) {
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

            id = o.jsonpid = 'MKUI' + Mk.fn.uid().split('-').join(''),
            qs = 'callback=' + id;

        s.type = 'text/javascript';
        s.language = 'javascript';
        s.async = o.async;
        s.src = o.url + (o.url.indexOf('?') > -1 && '&' || '?') + qs;
        s.id = o.scriptid = Mk.fn.uid();

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

        if (o.type == 'jsonp') {
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

        Mk.fn.each(this, o.headers, function (v, n) {
            xhr.setRequestHeader(n, v);
        });

        if (o.type && o.type != 'text') {
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


$.events = {

    delegate: function (parent, node, selector) {

        var result = {
            // are we allowed to invoke the handler with
            // these perticular parameters??
            allowed: false,
            // default target will be the parent node, which
            // is really just the element with the bound event
            target: parent
        };

        // if we have no delegate selector,
        // allow the event to be invoked with the original node
        // being the target element.
        if (!selector) {
            result.allowed = true;
        }
        else {
            // we're dealing with a delegate
            // find the selector elements in the target parent,
            // loop them, and look for exact matches.
            // if found, set the new target and allow the event to invoke
            new $(selector, parent).each(function (el) {

                if (node === el || new $(node).parent(el).length) {
                    result.allowed = true;
                    result.target = el;
                    return false;
                }
            });
        }
        return result;
    },

    on: function (node, type, delegate, handler, single) {

        var parts = type.split('.');

        this.add({
            node: node,
            type: parts.shift(),
            namespace: parts.join('.'),
            handler: handler,
            single: single || false,
            delegate: delegate
        });
    },

    off: function (node, type, handler) {

        var parts = type.split('.');

        this.remove({
            node: node,
            type: parts.shift(),
            namespace: parts.join('.'),
            handler: handler
        });
    },

    emit: function (node, type, data) {

        var parts = type.split('.'),
            event = new Event(parts.shift());

        event.namespace = parts.join('.');
        event.data = data || [];

        node.dispatchEvent(event);
    },

    find: function (node, type, id) {

        var events = $.data(node, 'events') || {},
            handlers = events[type] || [];

        return Mk.fn.find(this, handlers, function (handler) {
            if (handler.id === id) return handler;
        });
    },

    add: function (obj) {

        var
        id = Mk.fn.uid(),
        node = obj.node,
        type = obj.type,
        events = $.data(node, 'events') || {},

        handler = function (e) {

            var event = $.events.find(this, e.type, id),
                trigger = $.events.delegate(this, e.target, event.delegate),
                invoked = false,
                result;

            if (e.namespace) {
                if (e.namespace === event.namespace && trigger.allowed) {
                    result = event.original.apply(trigger.target, [e].concat(e.data));
                    invoked = true;
                }
            }
            else if (trigger.allowed) {
                result = event.original.apply(trigger.target, [e].concat(e.data));
                invoked = true;
            }

            if (invoked && event.single) {

                $.events.remove({
                    node: this,
                    add: false,
                    type: event.type,
                    handler: event.original,
                    namespace: event.namespace
                });
            }

            return result;
        };

        events[type] = events[type] || [];
        events[type].push({
            type: type,
            namespace: obj.namespace,
            original: obj.handler,
            delegate: obj.delegate,
            handler: handler,
            single: obj.single,
            id: id
        });

        $.data(node, 'events', events);

        node.addEventListener(type, handler, false);
    },

    remove: function (obj) {

        var node = obj.node,
            type = obj.type,
            func = obj.handler,
            ns = obj.namespace,

            events = $.data(node, 'events') || {},
            handlers = events[type] || [];

        Mk.fn.each(this, handlers, function (handler) {

            if (!ns || handler.namespace === ns) {
                if (!func || func === handler.original) {
                    node.removeEventListener(type, handler.handler);
                    return -1;
                }
            }
        });
    }
};


$.prototype = {

    length: 0,

    context: null,

    constructor: $,

    each: function (fn) {
        return Mk.fn.each(this, this, fn);
    },

    find: function (s, c) {

        var d = document, n

        s = s || d;
        c = c || this.length && this || [d];

        if (Mk.type(c, 'string')) {
            c = new $(c, d);
        }
        else if (c.nodeType) {
            c = [c];
        }

        n = s;

        if (Mk.type(s, 'string')) {

            if (/^\s*<([^>\s]+)/.test(s)) {
                n = this.markup(s);
            }
            else {

                n = [];

                Mk.fn.each(this, c, function (el) {
                    console.info(arguments)
                    n = n.concat([].slice.call(el.querySelectorAll(s)));
                });
            }
        }

        if (n && /1|9|11/.test(n.nodeType)) {
            n = [n];
        }

        if (Mk.type(n, 'arraylike')) {
            n = [].slice.call(n);
        }

        [].splice.call(this, 0, this.length || 0);
        [].push.apply(this, n);

        this.context = c;

        return this;
    },

    is: function (s) {

        var elems = new $(s, this.context),
            result = false;

        this.each(function (el) {
            elems.each(function (_el) {
                if (el === _el) {
                    result = true; return false;
                }
            });
            if (result) return false;
        });
        return result;
    },

    filter: function (s) {

        var elems = new $(s, this.context),
            filtered = [];

        this.each(function (el) {
            elems.each(function (_el) {
                if (el === _el) filtered.push(el);
            });
        });
        return new $(filtered, this.context);
    },

    parent: function (s, c) {

        var p = [], ps;

        if (arguments.length) {

            ps = new $(s, c);

            this.each(function (el) {

                while (el.parentNode) {
                    ps.each(function (_el) {

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
            this.each(function (el) {
                if (el.parentNode) p.push(el.parentNode);
            });
        }
        return new $(p);
    },

    markup: function (s) {

        // if we support html5 templates (everybody but IE)
        var d = document,
            c = d.createElement('template');

        if (c.content) {
            c.innerHTML = s;
            return slice.call(c.content.childNodes);
        }

        // IE does this...
        var t = /^\s*<([^>\s]+)/.exec(s)[1] || null,
            a = t && $.wrap.hasOwnProperty(t) && $.wrap[t] || $.wrap.defaultt,
            i = 0;

        c = d.createElement('div');
        c.innerHTML = a[1] + s + a[2];

        while (i < a[0]) {
            c = c.firstChild;
            i++;
        }

        return [].slice.call(c.childNodes);
    },

    html: function (s) {

        if (s === void+1) {
            if (this.length) {
                return this[0].innerHTML;
            }
            return null;
        }

        return this.each(function (el) {
            while (el.firstChild) {
                $.remove(el.firstChild);
            }
            Mk.fn.each(this, this.markup(s), function (f) {
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

        return this.each(function (el) {
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
            return this.each(function (el) {
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
            return this.each(function (el) {
                el[_n] = _v;
            });
        });
    },

    val: function (v) {

        if (v === void+1 && this.length) {
            return this[0].value;
        }

        return this.each(function(el) {
            el.value = v;
        });
    },

    data: function (n, v) {
        return this.nv(n, v, function (_n, _v) {
            if (_v === void+1) {
                return $.data(this[0], _n);
            }
            return this.each(function (el) {
                $.data(el, _n, _v);
            });
        });
    },

    css: function (n, v) {
        return this.nv(n, v, function (_n, _v) {
            if (_v === void+1 && this.length) {
                return getComputedStyle(this[0]).getPropertyValue(_v);
            }
            return this.each(function (el) {
                el.style[_n] = Mk.type(_v, 'number') && (_v + 'px') || _v;
            });
        });
    },

    hasClass: function (v) {

        var r = false;
        this.each(function (el) {
            if (el.classList.contains(v)) {
                r = true;
                return false;
            }
        });
        return r;
    },

    addClass: function (value) {

        var values = value.split(' '), c;

        return Mk.fn.each(this, values, function (v) {
            this.each(function (el) {
                el.classList.add(v);
            });
        });
    },

    removeClass: function (value) {

        var values = value.split(' '), c, _v;

        return Mk.fn.each(this, values, function (v) {
            this.each(function (el) {
                el.classList.remove(v);
            });
        });
    },

    appendTo: function (s, c) {

        var elem = new $(s, c)[0] || null;

        if (elem) {
            this.each(function (el) {
                elem.appendChild(el);
            });
        }
        return this;
    },

    prependTo: function (s, c) {

        var elem = new $(s, c)[0] || null;

        if (elem) {
            this.each(function (el) {
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

            new $(s, c).each(function (el) {
                elem.appendChild(el);
            });
        }
        return this;
    },

    prepend: function (s, c) {

        if (this.length) {

            var elem = this[this.length - 1];

            new $(s, c).each(function (el) {
                if (elem.firstChild) {
                    elem.insertBefore(el, elem.firstChild);
                    return;
                }
                elem.appendChild(el);
            });
        }
        return this;
    },

    remove: function (selector) {

        var o = this, e;

        if (selector) {
            o = new $(selector, this);
        }

        o.each(function (el) {
            $.remove(el);
        });
        return this;
    },

    on: function (type, delegate, handler, single) {

        if (!handler) {
            handler = delegate;
            delegate = null;
        }
        return this.each(function (el) {
            $.events.on(el, type, delegate, handler, single);
        });
    },

    one: function (type, delegate, handler) {
        return this.on(type, delegate, handler, true);
    },

    off: function (type, handler) {
        return this.each(function (el) {
            $.events.off(el, type, handler);
        });
    },

    emit: function (type, data) {
        return this.each(function (el) {
            $.events.emit(el, type, data);
        });
    }
};


Mk.Dom = function (selector, context) {
    return new $(selector, context);
};


Mk.extend = function (to, from, name) {

    var prop;

    if (Mk.type(name, 'undefined')) {

        for (prop in from) {
            Mk.extend(to, from, prop);
        }
    }
    else {

        prop = Object.getOwnPropertyDescriptor(from, name);

        // cannot access getters/setters with obj[prop] notation or an exception
        // will be thrown due to accessors on the prototype but not in actual context.
        // so for getters and setters we must do this.
        if (prop && (prop.get !== void+1 || prop.set !== void+1)) {
            Object.defineProperty(to, name, prop);
        }
        else {
            // everybody else goes here.
            // In this case, the descriptor has a 'value' property.
            // The value can be writable, and configurable or not, if it is not,
            // we want to leave the value alone. If it is, we want to pull out the raw value and reset it.
            Mk.property(to, name, prop.writable ? prop.value : prop);
        }
    }
    return this;
};

Mk.property = function (obj, name, value) {

    var prop = value,
        func;

    if (Mk.type(value, 'function')) {

        func = Mk.fn.wrapFunction(value, name);

        prop = {
            enumerable: true,
            configurable: true,
            get: function () {
                return func;
            },
            set: function (newvalue) {

                if (Mk.type(newvalue, 'function')) {
                    func = Mk.fn.wrapFunction(newvalue, name);
                    return;
                }
                func = newvalue;
            }
        };
    }

    if (!Mk.type(prop, 'descriptor')) {
        prop = {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true,
        };
    }

    Object.defineProperty(obj, name, prop);

    return this;
};

Mk.fn.wrapFunction = function (func, name) {

    if (func._id_) {
        return func;
    }

    var wrap = function () {

        this._pushSuper(name);
        var result = func.apply(this, arguments);
        this._popSuper(name);
        return result;
    };

    wrap._id_ = Mk.fn.uid();

    wrap.toString = function () {
        return func.toString();
    };

    return wrap;
};

Mk.fn.pushSuper = function (name) {
    this._chain_ = this._chain_ || [];
    this._chain_.push(name);
};

Mk.fn.popSuper = function (name) {
    this._chain_.splice(
        this._chain_.lastIndexOf(name), 1);
};


Mk.fn.template = {

    xWhitespace: /[\r|\t|\n]+/g,

    xStatements: /{{([^}]+)}}(.*)({{\/\1}})/g,

    xInjections: /{{([^{]+)}}/g,

    markup: {
        highlight: '<span class="highlight">$1</span>',
        error: '<span class="error">{{template}} not found</span>'
    },

    parse: function (name, key, templates, data) {

        name = name || '';

        data = data || {};
        data.$key = key;

        templates = templates || {};

        var me = this;

        return me.get(name, templates)

        .replace(me.xWhitespace, '')

        .replace(me.xStatements, function (str, code, content) {
            return me.statements(str, key, code, content, templates, data);
        })

        .replace(me.xInjections, function (str, code) {
            return me.inject(str, key, code, templates, data);
        });
    },

    get: function (name, template) {

        var tmp = name;

        if (template && prop.call(template, name)) {
            tmp = template[name];
        }

        if (tmp instanceof Array) {
            tmp = tmp.join('');
        }

        return tmp;
    },

    statements: function (str, key, code, content, templates, data) {

        var parts = code.split(':'),
            map = parts[0],
            point = parts[1];

        if (prop.call(this.map, map)) {
            return this.map[ map ](
                content,
                key,
                templates,
                map == 'if' ? data : (data[ point ] || data),
                point);
        }

        return '';
    },

    inject: function (str, key, code, templates, data) {

        var parts = code.split( ':' ),
            map = parts[ 0 ],
            point = parts[ 1 ];

        if (point && prop.call(this.map, map)) {
            return this.map[map](
                point,
                key,
                templates,
                data,
                point);
        }

        if (prop.call(data, map)
            && !Mk.type(data[map], 'undefined|null')) {
            return data[map];
        }

        return '';
    },

    map: {

        'loop': function (name, key, templates, data, point) {

            var tmp = Mk.fn.template,
                buffer = [], i = 0,
                l, dp, x;

            if (Mk.type(data, 'arraylike')) {

                l = data.length;

                for(; i < l; i++) {

                    dp = data[i];

                    if (!Mk.type(dp, 'object')) {
                        dp = {key: '', value: dp};
                    }

                    dp.$index = i;

                    buffer.push(
                        tmp.parse(name, key, templates, dp));
                }
            }

            else {

                x = 0;

                for (l in data) {

                    buffer.push(
                        tmp.parse(
                        name,
                        key,
                        templates, {
                            key: l,
                            value: data[i],
                            $index: x++
                        }
                    ));
                }
            }

            return buffer.join('');
        },

        'if': function (name, key, templates, data, point) {

            if (prop.call(data, point)) {

                var dp = data[point];

                if ((!Mk.type(dp, 'empty'))
                    || (dp instanceof Array && dp.length > 0)) {
                    return Mk.fn.template.parse(name, key, templates, data);
                }
            }
            return '';
        },

        'highlight': function (name, key, templates, data, point) {

            var tmp = Mk.fn.template,
                str = data[point],
                hlt = data.highlight || '',
                htm;

            if (hlt) {
                htm = tp.get('highlight', tp.markup);
                str = str.replace(new RegExp('(' + hlt + ')', 'gi'), htm);
            }
            return str;
        },

        'scope': function (name, key, templates, data) {
            return Mk.fn.template.parse(name, key, templates, data);
        },

        'template': function (name, key, templates, data) {
            return Mk.fn.template.parse(name, key, templates, data);
        }
    }
};

Mk.fn.eventEmitter = {

    add: function (obj) {

        var bucket = obj.bucket,
            event = this.event(obj.type);

        obj.namespace = event.ns;
        obj.type = event.type;

        if (!prop.call(bucket, event.type)) {
             bucket[event.type] = [];
        }

        bucket[event.type].push(obj);
    },

    event: function (type) {

        return {
            type: /^(\w+)\.?/.exec(type)[1] || '',
            namespace: (/^\w+(\.?.*)$/.exec(type) || [])[1] || undefined
        };
    },

    args: function (args) {

        return Mk.fn.map(this, args, function (o) {
            return o;
        });
    },

    on: function on(obj) {
        return this.add(obj);
    },

    one: function(obj) {
        obj.single = true;
        return this.add(obj);
    },

    off: function off (obj, b, ev, h) {

        var bucket = obj.bucket,
            handler = obj.handler,
            event = this.event(obj.type);

        if (prop.call(bucket, event.type)) {

            var handlers = bucket[event.type],
                noHandler = Mk.type(handler, 'undefined'),
                namespace = event.namespace,
                count = handlers.length,
                i = 0, item;

            for (; i < count; i++) {

                item = handlers[i];

                if (item.namespace === namespace && (noHandler || handler === item.handler)) {
                    handlers.splice(i, 1);
                    count--; i--;
                }
            }
        }
    },

    emit: function emit (bucket, argz /* arguments */) {

        var args = this.args(argz),
            type = args.shift(),
            event = this.event(type);

        if (prop.call(bucket, event.type)) {

            var namespace = event.namespace,
                handlers = bucket[event.type],
                count = handlers.length,
                i = 0, item;

            for (; i < count; i++) {

                item = handlers[i];

                if (!namespace || item.namespace === namespace) {

                    item.handler.apply(item.context || root, args);

                    if (item.single) {
                        handlers.splice(i, 1);
                        count--; i--;
                    }
                }
            }
        }
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


Mk.fn.keycodes = {
    backspace: 8, tab: 9, enter: 13, esc: 27, space: 32,
    pageup: 33, pagedown: 34, end: 35, home: 36,
    left: 37, up: 38, right: 39, down: 40, left: 37, right: 39,
    comma: 188
};


Mk.define = function (namespace, obj) {

    var base = Mk,
        parts = namespace.split( '.' ),
        count = parts.length - 1,
        i = 0;

    for (; i < count; i++) {
        if (!prop.call(base, parts[i])) {
            base[parts[i]] = {};
        }
        base = base[parts[i]];
    }
    return base[parts[count]] = obj;
};

Mk.get = function (namespace) {

    var parts = namespace.split('.'),
        count = parts.length,
        base = Mk,
        obj = null,
        i = 0;

    for (; i < count; i++) {
        if (prop.call(base, parts[i])) {
            obj = base[parts[i]];
            base = obj;
        }
        else {
            obj = null;
        }
    }
    return obj;
};

Mk.create = function (name, base, proto) {

    name = name || '';

    proto = proto || base || {};

    base = typeof base === 'function'
        && base.prototype instanceof Mk
        && base || Mk;

    var obj = function () {
        this._init.apply(this, arguments);
        return this;
    };

    obj.prototype = Object.create(base.prototype);

    Mk.extend(obj.prototype, proto);

    //TODO: add static members

    obj.prototype.constructor = obj;

    obj.prototype._super_ = base;
    obj.prototype._chain_ = null;

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
    /*
    <property:deviceExp>
        <desc>Expression used to check the user agent for device patterns.</desc>
    </property:deviceExp>
    */
    deviceExp: /(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i,

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
        return this.deviceExp.test(navigator.userAgent);
    },
    /*
    <property:devicekey>
        <desc>Key pulled from user agent for general device name checking (iphone, android, ipad, etc).</desc>
    </property:devicekey>
    */
    get devicekey () {

        var ua = navigator.userAgent,
            match = (this.deviceExp.exec(ua) || [])[1] || '';

        return match.toLowerCase();
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
        return Mk.fn.uid();
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
        return Mk.fn.template.parse(n, this.name, this.config.templates, d);
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
        return Mk.fn.template.parse(n, this.name, this.config.formats, d);
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

        if (t) {

            n.addClass('transition');
            n.one(t, function (e) {
                n.removeClass('transition');
                cb.call(c, e, n);
            });

            return this;
        }

        n.removeClass('transition');

        return this.each(n, function (el) {
            this.delay(function () {
                cb.call(this, null, this.$(el));
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
    clearTransitions: function (node) {

        var t = Mk.transitions.key;

        if (t) {
            this.$(node).off(t);
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
    transitioning: function (node) {
        return this.$(node).hasClass('transition');
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
    on: function (type, handler) {

        Mk.fn.eventEmitter.on({
            bucket: this.events,
            type: type,
            handler: handler,
            context: this
        });

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
    one: function (type, handler) {

        Mk.fn.eventEmitter.one({
            bucket: this.events,
            type: type,
            handler: handler,
            context: this
        });

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
    off: function (type, handler) {

        Mk.fn.eventEmitter.off({
            bucket: this.events,
            type: type,
            handler: handler
        });

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
    emit: function (type /*, arguments */) {

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
