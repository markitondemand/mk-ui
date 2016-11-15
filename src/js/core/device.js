
//
// simple device checking
//

var agent  = navigator.userAgent,
    device = {

        agentexp: /(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i,

        get is () {
            return this.agentexp.test(agent)
        },

        get isAndroid () {
            return this.id === 'android';
        },

        get isWebos () {
            return this.id === 'webos';
        },

        get isiPhone () {
            return this.id === 'iphone';
        },

        get isiPad () {
            return this.id === 'ipad';
        },

        get isiPod () {
            return this.id === 'ipod';
        },

        get isBlackberry () {
            return this.id === 'blackberry';
        },

        get isIEMobile () {
            return this.id === 'iemobile';
        },

        get isOperaMini () {
            return this.id === 'opera mini';
        },

        get id () {
            return ((this.agentexp.exec(agent) || [])[1] || '').toLowerCase();
        }
};
