
Mk.extend = function (to, from, name) {

    var prop;

    if (Mk.type(name, 'undefined')) {

        for (prop in from) {
            Mk.extend(to, from, prop);
        }
    }
    else {

        prop = Object.getOwnPropertyDescriptor(from, name);

        // cannot access getters/setters with obj[prop] notation or an exception
        // will be thrown due to accessors on the prototype but not in actual context.
        // so for getters and setters we must do this.
        if (prop && (prop.get !== void+1 || prop.set !== void+1)) {
            Object.defineProperty(to, name, prop);
        }
        else {
            // everybody else goes here.
            // In this case, the descriptor has a 'value' property.
            // The value can be writable, and configurable or not, if it is not,
            // we want to leave the value alone. If it is, we want to pull out the raw value and reset it.
            Mk.property(to, name, prop.writable ? prop.value : prop);
        }
    }
    return this;
};

Mk.property = function (obj, name, value) {

    var prop = value,
        func;

    if (Mk.type(value, 'function')) {

        func = Mk.fn.wrapFunction(value, name);

        prop = {
            enumerable: true,
            configurable: true,
            get: function () {
                return func;
            },
            set: function (newvalue) {

                if (Mk.type(newvalue, 'function')) {
                    func = Mk.fn.wrapFunction(newvalue, name);
                    return;
                }
                func = newvalue;
            }
        };
    }

    if (!Mk.type(prop, 'descriptor')) {
        prop = {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true,
        };
    }

    Object.defineProperty(obj, name, prop);

    return this;
};

Mk.fn.wrapFunction = function (func, name) {

    if (func._id_) {
        return func;
    }

    var wrap = function () {

        this._pushSuper(name);
        var result = func.apply(this, arguments);
        this._popSuper(name);
        return result;
    };

    wrap._id_ = Mk._uid();

    wrap.toString = function () {
        return func.toString();
    };

    return wrap;
};

Mk.fn.pushSuper = function (name) {
    this._chain_ = this._chain_ || [];
    this._chain_.push(name);
};

Mk.fn.popSuper = function (name) {
    this._chain_.splice(
        this._chain_.lastIndexOf(name), 1);
};
