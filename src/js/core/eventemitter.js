
// eventEmitter
// used for behavior hooks into components
// and JavaScript event UI
// --------------------------------------------------

var eventEmitter = {

    xname: /^(\w+)\.?/,

    xns: /^\w+(\.?.*)$/,

    _add: function ( bucket, name, handler, context, single ) {

        var e = this.e( name );

        if ( bucket.hasOwnProperty( e.name ) !== true ) {
             bucket[ e.name ] = [];
        }

        bucket[ e.name ].push({
            ns: e.ns || undefined,
            handler: handler || function () {},
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
                i < l && a.push( args[ i ] );
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

        var e = this.e(event), stack, item, ns;

        if (bucket.hasOwnProperty(e.name)) {

            stack = bucket[ e.name ];
            ns = e.ns || undefined;

            for (var i = 0, l = stack.length; i < l; i++) {

                item = stack[ i ];

                if (item.ns === ns && (typeof handler === 'undefined' || handler === item.handler)) {
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
            stack, item;

        if (bucket.hasOwnProperty(e.name)) {

            stack = bucket[e.name];

            for (var i = 0, l = stack.length; i < l; i++) {

                item = stack[ i ];

                if (!e.ns || item.ns === e.ns) {

                    item.handler.apply(item.context || root, args);

                    if (item.single) {

                        stack.splice(i, 1);
                        l = stack.length;
                        i--;
                    }
                }
            }
        }
    }
};
