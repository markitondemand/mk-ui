
/*
    Super light-weight DOM library
    We've chosen to leave jQuery out of the default build
    and use a very light weight roll of common DOM functionality.
    You can always replace this implementation with jQuery or any other
    by:

    1. using AMD, define a module called MkDOM as a dependency of Core.
    2. Vanilla JavaScript, just set window.MkDOM to a different library.

    The Core.$ will be overridden with the new library you've specified.
    Make sure method names for the below are the SAME or current components will break
    on referencing non existent members.

    Members:

    length

    is()
    val()
    each()
    find()
    filter()
    parent() (also does closest)
    hasClass()
    addClass()
    removeClass()
    attr()
    prop()
    data()
    html()
    text()
    markup()
    appendTo()
    prependTo()
    append()
    prepend()
    remove()
    on()
    one()
    off()
    emit()
    ajax()
*/

var
doc = document,
//
// elem cache system
// ------------------------------------
cache = {},
//
// shorthand slice
// ------------------------------------
slice = [].slice,
//
// clearing out arraylike objects
// ------------------------------------
splice = [].splice,
//
// making objects arraylike
// ------------------------------------
push = [].push,
//
// tag/markup testing
// ------------------------------------
tg = /^\s*<([^>\s]+)/,
//
// nodeType testing
// ------------------------------------
nt = /1|9|11/,
//
// html creation wrappers
// -------------------------------------
wrap = {
    option: [ 1, '<select multiple="multiple">', '</select>' ],
    thead: [ 1, '<table>', '</table>' ],
    col: [ 2, '<table><colgroup>', '</colgroup></table>' ],
    tr: [ 2, '<table><tbody>', '</tbody></table>' ],
    td: [ 3, '<table><tbody><tr>', '</tr></tbody></table>' ],
    li: [1, '<ul>', '</ul>'],
    dd: [1, '<dl>', '</dl>'],
    defaultt: [ 0, "", "" ]
};
//
// element wrap duplicates
// ----------------------------------------
wrap.caption = wrap.thead;
wrap.optgroup = wrap.option;
wrap.tbody = wrap.thead;
wrap.tfoot = wrap.thead;
wrap.dt = wrap.dd;

function Dom (s, c) {
    return this.find(s, c);
}
