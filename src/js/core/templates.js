
//
// Template Engine
// lightweight template system
//
// features:
//
// data - {{<datapoint>}}
// inject data points by (key) datapoint name.
//
// highlight - {{highlight:<datapoint>}}
// inject identifying markup around a selected portion of matched text.
//
// template - {{template:<template name>}}
// nest templates by using the keyword 'template' followed by a colon.
//
// loop - {{loop:<datapoint>}}{{/loop:datapoint}}
// loop arrays, arrays of ojects, or objects with the 'loop' keyword.
// you must close the loop using the data point name (key) of access.
// $index is a hidden variable containing the increment index.
//
// scope - {{scope:<datapoint>}}{{/scope:datapoint}}
// change object scope using the keyword 'scope.'
// you must close the scope using the data point name (key) of access.
//
// Add your own rules by following the syntax style and creating callbacks in
// the tempalte.map object. to add custom markup injections, add markup templates
// to the templates._markup object.
//
// ---------------------------------------------------------------------------

var _d = /{{([^{]+)}}/g;
var _n = /{{([^}]+)}}(.*)({{\/\1}})/g;
var _s = /[\r|\t|\n]+/g;

function template (n, k, t, d) {

    n = n || '';
    t = t || {};
    d = d || {};

    d.$key = k;

    var tmp = template.get(n, t);

    tmp = tmp.replace(_s, '');

    tmp = tmp.replace(_n, function (s, c, h) {
        return template.statements(s, k, c, h, t, d);
    });

    tmp = tmp.replace(_d, function (s, c) {
        return template.inject(s, k, c, t, d)
    });

    return tmp;
}

// find template

template.get = function (n, t) {

    var tmp = n;

    if (t && t.hasOwnProperty(n)) {
        tmp = t[n];
    }

    if (tmp instanceof Array) {
        tmp = tmp.join('');
    }

    return tmp;
};

// parse statements only (handlbars that open/close)

template.statements = function (s, k, c, h, t, d) {

    var p = c.split(':'),
        x = p[ 0 ],
        a = p[ 1 ];

    if (template.map.hasOwnProperty(x)) {
        //if statements get special handling and passed the entire object
        return template.map[ x ]( h, k, t, x == 'if' ? d : (d[ a ] || d), a );
    }
    return '';
};

// parse injections (handlebars that are self closing)

template.inject = function (s, k, c, t, d) {

    var p = c.split( ':' ),
        x = p[ 0 ],
        a = p[ 1 ];

    if (a && template.map.hasOwnProperty(x)) {
        return template.map[x](a, k, t, d, a);
    }

    if (d.hasOwnProperty(x) && (typeof d[x] !== 'undefined') && d[x] !== null) {
        return d[x];
    }
    return '';
};

template.markup = {

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

// a map of the different statements
// allowed in templates
//

template.map = {

    'loop': function (h, k, t, d, a) {


        var b = [], i, x, l, di, idx;

        if (typeof d === 'number' || (x = parseInt(a, 10)) > -1) {

            for (i = 0; i < (x || d); i++) {
                d.$index = i;
                b.push(template(h, k, t, d));
            }
        }
        else if (d instanceof Array) {

            for(i = 0, l = d.length; i < l; i++) {

                di = d[i];

                if (typeof di !== 'object') {
                    di = {key: '', value: d[i]};
                }

                di.$index = i;
                b.push(template(h, k, t, di));
            }
        }
        else {
            for (i in d) {

                idx = idx || 0;

                b.push(template(h, k, t, {
                    key: i,
                    value: d[i],
                    $index: idx++
                }));
            }
        }
        return b.join('');
    },

    'if': function (h, k, t, d, a) {

        if (d.hasOwnProperty(a)) {

            var dp = d[a];

            if ((dp !== undefined && dp !== null && dp !== '' && dp !== false)
                || (dp instanceof Array && dp.length > 0)) {
                return template(h, k, t, d);
            }
        }
        return '';
    },

    'highlight': function (h, k, t, d, a) {

        var hl = d.highlight || '',
            v  = d[h], w;

        if (hl) {
            w = template.get('highlight', template.markup);
            v = v.replace(new RegExp('(' + hl + ')', 'gi'), w);
        }
        return v;
    },

    'scope': function (h, k, t, d, a) {
        return template(h, k, t, d);
    },

    'template': function (h, k, t, d, a) {
        return template(h, k, t, d);
    }
};
