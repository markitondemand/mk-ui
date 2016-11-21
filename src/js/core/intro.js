/*
	<file:js>
		<src>dist/js/core.js</src>
	</file:js>
*/
(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define([], function () {
			return (root.Mk = factory(root));
		});
	}
	else if (typeof module === 'object' && module.exports) {

		module.exports = root.document ?

			factory(root) :

			function (w) {
				if (!w.document) {
					throw new Error('Mk[ui] requires a window with a document');
				}
				return factory(w);
			};
	}
	else {
		root.Mk = factory(root);
	}

})(typeof window !== 'undefined' && window || this, function (root) {

'use strict';

var prop = ({}).hasOwnProperty;

function Mk () {}

Mk.$ = function (s, c) {
	return root.jQuery(s, c);
};
