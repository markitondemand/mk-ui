
$.prototype = {

    length: 0,

    context: null,

    constructor: $,

    each: function (fn) {
        return Mk.fn.each(this, this, fn);
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

    closest: function (selector, context) {
        return this.parent(selector, context);
    },

    markup: function (s) {

        // if we support html5 templates (everybody but IE)
        var d = document,
            c = d.createElement('template');

        if (c.content) {
            c.innerHTML = s;
            return [].slice.call(c.content.childNodes);
        }

        // IE does this...
        var t = (/^\s*<([^>\s]+)/.exec(s) || [])[1] || null,
            a = t && $._wraps.hasOwnProperty(t) && $._wraps[t] || $._wraps.defaultt,
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
                return this.length && this[0].getAttribute(_n) || null;
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
                return this.length && $.data(this[0], _n) || null;
            }
            return this.each(function (el) {
                $.data(el, _n, _v);
            });
        });
    },

    css: function (n, v) {
        return this.nv(n, v, function (_n, _v) {
            if (_v === void+1) {
                return this.length && getComputedStyle(this[0]).getPropertyValue(_v) || null;
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

    focus: function () {

        if (this.length) {
            this[this.length - 1].focus();
        }
        return this;
    },

    blur: function () {

        if (this.length) {
            this[this.length - 1].blur();
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
