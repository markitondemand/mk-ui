/*
	<file:js>
		<src>dist/js/core.js</src>
	</file:js>
*/
(function (root, factory) {

	if ( typeof define === 'function' && define.amd ) {
		define('mk', [], function () {
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

	var noop = function () {},
		hasOwn = {}.hasOwnProperty,
		undf = void+1;

	function Mk () {}
