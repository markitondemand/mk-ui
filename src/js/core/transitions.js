
//
// transition
//
// Give us our browser transition key if
// transitions are enabled
// --------------------------------------------------

function transition () {

    if (transition.enabled) {

        if (transition.key) {
            return transition.key;
        }

        var el = document.createElement('xanimate'), t;

        for (t in transition.keys) {
            if (typeof el.style[t] !== 'undefined') {
                return transition.key = transition.keys[t];
            }
        }
    }
    return null;
}

transition.enabled = false;

transition.key = null;

transition.keys = {
    'transition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'MozTransition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
};
