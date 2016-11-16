
//
// check for array-like objects -
// array, NodeList, jQuery (anything with an iterator)
//

function arraylike (a) {

    var l = !!a && typeof a.length == 'number'
        && 'length' in a
        && a.length;

    if (typeof a === 'function' || a === root) {
        return false;
    }

    return a instanceof Array
        || a instanceof NodeList
        || l === 0
        || typeof l === 'number' && l > 0 && (l - 1) in a;
}

// test for object primitives vs.
// instantiated objects and prototypes
//

function basicObj (o) {

    if (!o || o.toString().toLowerCase() !== "[object object]" ) {
        return false;
    }

    var p = Object.getPrototypeOf(o),
        c = p.hasOwnProperty('constructor') && p.constructor,
        f = ({}).hasOwnProperty.toString,
        s = f.call(Object);

    if (!p) {
        return true;
    }

    return typeof c === 'function' && f.call(c) === s;
}

// check for vanulla functions
// vanilla functions have no keys and no prototype keys
//

function basicFunction (fn) {

    if (typeof fn !== 'function') {
        return false;
    }

    var keys = Object.keys(fn)
        .concat(Object.keys(fn.prototype));

    return keys.length < 1;
}

// generates unique ids
//

function uid () {
    return 'xxxx-4xxx-yxxx'.replace( /[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3 | 0x8);
        return v.toString(16);
    });
}

// deep copy objects to remove pointers
//

function copy(o) {

    var i, l ,r;

    if (o instanceof Array) {

        i = 0;
        l = o.length;
        r = [];

        for(; i < l && r.push(copy(o[i])); i++ ) {}
    }

    else if (basicObj(o)) {

        r = {};

        for(i in o) {
            r[i] = copy(o[i]);
            l = true;
        }
    }

    return r || o;
}

// loop arraylike objects, primities,
// and object instances over a callback function
//

function each (ctx, obj, fn) {

    var i = 0, l, r;

    if (arraylike(obj)) {

        l = obj.length;

        for (; i < l; i++) {

            r = fn.call(ctx, i, obj[i]);

            if (r === false) break;

            if (r === -1) {
                obj.splice(i, 1);
                i--; l--;
            }
        }
    }
    else {
        for (i in obj) {
            r = fn.call(ctx, i, obj[i]);

            if (r === false) { break; }
            else if (r === -1) { delete obj[i]; }
        }
    }
    return ctx;
}
