
// eventEmitter
// used for behavior hooks into components
// and JavaScript event UI
// --------------------------------------------------

Mk.eventEmitter = {

    xname: /^(\w+)\.?/,

    xns: /^\w+(\.?.*)$/,

    _add: function ( bucket, name, handler, context, single ) {

        var e = this.e(name);

        if (bucket.hasOwnProperty(e.name) !== true) {
             bucket[e.name] = [];
        }

        bucket[e.name].push({
            ns: e.ns || undefined,
            handler: handler || Mk.noop,
            context: context || null,
            single: single === true
        });
    },

    e: function (e) {

        return {
            name: this.xname.exec( e )[ 1 ] || '',
            ns: ( this.xns.exec( e ) || [] )[ 1 ] || undefined
        };
    },

    args: function (args) {

        for( var i = 0, a = [], l = args.length;
                i < l && a.push(args[ i ]);
                i++) { }

        return a;
    },

    on: function on(bucket, event, handler, context) {
        return this._add(bucket, event, handler, context, false);
    },

    one: function(bucket, event, handler, context) {
        return this._add(bucket, event, handler, context, true);
    },

    off: function off (bucket, event, handler) {

        var e = this.e(event),
            i = 0, stack, item, ns, l;

        if (hasOwn.call(bucket, e.name)) {

            stack = bucket[e.name];
            ns = e.ns || undf;
            l = stack.length;

            for (; i < l; i++) {

                item = stack[i];

                if (item.ns === ns && (Mk.type(handler, 'u') || handler === item.handler)) {
                    stack.splice(i, 1);
                    l = stack.length;
                    i--;
                }
            }
        }
    },

    emit: function emit (bucket, argz /*, arguments */) {

        var args = this.args(argz),
            event = args.shift(),
            e = this.e( event ),
            i = 0,
            stack, item, l;

        if (hasOwn.call(bucket, e.name)) {

            stack = bucket[e.name];
            l = stack.length;

            for (; i < l; i++) {

                item = stack[ i ];

                if (!e.ns || item.ns === e.ns) {

                    item.handler.apply(item.context || root, args);

                    if (item.single) {
                        stack.splice(i, 1);
                        l--; i--;
                    }
                }
            }
        }
    }
};
