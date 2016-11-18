
Mk.map = function (c, o, f) {

    var a, r, i;

    if (Mk.type(o, 'al')) {

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
