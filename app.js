
/**
 * Module dependencies.
 */

var clientSessions = require("client-sessions"),
    config = require('config'),
    express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(clientSessions({
    cookieName: 'session_state',    // defaults to session_state
    secret: 'lkasdfkjsdlfkjdsflkj', // MUST be set
    // true session duration:
    // will expire after duration (ms)
    // from last session.reset() or
    // initial cookieing.
    duration: 24 * 60 * 60 * 1000, // defaults to 1 day
  }));

  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
