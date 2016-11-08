
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

  app.get('/autocomplete', function (req, res) {
    res.render('autocomplete', {
      title: 'Autocomplete'
    });
  });

  app.get('/tooltip', function (req, res) {
    res.render('tooltip', {
      title: 'Tooltip'
    });
  });

  app.get('/dialog', function (req, res) {
    res.render('dialog', {
      title: 'Dialog'
    });
  });

};