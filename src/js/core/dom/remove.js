
//
// removes elements, events, and data from memory
//

Dom.remove = function (n) {

    var d;

    Mk.each(this, n.childNodes, function (i, c) {
        if (c && c.nodeType === 1) {
            Dom.remove(c);
        }
    });

    var d = Dom.data(n, null);

    if (d && d.events) {
        Mk.each(this, d.events, function (t, v) {
            Dom.off(n, t);
        });
    }
    n.parentNode.removeChild(n);
}
