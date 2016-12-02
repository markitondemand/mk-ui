
module.exports = function ( express, app ) {
  //
  // static files
  // ----------------------------------
  app.use('/dist', express.static('dist'));
  app.use('/docs/assets/', express.static('docs/assets'));
  app.use('/docs/views', express.static('docs/views'));
  app.use('/src',  express.static('src'));
};
