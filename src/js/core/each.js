
//
// loop arraylike objects, primitives,
// and object instances over a callback function
//

Mk.each = function (ctx, obj, fn) {

    var i = 0, l, r;

    if (Mk.type(obj, 'al')) {

        l = obj.length;

        for (; i < l; i++) {

            r = fn.call(ctx, i, obj[i]);

            if (r === false) break;

            if (r === -1) {
                obj.splice(i, 1);
                i--; l--;
            }
        }
    }
    else {
        for (i in obj) {
            r = fn.call(ctx, i, obj[i]);

            if (r === false) { break; }
            else if (r === -1) { delete obj[i]; }
        }
    }

    return ctx;
}
