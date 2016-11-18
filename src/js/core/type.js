
Mk.type = function (o, k) {

    var m = Mk.typemap;

    return m.hasOwnProperty(k)
        && m[k](o) || false;
};

Mk.typemap = {

    s: function (o) {
        return typeof o == 'string';
    },

    u: function (o) {
        return o === void+1;
    },

    f: function (o) {
        return typeof o == 'function';
    },

    n: function (o) {
        return typeof o == 'number';
    },

    a: function (o) {
        return o instanceof Array;
    },

    x: function (o) {
        return o === null;
    },

    o: function (o) {

        if (!o || o.toString().toLowerCase() !== "[object object]" ) {
            return false;
        }

        var p = Object.getPrototypeOf(o),
            c = p.hasOwnProperty('constructor') && p.constructor,
            f = ({}).hasOwnProperty.toString,
            s = f.call(Object);

        if (!p) {
            return true;
        }

        return this.f(c) && f.call(c) === s;
    },

    c: function (o) {

        if (this.f(o)) {
            return Object.keys(o).concat(
                Object.keys(o.prototype)).length > 0;
        }
        return false;
    },

    nl: function (o) {
        return o instanceof NodeList;
    },

    nd: function (o) {
        return o && o.nodeType === 1 || false;
    },

    al: function (o) {

        if (this.f(o) || this.s(o) || o === root) {
            return false;
        }

        var l = !!o && this.n(o.length)
            && 'length' in o && o.length;

        return this.a(o)
            || this.nl(o)
            || l === 0
            || this.n(l) && l > 0 && (l - 1) in o;
    },

    bf: function (o) {
        return this.f(o) && !this.c(o);
    }
};
