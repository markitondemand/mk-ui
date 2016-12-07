
Mk.prototype = {
    /*
        <property:name>
            <desc>Unique name used for each object derived from Mk. This name will be used in templating signatures, markup, event emitters, and selectors.</desc>
        </property:name>
    */
    name: '',

    constructor: Mk,
    /*
        <property:templates>
            <desc>Contains default templates for generating markup. See the Templates section for more details.</desc>
        </property:templates>
    */
    templates: {},
    /*
        <property:formats>
            <desc>Contains default formats for text. See the Templates section for more details.</desc>
        </property:formats>
    */
    formats: {},
    /*
    <property:config>
        <desc>Configuration object of settings built of attributes and parameters passed into each instance.</desc>
    </property:config>
    */
    config: null,
    /*
    <property:events>
        <desc>Event Emitter handlers are stored here.</desc>
    </property:events>
    */
    events: null,
    /*
    <property:root>
        <desc>The root elements passed in as the first parameter to each instance of an Mk object.</desc>
    </property:root>
    */
    root: null,
    /*
    <property:deviceExp>
        <desc>Expression used to check the user agent for device patterns.</desc>
    </property:deviceExp>
    */
    deviceExp: /(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i,

    get _pushSuper () {
        return Mk.fn.pushSuper;
    },

    get _popSuper () {
        return Mk.fn.popSuper;
    },
    /*
    <property:super>
        <desc>The super is a property as well as a function. It is dynamic in that it will return you the same super method as derived method you are invoking, but in correct context. Super is also recursive and can be chained down until you reach the Core object, Mk.</desc>
    </property:super>
    */
    get super () {

        var p = this,
            c = p._chain_ || [],
            m = c[c.length - 1],
            d = c.reduce(function(a, b) {
                if (b === m) a++;
                return a;
            }, 0);

        while (d--) {
            p = p._super_.prototype;
        }

        if (p && prop.call(p, m)) {
            return p[m];
        }
        return null;
    },
    /*
    <property:keycode>
        <desc>Object containing friendly named keycodes for keyboard events.</desc>
    </property:keycode>
    */
    get keycode () {
        return Mk.fn.keycodes;
    },
    /*
    <property:transitions>
        <desc>Boolean representing if transitions are turned on or not.</desc>
    </property:transitions>
    */
    get transitions () {
        return Mk.transitions.enabled;
    },
    /*
    <property:version>
        <desc>Current version.</desc>
    </property:version>
    */
    get version () {
        return 'v1.0.0';
    },
    /*
    <property:element>
        <desc>The root as a raw Node.</desc>
    </property:element>
    */
    get element () {
        return this.root[0];
    },
    /*
    <property:device>
        <desc>Returns device API. See Device for more details.</desc>
    </property:device>
    */
    get device () {
        return this.deviceExp.test(navigator.userAgent);
    },
    /*
    <property:devicekey>
        <desc>Key pulled from user agent for general device name checking (iphone, android, ipad, etc).</desc>
    </property:devicekey>
    */
    get devicekey () {

        var ua = navigator.userAgent,
            match = (this.deviceExp.exec(ua) || [])[1] || '';

        return match.toLowerCase();
    },
    /*
    <method:$>
        <invoke>.$(selector, context)</invoke>
        <param:selector>
            <type>Mixed - String/Node/NodeList/Wrapper</type>
            <desc>A selector, Node, NodeList, or wrapped ($) node.</desc>
        </param:selector>
        <param:context>
            <type>Mixed - String/Node/Wrapper</type>
            <desc>A parent selector, node, or wrapped ($) node.</desc>
        </param:context>
        <desc>Custom Mk DOM manipulation wrapper. Think minimalistic jQuery.</desc>
    </method:$>
    */
    $: function (selector, context) {
        return Mk.$(selector, context);
    },
    /*
    <method:uid>
        <invoke>.uid()</invoke>
        <desc>Generates a unique id.</desc>
    </method:uid>
    */
    uid: function () {
        return Mk.fn.uid();
    },
    /*
    <method:template>
        <invoke>.template(name, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the template.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to template parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured tempates and returns parse string.</desc>
    </method:template>
    */
    template: function (name, data) {
        return Mk.fn.template.parse(
            name, this.name, this.config.templates, data);
    },
    /*
    <method:format>
        <invoke>.format(name, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the format.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to format parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured formats and returns parse string.</desc>
    </method:format>
    */
    format: function (name, data) {
        return Mk.fn.template.parse(
            name, this.name, this.config.formats, data);
    },
    /*
    <method:html>
        <invoke>.html(template, data)</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of the template.</desc>
        </param:name>
        <param:data>
            <type>Object</type>
            <desc>Data Object given to template parser.</desc>
        </param:data>
        <desc>Invokes the Template Engine using the configured templates and returns a wrapped ($) Node/DocumentFragment.</desc>
    </method:html>
    */
    html: function (templateOrMarkup, data) {
        return this.$(this.template(templateOrMarkup, data));
    },
    /*
    <method:each>
        <invoke>.each(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loops objects and array-like objects running a function on each iteration. Return false to break loop. Return -1 to splice/delete item from object.</desc>
    </method:each>
    */
    each: function (o, f) {
        return Mk.fn.each(this, o, f);
    },
    /*
    <method:first>
        <invoke>.first(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loops objects and array-like objects running a function on each iteration. The first value to be returned will stop loop and assign from callback.</desc>
    </method:first>
    */
    first: function (o, f) {
        return Mk.fn.first(this, o, f);
    },
    /*
    <method:map>
        <invoke>.map(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loop objects and array-like objects and return a value on each iteraction to be 'mapped' to a new object (like Array's map). Return nothing, or undefined, to exclude adding anything for that iteration.</desc>
    </method:map>
    */
    map: function (o, f) {
        return Mk.fn.map(this, o, f);
    },
    /*
    <method:filter>
        <invoke>.filter(who, fn)</invoke>
        <param:who>
            <type>Mixed</type>
            <desc>Object or Array-like object to iterate over.</desc>
        </param:who>
        <param:fn>
            <type>Function</type>
            <desc>Callback function run on each iteration.</desc>
        </param:fn>
        <desc>Loop objects and array-like objects and return true or false to specify whether to filter the element out of the new return object. (like Array's filter).</desc>
    </method:filter>
    */
    filter: function (o, f) {
        return Mk.fn.filter(this, o, f);
    },
    /*
    <method:node>
        <invoke>.node(selector[, context])</invoke>
        <param:selector>
            <type>String</type>
            <desc>A selector to be run through the selector() prefixer.</desc>
        </param:selector>
        <param:context>
            <type>Mixed</type>
            <desc>Selector/Node/Wrapped ($) Node to be used as context element. Default is root.</desc>
        </param:context>
        <desc>Shadow nodes created by Mk components have prefixed names. This method runs your selector through the prefixed name and root context to easily find your element.</desc>
    </method:node>
    */
    node: function (selector, context) {
        return this.$(this.selector(selector), context || this.root || null);
    },
    /*
    <method:selector>
        <invoke>.selector(name)</invoke>
        <param:key>
            <type>String</type>
            <desc>A selector to be prefixed with component naming.</desc>
        </param:key>
        <desc>Takes a base string selector (ie: 'list') and returns the component's true selector (ie: mk-core-list).</desc>
    </method:selector>
    */
    selector: function (key) {
        return '.' + this.name + (key && '-' + key || '');
    },
    /*
    <method:transition>
        <invoke>.transition(node, handler)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node to bind transition event handler on.</desc>
        </param:node>
        <param:handler>
            <type>Function</type>
            <desc>Event handler to be bound.</desc>
        </param:handler>
        <desc>Binds transition event to a node(s). If transitions are disabled, or not supported, handler is executed in setTimeout (1 millisecond).</desc>
    </method:transition>
    */
    transition: function (node, cb) {

        var  n = this.$(node),
             t = Mk.transitions.key,
             c = this;

        if (t) {

            n.addClass('transition');
            n.one(t, function (e) {
                n.removeClass('transition');
                cb.call(c, e, n);
            });

            return this;
        }

        n.removeClass('transition');

        return this.each(n, function (el) {
            this.delay(function () {
                cb.call(this, null, this.$(el));
            }, 1);
        });
    },
    /*
    <method:clearTransitions>
        <invoke>.clearTransitions(node)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node to bind transition event handler on.</desc>
        </param:node>
        <desc>Clear transition handlers on node.</desc>
    </method:clearTransitions>
    */
    clearTransitions: function (node) {

        var t = Mk.transitions.key;

        if (t) {
            this.$(node).off(t).removeClass('transition');
        }
        return this;
    },
    /*
    <method:transitioning>
        <invoke>.transitioning(node)</invoke>
        <param:node>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node.</desc>
        </param:node>
        <desc>Returns true if element is currently transitioning. False for anything else.</desc>
    </method:clearTransitions>
    */
    transitioning: function (node) {
        return this.$(node).hasClass('transition');
    },
    /*
    <method:delay>
        <invoke>.delay(fn[, milliseconds])</invoke>
        <param:fn>
            <type>Function</type>
            <desc>Function to be invoked when delay ends.</desc>
        </param:fn>
        <param:milliseconds>
            <type>Number</type>
            <desc>Number of milliseconds for the timer. Default is 1.</desc>
        </param:milliseconds>
        <desc>Runs a timer on invoking a function. Useful for rendering race conditions and transition effects. For rendering race conditions, no milliseconds are necessary as the default (1) handles that.</desc>
    </method:delay>
    */
    delay: function (fn, ms) {

        var c = this, t;

        t = setTimeout(function () {

            fn.call(c);

            clearTimeout(t);
            t = null;

        }, ms || 1);

        return t;
    },
    /*
    <method:on>
        <invoke>.on(event, handler)</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Handler to invoke when event type has been emit.</desc>
        </param:handler>
        <desc>Binds a handler to an event type through the Event Emitter. Allows for namespaced events.</desc>
    </method:on>
    */
    on: function (type, handler) {

        Mk.fn.eventEmitter.on({
            bucket: this.events,
            type: type,
            handler: handler,
            context: this
        });

        return this;
    },
    /*
    <method:one>
        <invoke>.one(event, handler)</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Handler to invoke when event type has been emit.</desc>
        </param:handler>
        <desc>Binds a handler to an event type through the Event Emitter. Once fired, an event bound through one() will be removed. Allows for namespaced events.</desc>
    </method:one>
    */
    one: function (type, handler) {

        Mk.fn.eventEmitter.one({
            bucket: this.events,
            type: type,
            handler: handler,
            context: this
        });

        return this;
    },
    /*
    <method:off>
        <invoke>.off(event[, handler])</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:handler>
            <type>Function</type>
            <desc>Optional handler to remove. Defaults to remove all handlers for event type.</desc>
        </param:handler>
        <desc>Removes a handler (or all handlers) from an event type.</desc>
    </method:off>
    */
    off: function (type, handler) {

        Mk.fn.eventEmitter.off({
            bucket: this.events,
            type: type,
            handler: handler
        });

        return this;
    },
    /*
    <method:emit>
        <invoke>.emit(event[, argument1, arguments2, ...])</invoke>
        <param:event>
            <type>String</type>
            <desc>Event type</desc>
        </param:event>
        <param:arguments>
            <type>Mixed</type>
            <desc>Any other arguments passed through emit will be applied to the handlers invoked on the event.</desc>
        </param:arguments>
        <desc>Invokes handler(s) bound to event type.</desc>
    </method:emit>
    */
    emit: function (type /*, arguments */) {

        Mk.fn.eventEmitter.emit(this.events, arguments);
        return this;
    },
    /*
    <method:unmount>
        <invoke>.unmount()</invoke>
        <desc>Specialized method used for performance benefits with SPA frameworks. Frameworks like Angular and React use different methods to remove dom nodes and events bound to the app. In your unmount/teardown handlers, you may call this method to remove dom elements, data, and events bound through Mk[ui] freeing up memory and space.</desc>
    </method:unmount>
    */
    unmount: function () {
        /* to be populated by each individual component */
    },
    /*
    <method:_init>
        <invoke>._init(root[, config])</invoke>
        <param:root>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node set to be the root.</desc>
        </param:root>
        <param:config>
            <type>Object</type>
            <desc>Configuration object passed into an instance as settings.</desc>
        </param:config>
        <desc>Internal, private, method used as a contructor. Useful when building your own custom components. Invoked internally only.</desc>
    </method:_init>
    */
    _init: function (r, o) {

        // define properties such as:
        // templates, formats, name, etc.
        this._define(r, o);

        //build markup or invoke logic
        this._build();

        //bind events, hooks, messages, etc.
        this._bind();
    },
    /*
    <method:_define>
        <invoke>._define(root[, config])</invoke>
        <param:root>
            <type>Mixed</type>
            <desc>A Selector/Node/Wrapped ($) Node set to be the root.</desc>
        </param:root>
        <param:config>
            <type>Object</type>
            <desc>Configuration object passed into an instance as settings.</desc>
        </param:config>
        <desc>A setup function called by _init. This initializes the root, events, config object, formats, templates, etc. Invoked internally only.</desc>
    </method:_define>
    */
    _define: function (r, o) {

        this.root = this.$(r);

        this.events = {};

        this.config = {
            templates: {},
            formats: {},
            events: {}
        };

        this.each(this.formats, function (v, n) {
            this.config.formats[ n ] = v;
        });

        this.each(this.templates, function (v, n) {
            this.config.templates[ n ] = v;
        });

        this._config(o);

        return this;
    },
    /*
    <method:_config>
        <invoke>._config(object)</invoke>
        <param:object>
            <type>Object</type>
            <desc>An object of end developer settings passed in and added to the config property.</desc>
        </param:object>
        <desc>Internal method, invoked by _init, responsible for setting object properties onto the internal configuration object.</desc>
    </method:_config>
    */
    _config: function (o) {

        o = o || {};

        var c = this.config;
            c.events

        this.each(o, function (v, n) {

            if (n === 'events') {
                this.each(v, function (handler, type) {
                    this.on(type, handler);
                });
            }
            else if (Mk.type(v, 'object|arraylike') && prop.call(c, n)) {
                this.each(v, function (e, k) {
                    c[n][k] = e;
                });
            }
            else {
                c[n] = v;
            }
        });

        return this;
    },
    /*
    <method:_param>
        <invoke>._param(name, type, config, default[, node])</invoke>
        <param:name>
            <type>String</type>
            <desc>Name of config property.</desc>
        </param:name>
        <param:type>
            <type>String</type>
            <desc>Type to case value to.</desc>
        </param:type>
        <param:config>
            <type>Object</type>
            <desc>Object to set result value on.</desc>
        </param:config>
        <param:default>
            <type>Mixed</type>
            <desc>Default value to set if no value is found through all other means.</desc>
        </param:default>
        <param:node>
            <type>Wrapped Node ($)</type>
            <desc>Optional Node to search for configurations on. Default is root.</desc>
        </param:node>
        <desc>Runs logic to find a configuration setting. It will first look to see if the value lives on config already. If not, it will check for the value on the node (or root if no node is specified). Lastly, it will type case the value based on the type specified. The final result will be set on the config object passed in.</desc>
    </method:_param>
    */
    _param: function (n, ty, o, d, el) {

        var v, t;

        if (prop.call(o, n)) {
            return v = o[n];
        }

        v = this.$(el || this.root).data(n);

        if (v === undefined && ty !== 'undefined' || v === null) {
            v = d;
        }

        t = typeof(v);

        if (t !== ty) {

            switch(ty) {

                case 'boolean':
                    v = v === 'true' || false;
                    break;

                case 'number':
                    v = parseFloat(v, 10);
                    break;

                case 'string':
                    v = v + '';

                case 'undefined':
                    v = d;
                    break;

                case 'object':
                    v = v === null
                        ? d : v;
                    break;
            }
        }

        o[n] = v;

        return this;
    },
    /*
    <method:_build>
        <invoke>._build()</invoke>
        <desc>Internal Placeholder method for building the components UI. Invoked internally by _init.</desc>
    </method:_build>
    */
    _build: function () {},
    /*
    <method:_bind>
        <invoke>._bind()</invoke>
        <desc>Internal Placeholder method for binding the components UI events. Invoked internally by _init.</desc>
    </method:_bind>
    */
    _bind: function () {}
};
