
module.exports = function ( express, app ) {
  //
  // static files
  // ----------------------------------
  app.use('/dist', express.static('dist'));
  app.use('/app', express.static('app'));
  // TODO: remove later
  app.use('/src', express.static('src'));
};
