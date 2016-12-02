
module.exports = function (express, app, dir) {

  //
  // set templating system
  // ----------------------------------
  app.set('views', dir + '/docs/views');
  app.set('view engine', 'pug');
};
