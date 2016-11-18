
Mk.filter = function (c, o, f) {

    if (Mk.type(o, 'al')) {
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
