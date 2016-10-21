
module.exports = function ( express, app ) {
  //
  // static files
  // ----------------------------------
  app.use('/src', express.static('src'));
  app.use('/public', express.static('public'));
};