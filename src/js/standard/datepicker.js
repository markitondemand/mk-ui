(function ( root, factory ) {
	//
	// AMD support
	// ---------------------------------------------------
	if ( typeof define === 'function' && define.amd ) {

		define( [ 'mknasty' ], function ( mk ) {
			return factory( root, mk );
		});
	}
	//
	// CommonJS module support
	// -----------------------------------------------------
	else if ( typeof module === 'object' && module.exports ) {

		module.exports = factory( root, require( 'mknasty' ));
	}
	//
	// Everybody else
	// -----------------------------------------------------
	else {
		return factory( root, root.mkNasty );
	}

})( typeof window !== "undefined" ? window : this, function ( root, mk ) { 


























	mk.create('Datepicker', {

		map: {
			months: [
				'january', 'february', 'march', 'april', 'may', 'june', 'july',
				'august', 'september', 'october', 'november', 'december'
			],
			days: [
				'sunday', 'monday', 'tuesday',
				'wednesday', 'thursday', 'friday', 'saturday'
			]
		},

		formats: {
			date: 'dd/mm/yyyy',
			days: 'd',
			month: 'mmmm',
			nextMo: 'Go to next month',
			nextYr: 'Go to next year',
			prevMo: 'Go to previous month',
			prevYr: 'Go to previous year',
			caption: '{{month}} {{year}}'
		},

		templates: {

			shadow: [
				'<div class="{{$key}}-shadow">'
			]
		}
	});

	return mk.get('Datepicker');

});