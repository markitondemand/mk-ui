
//
// removes elements, events, and data from memory
//

$.remove = function (n) {

    var d;

    Mk.fn.each(this, n.childNodes, function (c) {
        if (c && c.nodeType === 1) {
            Mk.$.remove(c);
        }
    });

    var d = Mk.$.data(n, null);

    if (d && d.events) {
        Mk.fn.each(this, d.events, function (v, t) {
            Mk.$.off(n, t);
        });
    }
    n.parentNode.removeChild(n);
}
