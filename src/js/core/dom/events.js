
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
