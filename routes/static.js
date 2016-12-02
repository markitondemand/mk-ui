
module.exports = function ( express, app ) {
  //
  // static files
  // ----------------------------------
  app.use('/dist', express.static('dist'));
  app.use('/docs', express.static('docs'));
  app.use('/src',  express.static('src'));
};
