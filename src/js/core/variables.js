
var noop = function () { },

    prop = {}.hasOwnProperty,

    dp = Object.defineProperty,

    gpd = Object.getOwnPropertyDescriptor,

    slice = [].slice,

    push = [].push,

    splice = [].splice,

    undf = void+1,

    doc = document,

    ua = navigator.userAgent,

    uax = /(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i,

    nt = /1|9|11/,

    _d = /{{([^{]+)}}/g,

    _n = /{{([^}]+)}}(.*)({{\/\1}})/g,

    _s = /[\r|\t|\n]+/g,

    uid = function () {

        return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {

            var r = Math.random() * 16 | 0,
                v = c == 'x' && r || (r&0x3 | 0x8);

            return v.toString(16);
        });
    };

    function Mk () {}

    Mk.fn = {};
