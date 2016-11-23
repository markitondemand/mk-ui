
$.remove = function (node) {

    // we are only dealing with node types of 1
    // 9 and 11 get ignored, even though they are nodes.
    if (node && node.nodeType === 1) {
        // recursively look children and call remove
        // we do this because of the following steps
        Mk.fn.each(this, node.childNodes, function (child) {
            $.remove(child);
        });

        // pull the data entry and remove it from cache
        // frees up memory
        var data = $.data(node, null);

        // loop events associated with the node and remove all listeners
        // frees up memory
        if (data && data.events) {
            Mk.fn.each(this, data.events, function (obj, type) {
                $.off(node, type);
            });
        }
        // finally, remove the element
        node.parentNode.removeChild(node);
    }
}
