
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
