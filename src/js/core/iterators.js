
Mk.fn.each = function (c, o, f) {

    var i = 0, l, r;

    if (Mk.type.is(o, 'arraylike')) {

        l = o.length;

        for (; i < l; i++) {

            r = f.call(c, o[i], i, o);

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

            r = f.call(c, o[i], i, o);

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

Mk.fn.find = function (c, o, f) {

    var v;

    Mk.fn.each(c, o, function (e, i, oo) {

        v = f.call(this, e, i, oo);

        if (v !== void+1) {
            return false;
        }
    });
    return v;
};

Mk.fn.map = function (c, o, f) {

    var a, r, i;

    if (Mk.type.is(o, 'arraylike')) {

        a = [];

        Array.prototype.map.call(o, function (e, x, z) {

            r = f.call(c, e, x, z);

            if (r !== void+1) {
                a.push(r);
            }
        });
    }
    else {

        a = {};

        for (i in o) {

            r = f.call(c, o[i], i, o);

            if (r !== void+1) {
                a[i] = r;
            }
        }
    }
    return a;
};

Mk.fn.filter = function (c, o, f) {

    if (Mk.type.is(o, 'arraylike')) {
        return Array.prototype.filter.call(o, function (x, y, z) {
            f.call(c, x, y, z);
        });
    }

    var n = {}, i;

    for (i in o) {

        if (f.call(c, o[i], i, o) !== false) {
            n[i] = o[i];
        }
    }
    return n;
};
