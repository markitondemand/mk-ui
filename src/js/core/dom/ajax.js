
Dom.ajax = function (o) {
    return new this.xhr(o);
}

Dom.xhr = function (o) {
    this.init(o);
}

Dom.xhr.prototype = {

    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    },

    xhr: null,

    open: false,

    options: null,

    url: function (u) {

        u = (u || location.href);

        var t = u.lastIndexOf('/');

        if (t > -1 && (t = u.indexOf('#')) > -1) {
            u = u.substr(0, t)
        }
        return u;
    },

    qs: function (o) {

        o = o || '';

        if (!type(o, 'string')) {
            return Mk.fn.map(this, o, function(v, n) {
                return n + '=' + encodeURIComponent(v);
            }).join('&');
        }
        return o;
    },

    init: function (o) {

        o = o || {};

        o.url = this.url(o.url);
        o.data = this.qs(o.data);
        o.method = (o.method || 'GET').toUpperCase();
        o.type = o.type || 'text';
        o.headers = o.headers || {};
        o.async = o.async || true;
        o.encode = o.encode || true;
        o.encoding = o.encoding || 'utf-8';
        o.user = o.user || '';
        o.password = o.password || '';

        // callbacks
        o.complete = o.complete || noop;
        o.success = o.success || noop;
        o.error = o.error || noop;

        if (o.data && o.method === 'GET') {
            o.url  = o.url.indexOf('?') > -1 && o.url || o.url + '?';
            o.url += o.data;
            o.data = null;
        }

        Mk.fn.each(this, this.headers, function (v, n) {
            if (prop.call(o.headers, n) !== true) {
                o.headers[n] = v;
            }
        });

        if (o.encode && ['POST', 'PUT'].indexOf(o.type) > -1) {
            o.headers['Content-type'] =
                'application/x-www-form-urlencoded' + o.encoding
        }

        this.options = o;

        if (o.now !== false) {
            this.send();
        }
        return this;
    },

    jsonp: function jsonp () {

        if (this.open) {
            return this;
        }

        var x = this,
            o = x.options,
            s = doc.createElement('script'),

            id = o.jsonpid = 'MKUI' + uid().split('-').join(''),
            qs = 'callback=' + id;

        s.type = 'text/javascript';
        s.language = 'javascript';
        s.async = o.async;
        s.src = o.url + (o.url.indexOf('?') > -1 && '&' || '?') + qs;
        s.id = o.scriptid = uid();

        s.onerror = function () {
            o.error.call(x);
        };

        s.onload = function () {
            o.complete.call(x);
        };

        var cb = function (data) {

            x.response = data;
            x.status = 200;

            s.onload  = null;
            s.onerror = null;
            s.parentNode.removeChild(s);

            o.success.call(x, data);

            delete root[id];
        };

        root[id] = cb;

        doc.documentElement
            .firstChild.appendChild(s);

        this.open = true;
        this.status = 0;

        return this;
    },

    send: function () {

        if (this.open) {
            return this;
        }

        var x = this,
            o = x.options,
            xhr;

        if (o.type === 'jsonp') {
            return this.jsonp();
        }

        xhr = this.xhr = new XMLHttpRequest();

        xhr.open(o.method, o.url, o.async, o.user, o.password);
        xhr.onreadystatechange = function () {
            x.stateChange();
        };

        if (o.user && 'withCredentials' in xhr) {
            xhr.withCredentials = true;
        }

        Mk.fn.each(this, o.headers, function (v, n) {
            xhr.setRequestHeader(n, v);
        });

        if (o.type && o.type !== 'text') {
            xhr.responseType = o.type;
        }

        x.open = true;
        x.status = 0;

        xhr.send(o.data);

        if (o.async !== true) {
            this.stateChange();
        }
        return this;
    },

    abort: function () {

        this.open = false;
        this.status = 0;

        if (this.xhr) {
            this.xhr.abort();
            this.xhr.onreadystatechange = null;
            this.xhr = null;
            return this;
        }

        var x = this,
            o = x.options,
            s = doc.getElementById(o.scriptid),
            id = o.jsonpid;

        if (s) {
            s.parentNode.removeChild(s);
        }

        root[id] = function () {
            delete root[id];
        };

        root[id]();

        return this;
    },

    stateChange: function () {

        var xhr = this.xhr,
            x = this,
            o = x.options;

        if (xhr.readyState !== 4) {
            return;
        }

        o.complete.call(x, xhr);

        x.status = xhr.status;
        x.statusText = xhr.statusText;

        if (x.status === 1223) {
            x.status = 204;
            x.statusText = 'No Content';
        }

        x.open = false;
        x.response = xhr.response || null;

        if (xhr.responseType === '' || xhr.responseType === 'text') {
            x.response = xhr.responseText;
        }

        xhr.onreadystatechange = function () {};

        if (x.status >= 200 && x.status < 300) {
            o.success.call(x, x.response, xhr);
        } else {
            o.error.call(x, xhr);
        }
    }
};
