
Mk.fn.template = {

    xWhitespace: /[\r|\t|\n]+/g,

    xStatements: /{{([^}]+)}}(.*)({{\/\1}})/g,

    xInjections: /{{([^{]+)}}/g,

    markup: {
        highlight: '<span class="highlight">$1</span>',
        error: '<span class="error">{{template}} not found</span>'
    },

    parse: function (name, key, templates, data) {

        name = name || '';

        data = data || {};
        data.$key = key;

        templates = templates || {};

        var me = this;

        return me.get(name, templates)

        .replace(me.xWhitespace, '')

        .replace(me.xStatements, function (str, code, content) {
            return me.statements(str, key, code, content, templates, data);
        })

        .replace(me.xInjections, function (str, code) {
            return me.inject(str, key, code, templates, data);
        });
    },

    get: function (name, template) {

        var tmp = name;

        if (template && prop.call(template, name)) {
            tmp = template[name];
        }

        if (tmp instanceof Array) {
            tmp = tmp.join('');
        }

        return tmp;
    },

    statements: function (str, key, code, content, templates, data) {

        var parts = code.split(':'),
            map = parts[0],
            point = parts[1];

        if (prop.call(this.map, map)) {
            return this.map[ map ](
                content,
                key,
                templates,
                map == 'if' ? data : (data[ point ] || data),
                point);
        }

        return '';
    },

    inject: function (str, key, code, templates, data) {

        var parts = code.split( ':' ),
            map = parts[ 0 ],
            point = parts[ 1 ];

        if (point && prop.call(this.map, map)) {
            return this.map[map](
                point,
                key,
                templates,
                data,
                point);
        }

        if (prop.call(data, map)
            && !Mk.type(data[map], 'undefined|null')) {
            return data[map];
        }

        return '';
    },

    map: {

        'loop': function (name, key, templates, data, point) {

            var tmp = Mk.fn.template,
                buffer = [], i = 0,
                l, dp, x;

            if (/^\d+$/.test(point)) {

                l = parseInt(point, 10);

                for(; i < l; i++) {
                    data.$index = i;
                    buffer.push(tmp.parse(name, key, templates, data));
                }
                delete data.$index;
            }
            else if (Mk.type(data, 'arraylike')) {

                l = data.length;

                for(; i < l; i++) {

                    dp = data[i];

                    if (!Mk.type(dp, 'object')) {
                        dp = {key: '', value: dp};
                    }

                    dp.$index = i;

                    buffer.push(tmp.parse(name, key, templates, dp));

                    delete dp.$index;
                }
            }
            else {

                x = 0;

                for (l in data) {
                    buffer.push(tmp.parse(name, key, templates, {
                        key: l,
                        value: data[i],
                        $index: x++
                    }));
                }
            }
            return buffer.join('');
        },

        'if': function (name, key, templates, data, point) {

            if (prop.call(data, point)) {

                var dp = data[point];

                if ((!Mk.type(dp, 'empty'))
                    || (dp instanceof Array && dp.length > 0)) {
                    return Mk.fn.template.parse(name, key, templates, data);
                }
            }
            return '';
        },

        'unless': function(name, key, templates, data, point) {

            if (prop.call(data, point)) {

                var dp = data[point];

                if (dp !== undefined && dp === false) {
                    return Mk.fn.template.parse(name, key, templates, data);

                }
            }
            return '';
        },

        'highlight': function (name, key, templates, data, point) {

            var tmp = Mk.fn.template,
                str = data[point],
                hlt = data.highlight || '',
                htm;

            if (hlt) {
                htm = tmp.get('highlight', tmp.markup);
                //string escape patterns throw errors
				//so we must replace the escape character with doubles.
                str = str.replace(new RegExp('(' + hlt.replace(/\\/g, '\\\\') + ')', 'gi'), htm);
            }
            return str;
        },

        'scope': function (name, key, templates, data) {
            return Mk.fn.template.parse(name, key, templates, data);
        },

        'template': function (name, key, templates, data) {
            return Mk.fn.template.parse(name, key, templates, data);
        }
    }
};
