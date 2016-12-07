
$.remove = function (node) {

    // we are only dealing with node types of 1 (element) and 11 (fragment)
    // 9 (document) gets ignored

    if (node && (node.nodeType === 1 || node.nodeType === 11)) {

        // recursively look children and call remove
        // we do this because of the following steps

        var children = node.childNodes,
            l = children.length;

        while (l--) {
            $.remove(children[l]);
        }

        // pull the data entry and remove it from cache
        // frees up memory

        var data = $.data(node, null);

        // loop events associated with the node and remove all listeners
        // frees up memory

        if (data && data.events) {
            Mk.fn.each(this, data.events, function (obj, type) {
                $.events.off(node, type);
            });
        }
    }

    // finally, remove the element
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
