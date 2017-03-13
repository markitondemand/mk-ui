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

function $(selector, context) {
    return this.find(selector, context);
}

$.cache = {};


$.data = function (node, key, value) {

    // get/create a unique id for our node
    // for memory leaks, we only assign a string to the node,
    // the object is kept entirely seperate
    var id = node._id_ || Mk.fn.uid(),
        // default out the value.
        val = value,
        // pull the cache object or create a new empty primitive
        cache = $.cache[id] || {};

    // if the key is explicitly null, we want to remove the entire cache entry.
    // remove the node id, and delete the cache. Finally, return it to
    // the user for future use.

    if (key === null) {
        node._id_ = null;
        delete $.cache[id];

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
            val = node.getAttribute('data-' + key) || undefined;
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
    $.cache[id] = cache;

    return val;
}


$.wrap = {
    option: [1, '<select multiple="multiple">', '</select>'],
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    li: [1, '<ul>', '</ul>'],
    dd: [1, '<dl>', '</dl>'],
    defaultt: [ 0, '', '']
};

$.wrap.optgroup  = $.wrap.option;
$.wrap.caption   = $.wrap.thead;
$.wrap.tbody     = $.wrap.thead;
$.wrap.tfoot     = $.wrap.thead;
$.wrap.dt        = $.wrap.dd;

$.markup = function (s) {

    var d = document;

    if (!s) {
        return d.createDocumentFragment();
    }

    // html5 templates
    // most browsers support this method and
    // is much faster than the latter.
    var c = d.createElement('template'),
        f, p;

    if (c.content) {
        c.innerHTML = s;
        return c.content;
    }

    // Sadly, buy as expected, Internet Explorer doesn't support
    // templates so we get to insert inner html and rip out the children.
    var t = (/^\s*<([^>\s]+)/.exec(s) || [])[1] || null,
        a = t && $.wrap.hasOwnProperty(t) && $.wrap[t] || $.wrap.defaultt,
        i = 0;

    c = d.createElement('div');
    c.innerHTML = a[1] + s + a[2];

    p = c.firstChild;
    f = d.createDocumentFragment();

    while (i < a[0]) {
        p = p.firstChild;
        i++;
    }

    if (p) {
        f.appendChild(p);
    }

    return f;
};


$.remove = function (node) {

    // we are only dealing with node types of 1 (element) and 11 (fragment)
    // 9 (document) gets ignored

    if (node && (node.nodeType === 1 || node.nodeType === 11)) {

        // recursively look children and call remove
        // we do this because of the following steps

        var children = node.childNodes,
            l = children.length;

        while (l--) {
            $.remove(children[l]);
        }

        // pull the data entry and remove it from cache
        // frees up memory

        var data = $.data(node, null);

        // loop events associated with the node and remove all listeners
        // frees up memory

        if (data && data.events) {
            Mk.fn.each(this, data.events, function (obj, type) {
                $.events.off(node, type);
            });
        }
    }

    // finally, remove the element
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}


$.events = {
    //
    // delegation events for certain event types
    // require the capture boolean to be set to true.
    capture: function (type, del) {

        if (del) {
            switch (type) {
                case "mouseenter":
                case "mouseleave":
                case "blur":
                case "focus":
                    return true;
            }
        }

        return false;
    },

    delegate: function (parent, e, selector) {

        var node = e.target,
            result = {
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
            // crazyness for event capturing
            // (ie: delegate focus/blur mouseenter/leave events)
            if (e.toElement) {

                var n = new $(e.toElement, parent),
                    f = new $(e.fromElement, parent);

                if ((n.is(selector) && f.parent(e.toElement).length)
                    || (f.is(selector) && n.parent(e.fromElement).length)) {
                    return result;
                }
            }
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

    // on
    // set an event handler onto an element.
    // supports delegates and namespaces.

    on: function (node, type, delegate, handler, single) {

        var parts = type.split('.');

        this.add({
            node: node,
            type: parts.shift(),
            namespace: parts.join('.'),
            handler: handler,
            single: single || false,
            delegate: typeof delegate === 'string' ? delegate : undefined,
            capture: typeof delegate === 'boolean' ? delegate : undefined
        });
    },

    // off
    // remove a handler or batch of handlers from an element.
    // supports namespaces.

    off: function (node, type, handler) {

        var parts = type.split('.');

        this.remove({
            node: node,
            type: parts.shift(),
            namespace: parts.join('.'),
            handler: handler
        });
    },

    // emit
    // trigger an event on an element.
    // supports namespaces

    emit: function (node, type, data) {

        var parts = type.split('.'),
            event = new Event(parts.shift());

        event.namespace = parts.join('.');
        event.data = data || [];

        node.dispatchEvent(event);
    },

    // find a perticular event stored in the cache
    // object for element events ($.data).

    find: function (node, type, id) {

        var events = $.data(node, 'events') || {},
            handlers = events[type] || [];

        return Mk.fn.first(this, handlers, function (handler) {
            if (handler.id === id) return handler;
        });
    },

    // add
    // internal event for binding listeners
    // creates a new handler which will accept delegates
    // namespaces and single (one) bindings.
    // currently the only pointer is 'id' which is a string (yay)

    add: function (obj) {

        var
        id = Mk.fn.uid(),
        node = obj.node,
        type = obj.type,
        events = $.data(node, 'events') || {},
        capture = obj.capture || this.capture(type, obj.delegate),

        handler = function (e) {

            var event = $.events.find(this, e.type, id),
                trigger = $.events.delegate(this, e, event.delegate),
                invoke = false,
                result;

            if (e.namespace) {
                if (e.namespace === event.namespace && trigger.allowed) {
                    invoke = true;
                }
            }
            else if (trigger.allowed) {
                invoke = true;
            }

            if (invoke) {

                if (event.single) {
                    $.events.remove({
                        node: this,
                        add: false,
                        type: event.type,
                        handler: event.original,
                        namespace: event.namespace
                    });
                }

                result = event.original.apply(trigger.target, [e].concat(e.data));
            }

            return result;
        };

        events[type] = events[type] || [];

        events[type].push({
            type: type,
            capture: capture,
            namespace: obj.namespace,
            original: obj.handler,
            delegate: obj.delegate,
            handler: handler,
            single: obj.single,
            id: id
        });

        $.data(node, 'events', events);

        node.addEventListener(type, handler, capture);
    },

    // remove
    // internal method for removing event listeners or an
    // entire batch of events based on type. Can also remove events
    // based on type + namespace.

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
                    node.removeEventListener(type, handler.handler, handler.capture);
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


Mk.$ = function (selector, context) {
    return new $(selector, context);
};

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}