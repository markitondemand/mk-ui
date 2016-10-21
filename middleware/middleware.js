
var viewengine = require('./viewengine');

module.exports = function (express, app, dir) {
  //
  // template system
  // ----------------------------------
  viewengine(express, app, dir);
};