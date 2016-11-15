
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
        hasClass()
        addClass()
        removeClass()
        attr()
        data()
        html()
        text()
        markup()
        appendTo()
        prependTo()

        TODO:

        remove()
        append()
        prepend()
        parent()

        on()
        one()
        off()

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
                v = c[k] || node.getAttribute('data-' + k) || null;
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

    function dom (s, c) {
        this.find(s, c);
    }

    dom.prototype = {

        length: 0,

        constructor: dom,

        each: function (fn) {
            return each(this, this, fn);
        },

        find: function (s, c) {

            s = s || doc;
            c = c || this.length && this || doc;

            var n = s;

            if (typeof s === 'string') {

                n = tg.test(s) && this.markup(s)
                    || c.querySelectorAll(s);
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
        }
    };
    return dom;
})();

window.dom = function (s, c) {
    return new dom(s, c);
};
