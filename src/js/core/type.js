
/*
    Mk.type
    More complex typing
    Pass in a type or multiple types (pipe delimited)
    returns boolean

    types:
        string
        number
        object
        boolean
        function
        undefined
        null
        empty
        array
        arraylike
        class
        instance
        node
        nodelist
        window
        date
*/

Mk.type = function (o, t) {

    var c = t.toLowerCase().split('|'),
        r = false;

    for (var i = 0, l = c.length; i < l; i++) {

        if (Mk.fn.type.is(o, c[i])) {
            return true;
        }
    }
    return r;
};

Mk.fn.type = {

    is: function (o, t) {

        var r = typeof o == t;

        switch (t) {

            case 'empty':
                r = o === ''
                    || o === null
                    || o === void+1
                    || o === false;
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
                r = this.instance(o);
                break;

            case 'nodelist':
                r = o instanceof NodeList;
                break;

            case 'node':
                r = /1|9|11/.test(o && o.nodeType || 0);
                break;

            case 'window':
                r = o === window;
                break;

            case 'arraylike':
                r = this.arraylike(o);
                break;

            case 'class':
                r = this.clazz(o);
                break;

            case 'function':
                r = typeof o == 'function'
                    && !this.clazz(o);

                break;
        }
        return r;
    },

    arraylike: function (o) {

        if (Mk.type(o, 'function|string|window')) {
            return false;
        }

        var n = !!o && typeof o.length == 'number',
            l = n && 'length' in o && o.length;

        return Mk.type(o, 'array|nodelist')
            || l === 0 || n && l > 0 && (l - 1) in o;
    },

    instance: function (o) {

        var p = Object.getPrototypeOf(o),
            c = p && p.hasOwnProperty('constructor') && p.constructor,
            f = ({}).hasOwnProperty.toString;

        return (typeof c == 'function' && f.call(c) === f.call(Object)) !== true;
    },

    clazz: function (o) {

        return typeof o == 'function'
            && Object.keys(o).concat(
                Object.keys(o.prototype)).length > 0;
    }
};
