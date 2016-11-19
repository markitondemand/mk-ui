
// property
//
// ES5 defineProperty, propertyDescriptor, etc. to allow getters,
// setters, and hijack vanilla functions to take advantage of super() -
// a dynamic method allowing recursive super object references.
// -------------------------------------------------------------

Mk.property = function (obj, proto, member) {

    var desc = Object.getOwnPropertyDescriptor(proto, member),
        prop, fn;

    if (!Mk.type(desc.get, 'u')) {
        return Object.defineProperty(obj, member, desc);
    }

    prop = proto[member];

    if (!Mk.type(prop, 'bf')) {
        return obj[member] = Mk.copy(prop);
    }

    fn = Mk.wrapFunction(prop, member);

    Object.defineProperty(obj, member, {

        get: function () {
            return fn;
        },

        set: function (value) {

            var v = value;

            if (MK.type(value, 'bf')) {
                v = Mk.wrapFunction(value);
            }
            fn = v;
        }
    });
};

Mk.wrapFunction = function (fn, m) {

    if (fn._id_) {
        return fn;
    }

    var func = function () {
        this._pushSuper(m);
        var r = fn.apply(this, arguments);
        this._popSuper(m);
        return r;
    };

    func._id_ = Mk.uid();

    func.toString = function () {
        return fn.toString();
    };
    return func;
};

Mk.pushSuper = function (m) {
    this._chain_ = this._chain_ || [];
    this._chain_.push(m);
};

Mk.popSuper = function (m) {
    this._chain_.splice(
        this._chain_.lastIndexOf(m), 1);
};
