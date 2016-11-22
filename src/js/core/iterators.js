
Mk.fn.each = function (context, obj, callback) {

    var i = 0, count, result;

    if (Mk.type(obj, 'arraylike')) {

        count = obj.length;

        for (; i < count; i++) {

            result = callback.call(context, obj[i], i, obj);

            if (result === false) {
                break;
            }

            if (result === -1) {
                [].splice.call(obj, i, 1);
                i--; count--;
            }
        }
    }

    else {

        for (i in obj) {

            result = callback.call(context, obj[i], i, obj);

            if (result === false) {
                break;
            }

            if (result === -1) {
                delete o[i];
            }
        }
    }

    return context;
};

Mk.fn.find = function (context, obj, callback) {

    var result;

    Mk.fn.each(context, obj, function (o, i, orig) {

        result = callback.call(this, o, i, orig);

        if (result !== void+1) {
            return false;
        }
    });

    return result;
};

Mk.fn.map = function (context, obj, callback) {

    var map, result, i;

    if (Mk.type(obj, 'arraylike')) {

        map = [];

        Array.prototype.map.call(obj, function (o, x, orig) {

            result = callback.call(context, o, x, orig);

            if (result !== void+1) {
                map.push(result);
            }
        });
    }
    else {

        map = {};

        for (i in o) {

            result = callback.call(context, obj[i], i, obj);

            if (result !== void+1) {
                map[i] = result;
            }
        }
    }

    return map;
};

Mk.fn.filter = function (context, obj, callback) {

    if (Mk.type(obj, 'arraylike')) {
        return Array.prototype.filter.call(obj, function (o, i, orig) {
            return callback.call(context, o, i, orig);
        });
    }

    var result = {}, i;

    for (i in obj) {
        if (callback.call(context, obj[i], i, obj) !== false) {
            result[i] = obj[i];
        }
    }
    return result;
};
