/*
	<file:js>
		<src>dist/js/core.js</src>
	</file:js>
*/
(function (root, factory) {

	if (typeof define === "function" && define.amd) {
		define(['jquery'], function (jq) {
			return (root.Mk = factory(root, jq));
		});
	}
	else if (typeof module === "object" && module.exports) {

		module.exports = root.document ?

			factory(root, require('jquery')) :

			function (w) {
				if (!w.document) {
					throw new Error("Mk[ui] requires a window with a document");
				}
				return factory(w, require('jquery'));
			};
	}
	else {
		root.Mk = factory(root, window.jQuery);
	}

})(typeof window !== "undefined" && window || this, function (root, dom) {

"use strict";

var prop = ({}).hasOwnProperty;

var noop = function () {};

var Mk = function () {};

Mk.fn = {};

//Mk.$ = dom;
