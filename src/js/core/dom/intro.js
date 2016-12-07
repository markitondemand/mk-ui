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

function $(selector, context) {
    return this.find(selector, context);
}

$.cache = {};
