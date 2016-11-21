
Mk.template = function (n, k, t, d) {
    return Mk.fn.template.parse(n, k, t, d);
}

Mk.fn.template = {

    markup: {
        highlight: '<span class="highlight">$1</span>',
        error: '<span class="error">{{template}} not found</span>'
    },

    parse: function (n, k, t, d) {

        n = n || '';
        t = t || {};
        d = d || {};

        d.$key = k;

        var tmp = this;

        return tmp
        .get(n, t)
        .replace(/[\r|\t|\n]+/g, '')
        .replace(/{{([^}]+)}}(.*)({{\/\1}})/g, function (s, c, h) {
            return tmp.statements(s, k, c, h, t, d);
        })
        .replace(/{{([^{]+)}}/g, function (s, c) {
            return tmp.inject(s, k, c, t, d)
        });
    },

    get: function (n, t) {

        var tmp = n;

        if (t && prop.call(t, n)) {
            tmp = t[n];
        }

        if (tmp instanceof Array) {
            tmp = tmp.join('');
        }
        return tmp;
    },

    statements: function (s, k, c, h, t, d) {

        var p = c.split(':'),
            x = p[ 0 ],
            a = p[ 1 ];

        if (prop.call(this.map, x)) {
            return this.map[ x ]( h, k, t, x == 'if' ? d : (d[ a ] || d), a );
        }
        return '';
    },

    inject: function (s, k, c, t, d) {

        var p = c.split( ':' ),
            x = p[ 0 ],
            a = p[ 1 ];

        if (a && prop.call(this.map, x)) {
            return this.map[x](a, k, t, d, a);
        }

        if (prop.call(d, x) && !Mk.type(d[x], 'undefined|null')) {
            return d[x];
        }
        return '';
    },

    map: {

        'loop': function (h, k, t, d, a) {

            var b = [], i, x, l, di, idx;

            if (Mk.type(d, 'number') || (x = parseInt(a, 10)) > -1) {

                for (i = 0; i < (x || d); i++) {

                    d.$index = i;
                    b.push(Mk.template(h, k, t, d));
                }
            }
            else if (d instanceof Array) {

                for(i = 0, l = d.length; i < l; i++) {

                    di = d[i];

                    if (!Mk.type(di, 'object')) {
                        di = {key: '', value: d[i]};
                    }

                    di.$index = i;
                    b.push(Mk.template(h, k, t, di));
                }
            }
            else {
                for (i in d) {

                    idx = idx || 0;

                    b.push(Mk.template(h, k, t, {
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

                if ((!Mk.type(dp, 'empty'))
                    || (dp instanceof Array && dp.length > 0)) {
                    return Mk.template(h, k, t, d);
                }
            }
            return '';
        },

        'highlight': function (h, k, t, d, a) {

            var tp = Mk.template,
                hl = d.highlight || '',
                v  = d[h], w;

            if (hl) {
                w = tp.get('highlight', tp.markup);
                v = v.replace(new RegExp('(' + hl + ')', 'gi'), w);
            }
            return v;
        },

        'scope': function (h, k, t, d, a) {
            return Mk.template(h, k, t, d);
        },

        'template': function (h, k, t, d, a) {
            return Mk.template(h, k, t, d);
        }
    }
};
