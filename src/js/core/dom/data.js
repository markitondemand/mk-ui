
//
// data - store/retrieve data and data attributes
// ----------------------------------------

Dom.data = function (n, k, vl) {

    if (n) {

        var id = n._id = n._id || Mk.uid(),
            c  = cache[id] || {},
            v  = vl;

        // remove entire entry
        if (k === null) {

            n._id = null;
            delete cache[id];
            return c;
        }

        // undefined
        if (v === undf) {
            v = c[k] || n.getAttribute('data-' + k) || null;
            c[k] = v;
        }
        // remove key
        else if (vl === null) {
            v = c[k];
            delete c[k];
        }
        // set key
        else {
            c[k] = v;
        }

        cache[id] = c;

        return v;
    }
}
