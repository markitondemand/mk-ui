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
                $.events.off(node, type);
            });
        }
        // finally, remove the element
        node.parentNode.removeChild(node);
    }
}


$.events = {
    //
    // delegation events for certain event types
    // require the capture boolean to be set to true.
    //
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
            delegate: delegate
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

        handler = function (e) {

            var event = $.events.find(this, e.type, id),
                trigger = $.events.delegate(this, e, event.delegate),
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

        node.addEventListener(type, handler, this.capture(type, obj.delegate));
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
                    node.removeEventListener(type, handler.handler);
                    return -1;
                }
            }
        });
    }
};


function insertable (to) {

    if (to && to.nodeType === 1) {
        return true;
    }
    return false;
}

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

            var m = this.markup(s);

            Mk.fn.each(this, this.markup(s), function (node) {
                if (insertable(node)) {
                    el.appendChild(node);
                }
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

        var elem = new $(s, c)[0] || null,
            allowed = insertable(elem);

        if (elem && allowed) {
            this.each(function (el) {
                elem.appendChild(el);
            });
        }
        return this;
    },

    prependTo: function (s, c) {

        var elem = new $(s, c)[0] || null,
            allowed = insertable(elem);

        if (elem && allowed) {

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

            var elem = this[this.length - 1],
                allowed = insertable(elem);

            if (allowed) {

                new $(s, c).each(function (el) {
                    elem.appendChild(el);
                });
            }
        }
        return this;
    },

    prepend: function (s, c) {

        if (this.length) {

            var elem = this[this.length - 1],
                allowed = insertable(elem);

            if (allowed) {

                new $(s, c).each(function (el) {

                    if (elem.firstChild) {
                        elem.insertBefore(el, elem.firstChild);
                        return;
                    }
                    elem.appendChild(el);
                });
            }
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


Mk.$ = function (selector, context) {
    return new $(selector, context);
};
