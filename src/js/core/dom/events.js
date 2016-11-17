
Dom.delegate = function (p, n, x) {

    var r = {s: false, t: p};

    if (!x) {
        r.s = true;
    }
    else {
        new Dom(x, p).each(function (i, el) {

            if (n === el || new Dom(n).parent(el).length) {
                r.s = true;
                r.t = el;
                return false;
            }
        });
    }
    return r;
}

Dom.event = function (n, a, t, s, f, o, x) {

    var h, d;

    if (a) {

        h = function (e) {

            var z = false,
                w = Dom.delegate(this, e.target, x),
                r;

            if (e.ns) {
                if (e.ns === s && w.s) {
                    r = f.apply(w.t, [e].concat(e.data));
                    z = true;
                }
            }
            else if (w.s) {
                r = f.call(w.t, e);
                z = true;
            }

            if (z && o) {
                Dom.event(n, false, t, s, f, o, x);
            }
            return r;
        };

        d = Dom.data(n, 'events') || {};

        d[t] = d[t] || [];

        d[t].push({
            type: t,
            ns: s,
            original: f,
            handler: h,
            delegate: x
        });

        Dom.data(n, 'events', d);

        n.addEventListener(t, h, false);

        return;
    }

    d = (Dom.data(n, 'events') || {})[t] || [];

    Mk.each(this, d, function (i, o) {
        if (!s || s && o.ns === s) {
            if (!f || f === o.original) {
                n.removeEventListener(t, o.handler);
                return -1;
            }
        }
    });
}

Dom.on = function (n, t, d, h, o, x) {

    var p = t.split('.'),
        e = p.shift();

    Dom.event(n, true, e, p.join('.'), h, o, x);
}

Dom.off = function (n, t, h) {

    var p = t.split('.'),
        e = p.shift();

    Dom.event(n, false, e, p.join('.'), h);
}

Dom.emit = function (n, t, d) {

    var p = t.split('.'),
        e = p.shift(),
        ev = new Event(e);

    ev.ns = p.join('.');
    ev.data = d || [];

    n.dispatchEvent(ev);
}
