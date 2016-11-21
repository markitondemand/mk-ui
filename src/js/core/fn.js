
Mk.fn = {

    noop: function () {},

    keycodes: {
        backspace: 8, tab: 9, enter: 13, esc: 27, space: 32,
        pageup: 33, pagedown: 34, end: 35, home: 36,
        left: 37, up: 38, right: 39, down: 40, left: 37, right: 39,
        comma: 188
    },

    uid: function () {

        return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {

            var r = Math.random() * 16 | 0,
                v = c == 'x' && r || (r&0x3 | 0x8);

            return v.toString(16);
        });
    },

    property: function (o, p, m) {

        var d = Object.getOwnPropertyDescriptor(p, m),
            v = (d.get !== void+1 || d.set !== void+1) && d || {value: p[m]}, f;

        if (Mk.type(v.value, 'function')) {

            f = Mk.fn.wrapFunction(p[m], m);
            v = {
                get: function () {
                    return f;
                },
                set: function (value) {

                    if (Mk.type(value, 'function')) {
                        f = Mk.fn.wrapFunction(value, m);
                        return;
                    }
                    f = value;
                }
            };
        }
        Object.defineProperty(o, m, v);
    },

    wrapFunction: function (f, m) {

        if (f._id_) {
            return f;
        }

        var w = function () {
            this._pushSuper(m);
            var r = f.apply(this, arguments);
            this._popSuper(m);
            return r;
        };

        w._id_ = Mk.fn.uid();

        w.toString = function () {
            return f.toString();
        };

        return w;
    },

    pushSuper: function (m) {
        this._chain_ = this._chain_ || [];
        this._chain_.push(m);
    },

    popSuper: function (m) {
        this._chain_.splice(
            this._chain_.lastIndexOf(m), 1);
    },

    each: function (c, o, f) {

        var i = 0, l, r;

        if (Mk.type(o, 'arraylike')) {

            l = o.length;

            for (; i < l; i++) {

                r = f.call(c, o[i], i, o);

                if (r === false) {
                    break;
                }

                if (r === -1) {
                    [].splice.call(o, i, 1);
                    i--; l--;
                }
            }
        }
        else {

            for (i in o) {

                r = f.call(c, o[i], i, o);

                if (r === false) {
                    break;
                }
                if (r === -1) {
                    delete o[i];
                }
            }
        }
        return c;
    },

    find: function (c, o, f) {

        var v;

        Mk.fn.each(c, o, function (e, i, oo) {

            v = f.call(this, e, i, oo);

            if (v !== void+1) {
                return false;
            }
        });
        return v;
    },

    map: function (c, o, f) {

        var a, r, i;

        if (Mk.type(o, 'arraylike')) {

            a = [];

            Array.prototype.map.call(o, function (e, x, z) {

                r = f.call(c, e, x, z);

                if (r !== void+1) {
                    a.push(r);
                }
            });
        }
        else {

            a = {};

            for (i in o) {

                r = f.call(c, o[i], i, o);

                if (r !== void+1) {
                    a[i] = r;
                }
            }
        }
        return a;
    },

    filter: function (c, o, f) {

        if (Mk.type(o, 'arraylike')) {
            return Array.prototype.filter.call(o, function (x, y, z) {
                f.call(c, x, y, z);
            });
        }

        var n = {}, i;

        for (i in o) {

            if (f.call(c, o[i], i, o) !== false) {
                n[i] = o[i];
            }
        }
        return n;
    },

    eventEmitter: {

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
                name: /^(\w+)\.?/.exec( e )[ 1 ] || '',
                ns: ( /^\w+(\.?.*)$/.exec( e ) || [] )[ 1 ] || undefined
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
                ns = e.ns || void+1;
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
    },

    device: {

        exp: /(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i,

        get is () {
            return this.exp.test(navigator.userAgent);
        },

        get key () {

            var ua = navigator.userAgent,
                m  = (this.exp.exec(ua) || [])[1] || '';

            return m.toLowerCase();
        }
    }
};
