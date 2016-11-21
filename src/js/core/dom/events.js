
$.delegate = function (p, n, x) {

    var r = {s: false, t: p};

    if (!x) {
        r.s = true;
    }
    else {
        new $(x, p).each(function (el) {

            if (n === el || new $(n).parent(el).length) {
                r.s = true;
                r.t = el;
                return false;
            }
        });
    }
    return r;
}

$.event = function (n, a, t, s, f, o, x) {

    var h, d;

    if (a) {

        h = function (e) {

            var z = false,
                w = $.delegate(this, e.target, x),
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
                $.event(n, false, t, s, f, o, x);
            }
            return r;
        };

        d = $.data(n, 'events') || {};

        d[t] = d[t] || [];

        d[t].push({
            type: t,
            ns: s,
            original: f,
            handler: h,
            delegate: x
        });

        $.data(n, 'events', d);

        n.addEventListener(t, h, false);

        return;
    }

    d = ($.data(n, 'events') || {})[t] || [];

    Mk.fn.each(this, d, function (o) {
        if (!s || s && o.ns === s) {
            if (!f || f === o.original) {
                n.removeEventListener(t, o.handler);
                return -1;
            }
        }
    });
}

$.on = function (n, t, d, h, o, x) {

    var p = t.split('.'),
        e = p.shift();

    $.event(n, true, e, p.join('.'), h, o, x);
}

$.off = function (n, t, h) {

    var p = t.split('.'),
        e = p.shift();

    $.event(n, false, e, p.join('.'), h);
}

$.emit = function (n, t, d) {

    var p = t.split('.'),
        e = p.shift(),
        ev = new Event(e);

    ev.ns = p.join('.');
    ev.data = d || [];

    n.dispatchEvent(ev);
}
