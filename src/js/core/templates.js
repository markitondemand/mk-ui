
Mk.fn.template = function (n, k, t, d) {

    n = n || '';
    t = t || {};
    d = d || {};

    d.$key = k;

    var me  = Mk.fn.template,
        tmp = me.get(n, t);

    tmp = tmp

    .replace(_s, '')

    .replace(_n, function (s, c, h) {
        return me.statements(s, k, c, h, t, d);
    })

    .replace(_d, function (s, c) {
        return me.inject(s, k, c, t, d)
    });

    return tmp;
}

Mk.fn.template.get = function (n, t) {

    var tmp = n;

    if (t && prop.call(t, n)) {
        tmp = t[n];
    }
    if (tmp instanceof Array) {
        tmp = tmp.join('');
    }
    return tmp;
};

Mk.fn.template.statements = function (s, k, c, h, t, d) {

    var p = c.split(':'),
        x = p[ 0 ],
        a = p[ 1 ];

    if (prop.call(this.map, x)) {
        return this.map[ x ]( h, k, t, x == 'if' ? d : (d[ a ] || d), a );
    }
    return '';
};

Mk.fn.template.inject = function (s, k, c, t, d) {

    var p = c.split( ':' ),
        x = p[ 0 ],
        a = p[ 1 ];

    if (a && prop.call(this.map, x)) {
        return this.map[x](a, k, t, d, a);
    }

    if (prop.call(d, x) && !type(d[x], 'undefined|null')) {
        return d[x];
    }
    return '';
};

Mk.fn.template.markup = {

    highlight: [
        '<span class="highlight">',
            '$1',
        '</span>'
    ],

    error: [
        '<span class="error">',
            '{{template}} not found',
        '</span>'
    ]
};

Mk.fn.template.map = {

    'loop': function (h, k, t, d, a) {

        var b = [], i, x, l, di, idx;

        if (type(d, 'number') || (x = parseInt(a, 10)) > -1) {

            for (i = 0; i < (x || d); i++) {

                d.$index = i;
                b.push(Mk.fn.template(h, k, t, d));
            }
        }
        else if (d instanceof Array) {

            for(i = 0, l = d.length; i < l; i++) {

                di = d[i];

                if (!type(di, 'object')) {
                    di = {key: '', value: d[i]};
                }

                di.$index = i;
                b.push(Mk.fn.template(h, k, t, di));
            }
        }
        else {
            for (i in d) {

                idx = idx || 0;

                b.push(Mk.fn.template(h, k, t, {
                    key: i,
                    value: d[i],
                    $index: idx++
                }));
            }
        }
        return b.join('');
    },

    'if': function (h, k, t, d, a) {

        if (prop.call(d, a)) {

            var dp = d[a];

            if ((!type(dp, 'empty'))
                || (dp instanceof Array && dp.length > 0)) {
                return Mk.fn.template(h, k, t, d);
            }
        }
        return '';
    },

    'highlight': function (h, k, t, d, a) {

        var hl = d.highlight || '',
            v  = d[h], w;

        if (hl) {
            w = Mk.fn.template.get('highlight', Mk.fn.template.markup);
            v = v.replace(new RegExp('(' + hl + ')', 'gi'), w);
        }
        return v;
    },

    'scope': function (h, k, t, d, a) {
        return Mk.fn.template(h, k, t, d);
    },

    'template': function (h, k, t, d, a) {
        return Mk.fn.template(h, k, t, d);
    }
};
