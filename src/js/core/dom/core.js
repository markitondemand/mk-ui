
$.prototype = {

    length: 0,

    context: null,

    constructor: $,

    toFrag: function () {

        var f = document.createDocumentFragment();

        this.each(function (el) {
            f.appendChild(el);
        });

        return f;
    },

    nv: function (name, value, fn) {

        if (typeof name === 'object') {

            var k = Object.keys(name),
                l = k.length, i;

            return this.each(function (el) {

                i = 0;

                for (; i < l; i++) {
                    fn(el, k[i], name[k[i]]);
                }
            });
        }

        if (value === void+1) {
            return this.length ? fn(this[0], name, value) : undefined;
        }

        return this.each(function (el) {
            fn(el, name, value);
        });
    },

    first: function () {

        var reg = /1|9|11/, i = 0, l, n;

        if (this.length) {

            l = this.length;

            while (i < l) {

                n = this[i];
                i++;

                if (reg.test(n.nodeType)) {
                    return n;
                }
            }
        }

        return undefined;
    },

    last: function () {

        var reg = /1|9|11/, n, l;

        if (this.length) {

            l = this.length;

            while (l--) {

                n = this[l]

                if (reg.test(n.nodeType)) {
                    return n;
                }
            }
        }

        return undefined;
    },

    each: function (fn) {

        var i = 0,
            l = this.length,
            r;

        while (i < l) {

            r = fn.call(this, this[i], i++);

            if (r === false) break;
        }

        return this;
    },

    index: function (i) {

        if (typeof i !== 'number' && this.length) {

            var el = this[0],
                children = el.parentNode && el.parentNode.childNodes || [];

            for (var i = 0, l = children.length; i < l; i++) {
                if (children[i] === el) return i;
            }
            return 0;
        }

        return this.length > i && this[i] || undefined;
    },

    find: function (s, c) {

        var d = document, n

        c = c || this.length && this
            || this.length !== void+1 && this.context
            || [d];

        if (c === this) {
            return new $(s, c);
        }

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

        if (n) {
            [].push.apply(this, n);
        }

        this.context = c;

        return this;
    },

    is: function (selector) {

        var elems = new $(selector, this.context),
            result = false;

        this.each(function (el) {

            elems.each(function (_el) {

                if (el === _el) {
                    result = true;
                    return false;
                }
            });

            if (result) {
                return false;
            }
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

    closest: function (selector, context) {
        return this.parent(selector, context);
    },

    markup: function (str) {

        var m = $.markup(str);
        return m.childNodes;
    },

    html: function (str) {

        if (str === void+1) {

            var elem = this.first();

            return elem && elem.innerHTML || '';
        }

        return this.each(function (el) {

            var children = el.childNodes,
                l = children.length;

            while (l--) {
                $.remove(children[l]);
            }

            el.appendChild($.markup(str));
        });
    },

    text: function (text) {

        if (text === void+1) {

            var elem = this.first();

            return elem && elem.textContent || '';
        }

        return this.each(function (el) {
            el.textContent = text;
        });
    },

    removeAttr: function (name) {

        return this.each(function (el) {
            el.removeAttribute(name);
        });
    },

    attr: function (name, value) {

        return this.nv(name, value, function (el, n, v) {

            if (v === void+1) {
                return el.getAttribute(n);
            }
            el.setAttribute(n, v);
        });
    },

    prop: function (name, value) {

        return this.nv(name, value, function (el, n, v) {

            if (v === void+1) {
                return el[n] || undefined;
            }
            el[n] = v;
        });
    },

    val: function (value) {

        if (value === void+1 && this.length) {
            return this[0].value;
        }

        return this.each(function (el) {
            el.value = value;
        });
    },

    data: function (name, value) {

        return this.nv(name, value, function (el, n, v) {

            if (v === void+1 || v === null) {
                return $.data(el, n, v);
            }
            $.data(el, n, v);
        });
    },

    css: function (name, value) {

        return this.nv(name, value, function (el, n, v) {
            if (v === void+1) {
                return getComputedStyle(el).getPropertyValue(v);
            }
            el.style[n] = typeof v === 'number' && v + 'px' || v;
        });
    },

    hasClass: function (cls) {

        var r = false;
        var that = this;
        this.each(function (el) {
            r = el.classList && el.classList.contains(cls)
                || el.className &&  el.className.trim().split(/\s+/g).indexOf(cls) > -1;

            if (r) return false;
        });

        return r;
    },

    addClass: function (value) {

        var values = value.split(' '), c;
        return Mk.fn.each(this, values, function (v) {
            this.each(function (el) {
                if (el.classList) {
                    el.classList.add(v);
                    return;
                }

                if (!Mk.$(el).hasClass(v)) {
                    el.className = (el.className || '').trim() + ' ' + v.trim();
                }
            });
        });
    },

    removeClass: function (value) {

        var values = value.split(' '), c, _v;
        return Mk.fn.each(this, values, function (v) {
            this.each(function (el) {
                if (el.classList) {
                    el.classList.remove(v);
                    return;
                }

                wrdBndryRegexp = new RegExp('\\b' + v.trim() + '\\b');
                wrdBndryRegexp2 = new RegExp('\\b ' + v + '\\b');

                el.className = el.className.replace(wrdBndryRegexp2, '')
                    .replace(wrdBndryRegexp, '').trim();
            });
        });
    },

    appendTo: function (selector, context) {

        var elem = new $(selector, context).last();

        if (elem) {
            elem.appendChild(this.toFrag());
        }
        return this;
    },

    prependTo: function (selector, context) {

        var elem = new $(selector, context).last(),
            frag = this.toFrag();

        if (elem) {
            elem.firstChild
                ? elem.insertBefore(frag, elem.firstChild)
                : elem.appendChild(frag);
        }
        return this;
    },

    append: function (selector, context) {

        var elem = this.last();

        if (elem) {
            elem.appendChild(
                new $(selector, context).toFrag());

        }
        return this;
    },

    prepend: function (selector, context) {

        var elem = this.last(), frag;

        if (elem) {

            frag = new $(selector, context).toFrag();

            elem.firstChild
                ? elem.insertBefore(frag, elem.firstChild)
                : elem.appendChild (frag);
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

    focus: function () {

        var elem = this.last();

        if (elem) {
            elem.focus();
        }
        return this;
    },

    blur: function () {

        var elem = this.last();

        if (elem) {
            elem.blur();
        }
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
