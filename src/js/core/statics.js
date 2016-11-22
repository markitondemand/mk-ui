
Mk.define = function (namespace, obj) {

    var base = Mk,
        parts = namespace.split( '.' ),
        count = parts.length - 1,
        i = 0;

    for (; i < count; i++) {
        if (!prop.call(base, parts[i])) {
            base[parts[i]] = {};
        }
        base = base[parts[i]];
    }
    return base[parts[count]] = obj;
};

Mk.get = function (namespace) {

    var parts = namespace.split('.'),
        count = parts.length,
        base = Mk,
        obj = null,
        i = 0;

    for (; i < count; i++) {
        if (prop.call(base, parts[i])) {
            obj = base[parts[i]];
            base = obj;
        }
        else {
            obj = null;
        }
    }
    return obj;
};

Mk.create = function (name, base, proto) {

    name = name || '';

    proto = proto || base || {};

    base = typeof base === 'function'
        && base.prototype instanceof Mk
        && base || Mk;

    var obj = function () {
        this._init.apply(this, arguments);
        return this;
    };

    obj.prototype = Object.create(base.prototype);

    Mk.extend(obj.prototype, proto);

    //TODO: add static members

    obj.prototype.constructor = obj;

    obj.prototype._super_ = base;
    obj.prototype._chain_ = null;

    return this.define(name, obj);
};
