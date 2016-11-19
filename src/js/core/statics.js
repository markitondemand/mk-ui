
Mk.define = function (n, o) {

    var a = Mk,
        p = n.split( '.' ),
        i = 0,
        l = p.length - 1;

    for (; i < l; i++) {
        if (hasOwn.call(a, p[i])) {
            a[ p[ i ] ] = {};
        }
        a = a[ p[ i ] ];
    }
    return a[ p[ p.length - 1 ] ] = o;
};

Mk.get = function (n) {

    var o = null,
        m = Mk,
        p = n.split('.'),
        i = 0,
        l = p.length;

    for (; i < l; i++) {

        if (hasOwn.call(m, p[i])) {
            o = m[ p[ i ] ];
            m = o;
        }
        else {
            o = null;
        }
    }
    return o;
};

Mk.transitions = function (b) {

    if (b === true) {
        Mk.transition.enabled = true;
    } else if (b === false) {
        Mk.transition.enabled = false;
    }
    return Mk.transition.enabled;
};

Mk.create = function (name, base, proto) {

    name = name || '';

    proto = proto || base || {};

    base = typeof base === 'function'
        && base.prototype instanceof Mk
        && base || Mk;

    var member, statics, obj = function () {
        this._init.apply(this, arguments);
        return this;
    };

    obj.prototype = Object.create(base.prototype);

    for (member in proto) {
        Mk.property(obj.prototype, proto, member);
    }

    if (base !== Mk) {
        for (statics in base) {
            Mk.property(obj, base, statics);
        }
    }

    obj.prototype.constructor = obj;
    obj.prototype._super_ = base;
    obj.prototype._chain_ = null;

    return this.define(name, obj);
};
