
var statics = require('./static'),
  pages = require('./pages'), 
  errors = require('./errors');

module.exports = function ( express, app ) {

  //
  // load static directories
  // --------------------------
  statics(express, app);

  //
  // load pages
  // ---------------------------
  pages(express, app);

  //
  // load errors
  // ---------------------------
  errors(express, app);
};