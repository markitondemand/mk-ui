
var express = require('express'),
	middleware = require('./middleware/middleware'),
	routes = require('./routes/routes'),
	app = express();

middleware(express, app, __dirname);

routes(express, app);

app.listen(3000, function () {
  console.log('Application started');
});