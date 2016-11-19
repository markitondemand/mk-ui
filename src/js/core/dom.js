
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

var cache = {},
    //
    // tag/markup testing
    // ------------------------------------
    tg = /^\s*<([^>\s]+)/,
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

function Dom (s, c) {
    return this.find(s, c);
}


//
// data - store/retrieve data and data attributes
// ----------------------------------------

Dom.data = function (n, k, vl) {

    if (n) {

        var id = n._id = n._id || uid(),
            c  = cache[id] || {},
            v  = vl;

        // remove entire entry
        if (k === null) {

            n._id = null;
            delete cache[id];
            return c;
        }

        // undefined
        if (v === undf) {
            v = c[k] || n.getAttribute('data-' + k) || null;
            //c[k] = v;
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


//
// removes elements, events, and data from memory
//

Dom.remove = function (n) {

    var d;

    Mk.fn.each(this, n.childNodes, function (c) {
        if (c && c.nodeType === 1) {
            Mk.$.remove(c);
        }
    });

    var d = Mk.$.data(n, null);

    if (d && d.events) {
        Mk.fn.each(this, d.events, function (v, t) {
            Mk.$.off(n, t);
        });
    }
    n.parentNode.removeChild(n);
}


Dom.ajax = function (o) {
    return new this.xhr(o);
}

Dom.xhr = function (o) {
    this.init(o);
}

Dom.xhr.prototype = {

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

        if (!type(o, 'string')) {
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

        Mk.fn.each(this, o.headers, function (v, n) {
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


Dom.delegate = function (p, n, x) {

    var r = {s: false, t: p};

    if (!x) {
        r.s = true;
    }
    else {
        new Dom(x, p).each(function (el) {

            if (n === el || new Dom(n).parent(el).length) {
                r.s = true;
                r.t = el;
                return false;
            }
        });
    }
    return r;
}

Dom.event = function (n, a, t, s, f, o, x) {

    var h, d;

    if (a) {

        h = function (e) {

            var z = false,
                w = Dom.delegate(this, e.target, x),
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
                Dom.event(n, false, t, s, f, o, x);
            }
            return r;
        };

        d = Dom.data(n, 'events') || {};

        d[t] = d[t] || [];

        d[t].push({
            type: t,
            ns: s,
            original: f,
            handler: h,
            delegate: x
        });

        Dom.data(n, 'events', d);

        n.addEventListener(t, h, false);

        return;
    }

    d = (Dom.data(n, 'events') || {})[t] || [];

    Mk.fn.each(this, d, function (o) {
        if (!s || s && o.ns === s) {
            if (!f || f === o.original) {
                n.removeEventListener(t, o.handler);
                return -1;
            }
        }
    });
}

Dom.on = function (n, t, d, h, o, x) {

    var p = t.split('.'),
        e = p.shift();

    Dom.event(n, true, e, p.join('.'), h, o, x);
}

Dom.off = function (n, t, h) {

    var p = t.split('.'),
        e = p.shift();

    Dom.event(n, false, e, p.join('.'), h);
}

Dom.emit = function (n, t, d) {

    var p = t.split('.'),
        e = p.shift(),
        ev = new Event(e);

    ev.ns = p.join('.');
    ev.data = d || [];

    n.dispatchEvent(ev);
}


Dom.prototype = {

    length: 0,

    context: null,

    constructor: Dom,

    each: function (fn) {
        return Mk.fn.each(this, this, fn);
    },

    find: function (s, c) {

        s = s || doc;
        c = c || this.length && this || [doc];

        if (type(c, 'string')) {
            c = new Dom(c, doc);
        }
        else if (c.nodeType) {
            c = [c];
        }

        var n = s;

        if (type(s, 'string')) {

            if (tg.test(s)) {
                n = this.markup(s);
            }
            else {

                n = [];

                Mk.fn.each(this, c, function (el) {
                    n = n.concat(slice.call(el.querySelectorAll(s)));
                });
            }
        }

        if (n && nt.test(n.nodeType)) {
            n = [n];
        }

        if (type(n, 'arraylike')) {
            n = slice.call(n);
        }

        splice.call(this, 0, this.length || 0);
        push.apply(this, n);

        this.context = c;

        return this;
    },

    is: function (s) {

        var elems = new Dom(s, this.context),
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

        var elems = new Dom(s, this.context),
            filtered = [];

        this.each(function (el) {
            elems.each(function (_el) {
                if (el === _el) filtered.push(el);
            });
        });
        return new Dom(filtered, this.context);
    },

    parent: function (s, c) {

        var p = [], ps;

        if (arguments.length) {

            ps = new Dom(s, c);

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
        return new Dom(p);
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

        if (s === undf) {
            if (this.length) {
                return this[0].innerHTML;
            }
            return null;
        }

        return this.each(function (el) {
            while (el.firstChild) {
                Dom.remove(el.firstChild);
            }
            Mk.fn.each(this, this.markup(s), function (f) {
                el.appendChild(f);
            });
        });
    },

    text: function (s) {

        if (s === undf) {
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

            if (_v === undf) {
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
            if (_v === undf) {
                return this.length && this[0][_n] || null;
            }
            return this.each(function (el) {
                el[_n] = _v;
            });
        });
    },

    val: function (v) {

        if (v === undf && this.length) {
            return this[0].value;
        }

        return this.each(function(el) {
            el.value = v;
        });
    },

    data: function (n, v) {
        return this.nv(n, v, function (_n, _v) {
            if (_v === undf) {
                return Dom.data(this[0], _n);
            }
            return this.each(function (el) {
                Dom.data(el, _n, _v);
            });
        });
    },

    css: function (n, v) {
        return this.nv(n, v, function (_n, _v) {
            if (_v === undf && this.length) {
                return getComputedStyle(this[0]).getPropertyValue(_v);
            }
            return this.each(function (el) {
                el.style[_n] = type(_v, 'number') && (_v + 'px') || _v;
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

        var elem = new Dom(s, c)[0] || null;

        if (elem) {
            this.each(function (el) {
                elem.appendChild(el);
            });
        }
        return this;
    },

    prependTo: function (s, c) {

        var elem = new Dom(s, c)[0] || null;

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

            new Dom(s, c).each(function (el) {
                elem.appendChild(el);
            });
        }
        return this;
    },

    prepend: function (s, c) {

        if (this.length) {

            var elem = this[this.length - 1];

            new Dom(s, c).each(function (el) {
                if (elem.firstChild) {
                    elem.insertBefore(el, elem.firstChild);
                    return;
                }
                elem.appendChild(el);
            });
        }
        return this;
    },

    remove: function (s) {

        var o = this, e;

        if (arguments.length) {
            o = new Dom(s, this);
        }

        o.each(function (el) {
            Dom.remove(el);
        });
        return this;
    },

    on: function (t, d, h) {

        if (!h) {
            h = d;
            d = null;
        }

        return this.each(function (el) {
            Dom.on(el, t, '', h, false, d);
        });
    },

    one: function (t, d, h) {

        if (!h) {
            h = d;
            d = null;
        }

        return this.each(function (el) {
            Dom.on(el, t, '', h, true, d);
        });
    },

    off: function (t, h) {
        return this.each(function (el) {
            Dom.off(el, t, h);
        });
    },

    emit: function (t, d) {
        return this.each(function (el) {
            Dom.emit(el, t, d);
        });
    }
};


Mk.$ = function (s, c) {
    return new Dom(s, c);
};
