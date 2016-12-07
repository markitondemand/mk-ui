
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

    // html5 templates
    // most browsers support this method and
    // is much faster than the latter.
    var d = document,
        c = d.createElement('template'), f;

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
    f = d.createDocumentFragment();

    c.innerHTML = a[1] + s + a[2];

    while (i < a[0]) {
        f.appendChild(c.firstChild);
        i++;
    }

    return f;
};
