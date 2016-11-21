
Mk.define = function (n, o) {

    var a = Mk,
        p = n.split( '.' );

    for (var i = 0, l = p.length - 1; i < l; i++) {
        if (prop.call(a, p[i])) {
            a[p[i]] = {};
        }
        a = a[p[i]];
    }
    return a[p[p.length - 1]] = o;
};

Mk.get = function (n) {

    var o = null,
        m = Mk,
        p = n.split('.');

    for (var i = 0, l = p.length; i < l; i++) {
        if (prop.call(m, p[i])) {
            o = m[p[i]];
            m = o;
        }
        else {
            o = null;
        }
    }
    return o;
};

Mk.create = function (name, base, proto) {

    name = name || '';

    proto = proto || base || {};

    base = typeof base == 'function'
        && base.prototype instanceof Mk
        && base || Mk;

    var o, m, s,
        obj = function () {
            this._init.apply(this, arguments);
            return this;
        };

    o = obj.prototype = Object.create(base.prototype);

    for (m in proto) {
        Mk.fn.property(o, proto, m);
    }

    if (base !== Mk) {

        for (s in base) {

            Mk.fn.property(obj, base, s);
        }
    }

    o.constructor = obj;
    o._super_ = base;
    o._chain_ = null;

    return this.define(name, obj);
};
