
// property
//
// ES5 defineProperty, propertyDescriptor, etc. to allow getters,
// setters, and hijack vanilla functions to take advantage of super() -
// a dynamic method allowing recursive super object references.
// -------------------------------------------------------------

Mk.fn.property = function (o, p, m) {

    var desc = gpd(p, m),
        prop, fn;

    if (!type(desc.get, 'undefined') || !type(desc.set, 'undefined')) {
        return dp(o, m, desc);
    }

    prop = p[m];

    if (!type(prop, 'function')) {
        return o[m] = prop;
    }

    fn = Mk.fn.wrapFunction(prop, m);

    dp(o, m, {

        get: function () {
            return fn;
        },

        set: function (value) {

            var v = value;

            if (type(value, 'function')) {
                v = Mk.fn.wrapFunction(value, m);
            }
            fn = v;
        }
    });
};

Mk.fn.wrapFunction = function (fn, m) {

    if (fn._id_) {
        return fn;
    }

    var func = function () {
        this._pushSuper(m);
        var r = fn.apply(this, arguments);
        this._popSuper(m);
        return r;
    };

    func._id_ = uid();

    func.toString = function () {
        return fn.toString();
    };
    return func;
};

Mk.fn.pushSuper = function (m) {
    this._chain_ = this._chain_ || [];
    this._chain_.push(m);
};

Mk.fn.popSuper = function (m) {
    this._chain_.splice(
        this._chain_.lastIndexOf(m), 1);
};
