
Mk.type = function (o, t) {

    var c = t.toLowerCase().split('|'),
        r = false;

    for (var i = 0, l = c.length;
        i < l && (r = Mk.type.is(c[i])) !== true;
        i++) {}

    return r;
};

Mk.type.is = function (o, t) {

    var r = typeof o == t;

    switch (t) {

        case 'empty':
            r = o === ''
                || o === null
                || o === void+1
                || o === false;

        case 'array':
            r = o instanceof Array;

        case 'null':
            r = o === null;

        case 'date':
            r = o instanceof Date;

        case 'instance':
            r = this.instance(o);

        case 'nodelist':
            r = o instanceof NodeList;

        case 'node':
            r = /1|9|11/.test(o && o.nodeType || 0);

        case 'window':
            r = o === window;

        case 'arraylike':
            r = this.arraylike(o);

        case 'class':
            r = this.clazz(o);

        case 'function':
            r = typeof o == 'function' && !this.clazz(o);
    }

    return r;
};

Mk.type.arraylike = function (o) {

    if (Mk.type(o, 'function|string|window')) {
        return false;
    }

    var n = !!o && typeof o.length == 'number',
        l = n && 'length' in o && o.length;

    return Mk.type(o, 'array|nodelist')
        || l === 0 || n && l > 0 && (l - 1) in o;
};

Mk.type.instance = function (o) {

    var p = Object.getPrototypeOf(o),
        c = p && p.hasOwnProperty('constructor') && p.constructor,
        f = ({}).hasOwnProperty.toString;

    return (typeof c == 'function' && f.call(c) === f.call(Object)) !== true;
};

Mk.type.clazz = function (o) {

    return typeof o == 'function'
        && Object.keys(o).concat(
            Object.keys(o.prototype)).length > 0;
};
