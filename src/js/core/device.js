
//
// simple device checking
//

var agent = navigator.userAgent,
    agentExp = /(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i;

Mk.device = {

    get is () {
        return agentExp.test(agent);
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
        return ((agentExp.exec(agent) || [])[1] || '').toLowerCase();
    }
};
