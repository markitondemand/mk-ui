
module.exports = function ( express, app ) {

  //
  // home
  // ---------------------------------
  app.get('/', function (req, res) {
    res.render('index', {
    	title: 'Base Component'
    });
  });

  app.get('/loader', function (req, res) {
    res.render('loader', {
      title: 'Loader'
    });
  });

  app.get('/selectmenu', function (req, res) {
    res.render('selectmenu', {
      title: 'Selectmenu'
    });
  });

  app.get('/datepicker', function (req, res) {
    res.render('datepicker', {
      title: 'Datepicker'
    });
  });

};