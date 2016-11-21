
Mk.fn.property = function (o, p, m) {

    var d = Object.getOwnPropertyDescriptor(p, m),
        v = d.get !== void+1 && d.set !== void+1 && d || p[m],
        f;

    if (Mk.type(v, 'function')) {

        f = Mk.fn.wrapFunction(v, m);
        v  = {
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
};

Mk.fn.wrapFunction = function (f, m) {

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
};

Mk.fn.pushSuper = function (m) {
    this._chain_ = this._chain_ || [];
    this._chain_.push(m);
};

Mk.fn.popSuper = function (m) {
    this._chain_.splice(
        this._chain_.lastIndexOf(m), 1);
};
