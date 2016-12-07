Mk.fn.eventEmitter = {

    add: function (obj) {

        var bucket = obj.bucket,
            event = this.event(obj.type);

        obj.namespace = event.namespace;
        obj.type = event.type;

        if (!prop.call(bucket, event.type)) {
             bucket[event.type] = [];
        }

        bucket[event.type].push({
            namespace: event.namespace,
            type: event.type,
            handler: obj.handler,
            context: obj.context,
        });
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
