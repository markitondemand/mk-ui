
module.exports = function ( express, app ) {

  //
  // 404
  // ----------------------------------
  app.use(function (req, res, next) {
  	res.status(404).render('404', {title: '400'});
  });

  //
  // 500
  // ----------------------------------
  app.use(function (req, res, next) {
  	res.status(500).render('500', {title: '500'});
  });

};
