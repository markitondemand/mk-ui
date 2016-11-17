/*
	<file:js>
		<src>dist/js/core.js</src>
	</file:js>
*/
(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( [ 'jquery' ], function ( $ ) {
			// assign to root in case there are global non-amd scripts on the page,
			// which use Mk
			return (root.Mk = factory( root, $ ));
		});
	}
	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {

		module.exports = root.document ?

			factory( root, require( 'jquery' ) ) :

			function( w ) {
				if ( !w.document ) {
					throw new Error( "Mk requires a window with a document" );
				}
				return factory( w, require( 'jquery' ) );
			};
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		root.Mk = factory( root, root.jQuery );
	}

})( typeof window !== "undefined" ? window : this, function (root, $) {

	var noop = function () {},
		hasOwn = {}.hasOwnProperty,
		undf = void+1;

	function Mk () {}

	Mk.noop = function () {};
