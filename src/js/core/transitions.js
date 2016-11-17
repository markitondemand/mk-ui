
//
// transition
//
// Give us our browser transition key if
// transitions are enabled
// --------------------------------------------------

Mk.transition = function () {

    var tr = Mk.transition;

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

Mk.transition.enabled = false;

Mk.transition.key = null;

Mk.transition.keys = {
    'transition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'MozTransition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
};
