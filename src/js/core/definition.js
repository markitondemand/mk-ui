
function Mk() {}

Mk._$ = $;

Mk._uid = uid;

Mk._copy = copy;

Mk._each = each;

Mk._property = property;

Mk._pushsuper = pushsuper;

Mk._popsuper = popsuper;

Mk._transition = transition;

Mk._template = template;

Mk._eventEmitter = eventEmitter;

Mk._device = device;

Mk._keycodes = {
    backspace: 8, tab: 9, enter: 13, esc: 27, space: 32,
    pageup: 33, pagedown: 34, end: 35, home: 36,
    left: 37, up: 38, right: 39, down: 40, left: 37, right: 39,
    comma: 188
};

Mk.define = function (n, o) {

    var a = Mk,
        p = n.split( '.' );

    for (var i = 0, l = p.length - 1; i < l; i++) {

        if (!a.hasOwnProperty(p[ i ])) {
            a[ p[ i ] ] = {};
        }
        a = a[ p[ i ] ];
    }
    return a[ p[ p.length - 1 ] ] = o;
};

Mk.get = function (n) {

    var o = null,
        m = Mk,
        p = n.split('.');

    for (var i = 0, l = p.length; i < l; i++) {

        if (m.hasOwnProperty( p [ i ] )) {
            o = m[ p[ i ] ];
            m = o;
        }
        else {
            o = null;
        }
    }
    return o;
};

Mk.transitions = function (b) {

    if (b === true) {
        Mk._transition.enabled = true;
    } else if (b === false) {
        Mk._transition.enabled = false;
    }
    return Mk._transition.enabled;
};

Mk.create = function (name, base, proto) {

    name = name || '';

    proto = proto || base || {};

    base = typeof base === 'function'
        && base.prototype instanceof Mk
        && base || Mk;

    var member, statics, obj = function () {
        this._init.apply( this, arguments );
        return this;
    };

    obj.prototype = Object.create(base.prototype);

    for (member in proto) {
        Mk._property(obj.prototype, proto, member);
    }

    if (base !== Mk) {
        for (statics in base) {
            Mk._property(obj, base, statics);
        }
    }

    obj.prototype.constructor = obj;
    obj.prototype._super_ = base;

    return this.define(name, obj);
};
