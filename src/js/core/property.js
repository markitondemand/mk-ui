
// property
//
// ES5 defineProperty, propertyDescriptor, etc. to allow getters,
// setters, and hyjack vanilla functions to take advantage of super() -
// a dynamic method allowing super object references.
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
}

//
// wrap vanilla functions to allow super() cabability
//

Mk.wrapFunction = function (fn, m) {

    if (fn._id_) {
        return fn;
    }

    var func = function () {

        this._pushsuper_(m);

        var r = fn.apply(this, arguments);

        this._popsuper_(m);

        return r;
    };

    func._id_ = Mk.uid();

    func.toString = function () {
        return fn.toString();
    };
    return func;
}

//
// keeps track of call stacks
// which allows super() to be called properly
// with nested functions (functions calling other functions calling super)
//

Mk.pushSuper = function (m) {

    var ch = this._chain_ = this._chain_ || [],
        st = this._stack_ = this._stack_ || [],
        i  = ch.lastIndexOf(m),
        s  = this._super_,
        p  = s && s.prototype || {},
        f  = this[m];

    if (i > -1) {
        s = st[i].super && st[i].super.prototype && st[i].super.prototype._super_ || null;
        p = s && s.prototype || {};
    }

    while (s !== null
        && p.hasOwnProperty(m)
        && p[m]._id_ === f._id_) {

        s = p._super_ || null;
        p = s && s.prototype || {};
    }

    if (s) {
        st.push({method: m, super: s});
        ch.push(m);
    }
}

//
// pop functions out of the call stack
// to keep super() context in place
//

Mk.popSuper = function (m) {

    var ch = this._chain_ = this._chain_ || [],
        st = this._stack_ = this._stack_ || [],
        i  = ch.lastIndexOf(m);

    if (i > -1) {
        ch.splice(i, 1);
        st.splice(i, 1);
    }
}
