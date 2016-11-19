
function each (c, o, f) {

    var i = 0, l, r;

    if (type(o, 'arraylike')) {

        l = o.length;

        for (; i < l; i++) {

            r = f.call(c, o[i], i);

            if (r === false) {
                break;
            }

            if (r === -1) {
                [].splice.call(o, i, 1);
                i--; l--;
            }
        }
    }
    else {
        for (i in o) {

            r = f.call(c, o[i], i);

            if (r === false) {
                break;
            }
            if (r === -1) {
                delete o[i];
            }
        }
    }
    return c;
};

function find (c, o, f) {

    var v;
    each(c, o, function (e, i) {

        v = f.call(this, e, i);

        if (v !== undf) {
            return false;
        }
    });
    return v;
};

function map (c, o, f) {

    var a, r, i;

    if (type(o, 'arraylike')) {

        a = [];

        Array.prototype.map.call(o, function (e, x, z) {

            r = f.call(c, e, x, z);

            if (r !== undf) {
                a.push(r);
            }
        });
    }
    else {

        a = {};

        for (i in o) {

            r = f.call(c, o[i], i, o);

            if (r !== undf) {
                a[i] = r;
            }
        }
    }
    return a;
};

function filter (c, o, f) {

    if (type(o, 'arraylike')) {
        return Array.prototype.filter.call(o, function (e, i, a) {
            f.call(c, e, i, a);
        });
    }

    var n = {}, i, r;

    for (i in o) {

        r = f.call(c, o[i], i, o);

        if (r === true) {
            n[i] = o[i];
        }
    }
    return n;
};

Mk.fn.filter = filter;
Mk.fn.each = each;
Mk.fn.find = find;
Mk.fn.map = map;
