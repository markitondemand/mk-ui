
Mk.fn.device = {

    get is () {
        return uax.test(ua);
    },

    get id () {
        return ((uax.exec(ua) || [])[1] || '').toLowerCase();
    }
};
