
require('rootpath')()

var docBuilder = require('src/node/doc-builder');

module.exports = function ( express, app ) {

  //
  // home
  // ---------------------------------
  app.get('/', function (req, res) {
    res.render('index', {
    	title: 'Core'
    });
  });

  app.get('/loader', function (req, res) {
    res.render('loader', {
      title: 'Loader'
    });
  });

  app.get('/selectmenu', function (req, res) {

    docBuilder.parse('js/selectmenu.js', function (data) {
        data.title = 'Selectmenu';
        res.render('selectmenu', data);
    });
  });

  app.get('/autocomplete', function (req, res) {

    docBuilder.parse('js/autocomplete.js', function (data) {
        data.title = 'Autocomplete';
        res.render('autocomplete', data);
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
