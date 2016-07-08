﻿
!function ($) {

	'use strict';

	$.Mk.create('Publisher', $.Mk.EventEmitter, {

		_subscribers: null,

		_get: function _get(key) {

			this._subscribers = this._subscribers || {};

			if (this._subscribers.hasOwnProperty(key)) {
				return this._subscribers[key];
			}
			return null;
		},

		subscribe: function subscribe(key, o) {

			if (this._get(key) === null) {

				o.publisher = this;
				this._subscribers[key] = o;
			}
			return this._subscribers[key];
		},

		unsubscribe: function unsubscribe(key) {

			var o = this._get(key);

			if (o !== null) {
				this._subscribers[key] = undefined;
			}
			return o;
		},

		has: function has(key) {
			return this._get(key) !== null;
		},

		get: function get(key) {
			return this._get(key);
		}
	});

  $.Mk.create('Subscriber', $.Mk.EventEmitter, {

    on: function on(e, handler, context) {
      this.publisher.on(e, handler, context);
      return this;
    },

    one: function one(e, handler, context) {
      this.publisher.one(e, handler, context);
      return this;
    },

    off: function off(e, handler) {
      this.publisher.off(e, handler);
      return this;
    },

    emit: function emit() {
      this.publisher.emit.apply(
        this.publisher, this._arguments(arguments));
      return this;
    }
  });

}(window.jQuery);
