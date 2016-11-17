
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
            o.method = (o.method || 'GET').toUpperCase();
            o.type = o.type || 'html';
            o.headers = o.headers || {};
            o.async = o.async || true;
            o.encode = o.encode || true;
            o.encoding = o.encoding || 'utf-8';
            o.user = o.user || '';
            o.password = o.password || '';

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

            var x = this,
                o = this.options,
                s = doc.createElement('script'),
                id = o.jsonpid = 'JSONP' + uid().replace(/\-/g, '');

            s.type = 'text/javascript';
            s.language = 'javascript';
            s.async = o.async;
            s.src = o.url + '&callback=' + id;
            s.id = o.scriptid = uid();

            var cb = function (data) {

                x.response = data;
                x.status = 200;
                o.success.call(x, data, x.status, x);
                s.parentNode.removeChild(s);
                delete root[id];
            };

            root[id] = cb;

            doc.documentElement.firstChild.appendChild(s);

            this.open = true;
            this.status = 0;

            return this;
        },

        send: function () {

            if (this.open) {
                return this;
            }

            if (this.options.type === 'jsonp') {
                return this.jsonp();
            }

            var xhr = this.xhr = new XMLHttpRequest(),
                o = this.options,
                x = this;

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

            x.open = true;
            x.status = 0;

            xhr.send(o.data);

            if (o.async !== true) {
                this.stateChange();
            }
            return this;
        },

        abort: function () {

            if (this.xhr) {
                this.xhr.abort();
                return;
            }

            var x = this,
                o = x.options,
                s = doc.getElementById(o.scriptid),
                id = o.jsonpid;

            if (s) { s.parentNode.removeChild(s); }

            root[id] = function () {
                delete root[id];
            };
            root[id]();
        },

        stateChange: function () {

            var xhr = this.xhr,
                x = this,
                o = x.options;

            if (xhr.readyState !== 4) {
                return;
            }

            x.status = xhr.status;

            if (x.status === 1223) {
                x.status = 204;
            }

            x.open = false;
            x.response = xhr.responseText || '';

            if (o.type === 'json') {

                try {
                    x.response = JSON.parse(x.response);
                }
                catch(e) {
                    x.response = {message: 'error parsing response'};
                }
            }

            xhr.onreadystatechange = function () {};

            var args = x.status >= 200 && x.status < 300
                ? [x.response || '', x.status, xhr]
                : [x.status];

            x.options.success.apply(x, args);
        }
    };

    //
    // dom events
    // -----------------------------------

    function event (n, a, t, s, f, x) {

        var h, d;

        if (a) {

            h = function (e) {

                var r = null;

                if (e.ns) {
                    if (e.ns === s) {
                        r = f.apply(this, [e].concat(e.data));
                    }
                }
                else {
                    r = f.call(this, e);
                }

                if (r !== null && x) {
                    event(n, false, t, s, f, x);
                }
                return r;
            };

            d = data(n, 'events') || {};
            d[t] = d[t] || [];
            d[t].push({
                type: t,
                ns: s,
                original: f,
                handler: h
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

    function on (n, t, d, h, x) {

        var p = t.split('.'),
        e = p.shift();

        event(n, true, e, p.join('.'), h, x);
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
                                p.push(_el); return false;
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

            var o = this;

            if (arguments.length) {
                o = new dom(s, this);
            }

            o.each(function (i, el) {
                el.parentNode.removeChild(el);
            });

            return this;
        },

        on: function (t, h) {
            return this.each(function (i, el) {
                on(el, t, '', h, false);
            });
        },

        one: function (t, h) {
            return this.each(function (i, el) {
                on(el, t, '', h, true);
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
        },

        ajax: function (o) {
            return new xhr(o)
        }
    };
    return dom;
})();

window.dom = function (s, c) {
    return new dom(s, c);
};
