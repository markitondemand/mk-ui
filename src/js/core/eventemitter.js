
Mk.fn.eventEmitter = {

    xname: /^(\w+)\.?/,

    xns: /^\w+(\.?.*)$/,

    _add: function (b, n, h, c, s) {

        var e = this.e(n);

        if (!prop.call(b, e.name)) {
             b[e.name] = [];
        }

        b[e.name].push({
            ns: e.ns || undefined,
            handler: h || noop,
            context: c || null,
            single:  s === true
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

    on: function on(b, e, h, c) {
        return this._add(b, e, h, c, false);
    },

    one: function(b, e, h, c) {
        return this._add(b, e, h, c, true);
    },

    off: function off (b, ev, h) {

        var e = this.e(ev),
            i = 0, s, item, ns, l;

        if (prop.call(b, e.name)) {

            s = b[e.name];
            ns = e.ns || undf;
            l = s.length;

            for (; i < l; i++) {

                item = s[i];

                if (item.ns === ns && (Mk.type(h, 'u') || h === item.handler)) {
                    s.splice(i, 1);
                    l--;
                    i--;
                }
            }
        }
    },

    emit: function emit (b, argz /*, arguments */) {

        var args = this.args(argz),
            ev = args.shift(),
            e = this.e(ev),
            i = 0, s, item, l;

        if (prop.call(b, e.name)) {

            s = b[e.name];
            l = s.length;

            for (; i < l; i++) {

                item = s[ i ];

                if (!e.ns || item.ns === e.ns) {

                    item.handler.apply(item.context || root, args);

                    if (item.single) {
                        s.splice(i, 1);
                        l--; i--;
                    }
                }
            }
        }
    }
};
