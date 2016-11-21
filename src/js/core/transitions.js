
//
// transition
//
// Give us our browser transition key if
// transitions are enabled
// --------------------------------------------------

Mk.transitions = {

    _enabled: false,

    _key: null,

    _keys: {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    },

    get enabled () {
        return this._enabled;
    },

    get disabled () {
        return this._enabled !== true;
    },

    get key () {

        if (this.enabled) {

            if (this._key) {
                return this._key;
            }

            var keys = this._keys,
                el = document.createElement('xanimate'), t;

            for (t in keys) {
                if (!Mk.type(el.style[t], 'undefined')) {
                    return this._key = keys[t];
                }
            }
        }
        return void+1;
    },

    enable: function () {
        return this._enabled = true;
    },

    disable: function () {
        return this._enabled = false;
    }
};
