
//
// each
// loop arraylike objects, primitives,
// and object instances over a callback function
//

Mk.each = function (c, o, f) {

    var i = 0, l, r;

    if (Mk.type(o, 'al')) {

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
}
