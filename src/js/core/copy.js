
Mk.copy = function (o) {

    var i, l ,r;

    if (Mk.type(o, 'al')) {

        i = 0;
        l = o.length;
        r = [];

        for(; i < l && r.push(Mk.copy(o[i])); i++) {}
    }

    else if (Mk.type(o, 'o')) {

        r = {};

        for (i in o) {
            r[i] = Mk.copy(o[i]);
            l = true;
        }
    }

    return r || o;
}
