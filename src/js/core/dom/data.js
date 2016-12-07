
$.data = function (node, key, value) {

    // get/create a unique id for our node
    // for memory leaks, we only assign a string to the node,
    // the object is kept entirely seperate
    var id = node._id_ || Mk.fn.uid(),
        // default out the value.
        val = value,
        // pull the cache object or create a new empty primitive
        cache = $.cache[id] || {};

    // if the key is explicitly null, we want to remove the entire cache entry.
    // remove the node id, and delete the cache. Finally, return it to
    // the user for future use.

    if (key === null) {
        node._id_ = null;
        delete $.cache[id];

        return cache;
    }

    // if the value is explicitly null we want to remove that entry.
    // assign the entry to val then delete it from the larger cache entry.

    if (val === null) {
        val = cache[key];
        delete cache[key];

        return val;
    }

    // if value is undefined, we want to pull from cache
    // or if node is a legit DOM node, pull from a data attribute.
    // we are not going to cache data attributes here because they may change.

    if (val === void+1) {

        val = cache[key];

        if (val === void+1 && /1|9|11/.test(node.nodeType)) {
            val = node.getAttribute('data-' + key) || null;
        }
    }

    // finally, we're just going to set the cache entry to
    // our value. Nothing crazy to see here.

    else {
        cache[key] = val;
    }

    // reassign the id incase this is the first entry
    node._id_ = id;
    // reassign the cache in case this is the first entry
    $.cache[id] = cache;

    return val;
}
