
function type (o, t) {

    var ty = t.toLowerCase().split('|'),
        l  = ty.length,
        i  = 0,
        r  = true;

    for (; i < l; i++) {

        switch (ty[i]) {

            case 'empty':
                r = o === ''
                    || o === null
                    || o === void+1
                    || o === false
                    break;

            case 'array':
                r = o instanceof Array;
                break;

            case 'null':
                r = o === null;
                break;

            case 'date':
                r = o instanceof Date;
                break;

            case 'instance':
                r = type.instance(o);
                break;

            case 'nodelist':
                r = o instanceof NodeList;
                break;

            case 'node':
                r = nt.test(o && o.nodeType || 0);
                break;

            case 'window':
                r = o === root;
                break;

            case 'arraylike':
                r = type.arraylike(o);
                break;

            case 'class':
                r = type.clazz(o);
                break;

            case 'function':
                r = typeof(o) == 'function'
                    && !type.clazz(o);
                break;

            default:
                r = typeof(o) === ty[i];
                break;
        }

        if (r) {
            break;
        }
    }

    return r;
};

type.arraylike = function (o) {

    if (type(o, 'function|string|window')) {
        return false;
    }

    var n = typeof(o.length) == 'number',
        l = !!o && n && 'length' in o && o.length;

    return type(o, 'array|nodelist')
        || l === 0 || n && l > 0 && (l - 1) in o;
};

type.instance = function (o) {

    var p = Object.getPrototypeOf(o),
        c = p.hasOwnProperty('constructor') && p.constructor,
        f = ({}).hasOwnProperty.toString,
        s = f.call(Object);

    if (!p) {
        return true;
    }

    return (typeof(c) == 'function' && f.call(c) === s) !== true;
};

type.clazz = function (o) {
    return typeof(o) == 'function'
        && Object.keys(o).concat(Object.keys(o.prototype)).length > 0;
};

Mk.type = type;
