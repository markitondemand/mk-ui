
!function ($) {

	//
	// EventEmitter
	// ---------------------------------------

	$.Mk.create('EventEmitter', {

		_regname: /^(\w+)\.?/,
		_regns: /^\w+(\.?.*)$/,

		_events: null,

		_event: function _event(e) {

			this._events = this._events || {};

			return {
				name: this._regname.exec(e)[1] || '',
				ns: (this._regns.exec(e) || [])[1] || undefined
			};
		},

		//
		// args
		// arguments -> array without leaking
		// -------------------------------------

		_arguments:	function _arguments(args) {
		    for(var i = 0, a = [], l = args.length;
					i < l && a.push(args[i]);
					i++) { }
		    return a;
		},

		_add: function _add(e, handler, context, single) {

			var event = this._event(e);

			if (this._events.hasOwnProperty(event.name) !== true) {
				this._events[event.name] = [];
			}

			this._events[event.name].push({
				ns: event.ns || undefined,
				handler: handler || $.noop,
				context: context || null,
				single: single === true
			});

			return this;
		},

		on: function on(e, handler, context) {
			return this._add(e, handler, context, false);
		},

		one: function(e, handler, context) {
			return this._add(e, handler, context, true);
		},

		off: function off(e, handler) {

			var event = this._event(e),
				bucket,	item,	ns;

			if (this._events.hasOwnProperty(event.name)) {

				bucket = this._events[event.name];
				ns = event.ns || undefined;

				for (var i = 0, l = bucket.length; i < l; i++) {
					item = bucket[i];

					if (item.ns === ns) {
						bucket.splice(i, 1);
						l = bucket.length;
						i--;
					}
				}
			}
			return this;
		},

		emit: function emit(e /*, */) {

			var event = this._event(e),
				bucket, item, args;

			if (this._events.hasOwnProperty(event.name)) {

				bucket = this._events[event.name];
				args = this._arguments(arguments);
				args.shift();

				for (var i = 0, l = bucket.length; i < l; i++) {

					item = bucket[i];

					if (!event.ns || item.ns === event.ns) {
						item.handler.apply(item.context || this, args);

						if (event.single) {
							bucket.splice(i, 1);
							l = bucket.length;
							i--;
						}
					}
				}
			}
			return this;
		}
	});

}(window.jQuery);
