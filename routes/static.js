
module.exports = function ( express, app ) {
  //
  // static files
  // ----------------------------------
  app.use('/dist', express.static('dist'));
  app.use('/src',  express.static('src'));

  //used to test static-site build
  //app.use('/docs', express.static('docs'));

  // real use case
  app.use('/docs/assets', express.static('docs/assets'));
  app.use('/docs/views', express.static('docs/views'));
};
