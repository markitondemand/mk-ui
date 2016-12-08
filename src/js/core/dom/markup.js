
$.wrap = {
    option: [1, '<select multiple="multiple">', '</select>'],
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    li: [1, '<ul>', '</ul>'],
    dd: [1, '<dl>', '</dl>'],
    defaultt: [ 0, '', '']
};

$.wrap.optgroup  = $.wrap.option;
$.wrap.caption   = $.wrap.thead;
$.wrap.tbody     = $.wrap.thead;
$.wrap.tfoot     = $.wrap.thead;
$.wrap.dt        = $.wrap.dd;

$.markup = function (s) {

    var d = document;

    if (!s) {
        return d.createDocumentFragment();
    }

    // html5 templates
    // most browsers support this method and
    // is much faster than the latter.
    var c = d.createElement('template'),
        f, p;

    if (c.content) {
        c.innerHTML = s;
        return c.content;
    }

    // Sadly, buy as expected, Internet Explorer doesn't support
    // templates so we get to insert inner html and rip out the children.
    var t = (/^\s*<([^>\s]+)/.exec(s) || [])[1] || null,
        a = t && $.wrap.hasOwnProperty(t) && $.wrap[t] || $.wrap.defaultt,
        i = 0;

    c = d.createElement('div');
    c.innerHTML = a[1] + s + a[2];

    p = c.firstChild;
    f = d.createDocumentFragment();

    while (i < a[0]) {
        p = p.firstChild;
        i++;
    }

    if (p) {
        f.appendChild(p);
    }

    return f;
};
