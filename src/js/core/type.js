
Mk.type = function (obj, type) {

    var types = type.toLowerCase().split("|"),
        count = types.length,
        table = Mk.fn.typemap,
        i = 0, fn, ty;

    for (; i < count; i++) {

        ty = types[i];
        fn = prop.call(table, ty) ? table[ty] : table.defaultt;

        if (fn(obj, ty)) {
            return true;
        }
    }
    return false;
};

Mk.fn.typemap = {

    "index": function (o, i) {
        return o.indexOf(i) > -1;
    },

    "array": function (o) {
        return o instanceof Array;
    },

    "empty": function (o) {
        return o === "" || o === null
            || o === void+1 || o === false;
    },

    "null": function (o) {
        return o === null;
    },

    "date": function (o) {
        return o instanceof Date || o === Date;
    },

    "nodelist": function (o) {
        return o instanceof NodeList;
    },

    "node": function (o) {
        return /1|9|11/.test(o && o.nodeType || 0);
    },

    "window": function (o) {
        return o && o === o.window;
    },

    "function": function (o) {
        return typeof o === "function"
            && !Mk.fn.typemap.classlike(o);
    },

    "arraylike": function (o) {

        if (Mk.type(o, "function|string|window")) {
            return false;
        }

        var n = !!o && typeof o.length === "number",
            l = n && "length" in o && o.length;

        return Mk.type(o, "array|nodelist")
            || l === 0 || n && l > 0 && (l - 1) in o;
    },

    "instance": function (o) {

        var p = Object.getPrototypeOf(o),
            c = p && p.hasOwnProperty("constructor") && p.constructor,
            f = ({}).hasOwnProperty.toString;

        return (typeof c === "function" && f.call(c) === f.call(Object)) !== true;
    },

    "descriptor": function (o) {

        var index = Mk.fn.typemap.index,
            keys  = typeof o === "object" && Object.keys(o || {}) || [];

        if (index(keys, "enumerable") && index(keys, "configurable")) {

            if (index(keys, "value")) {
                return index(keys, "writable");
            }

            if (index(keys, "get")) {
                return index(keys, "set");
            }
        }
        return false;
    },

    "classlike": function (o) {
        return typeof o === "function"
            && Object.keys(o.prototype).length > 0;
    },

    "object": function (o) {
        return !!o && typeof o === "object" && !(o instanceof Array);
    },

    "defaultt": function (o, t) {
        return typeof o === t;
    }
};
