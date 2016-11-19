
//
// transition
//
// Give us our browser transition key if
// transitions are enabled
// --------------------------------------------------

Mk.fn.transition = function () {

    var tr = Mk.fn.transition;

    if (tr.enabled) {

        if (tr.key) {
            return tr.key;
        }

        var el = document.createElement('xanimate'), t;

        for (t in tr.keys) {
            if (typeof el.style[t] !== 'undefined') {
                return tr.key = tr.keys[t];
            }
        }
    }
    return null;
}

Mk.fn.transition.enabled = false;

Mk.fn.transition.key = null;

Mk.fn.transition.keys = {
    'transition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'MozTransition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
};
