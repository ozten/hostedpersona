
/**
 * Module dependencies.
 */

var clientSessions = require("client-sessions"),
    config,
    express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');


process.on('uncaughtException', function (err) {
    if (err.stack) console.log('Caught exception: ' + err.stack);
    else console.log('Caught exception: ' + err);
});

try {
  config = require('./config');
} catch (e) {
  console.error(e);
  console.error('ERROR: You must copy config.dist to config.js. ' +
    'You must change all secrets and add a valid password.');
  process.exit(1);
}

var app = express.createServer();

app.configure(function(){
  //app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
    app.set('view options', {
	layout: 'layout_accounts'
});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(clientSessions({
    cookieName: 'session_state',
    secret: config.cookieSekrit,
    // true session duration:
    // will expire after duration (ms)
    // from last session.reset() or
    // initial cookieing.
    duration: config.cookieDuration
  }));

  app.use(express.csrf());
  app.use(function (req, resp, next) {
    resp.locals({'csrf_token': req.session._csrf});
    next();
  });


  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// Common template variables
app.locals({
  content: null,
  title: 'Hosted Persona',
  navigation: null
});

app.get('/.well-known/browserid', routes.wellKnown);
app.get('/provisioning', routes.provisioning);
app.post('/gen-cert', routes.generateCertificate);
app.get('/authentication', routes.authentication);
app.post('/auth', routes.auth);

app.get('/', routes.index);
app.get('/logout', routes.logout);
app.get('/register', routes.register);
app.post('/register-account', routes.registerAccount);
app.get('/account', routes.account);
app.post('/account-login', routes.accountLogin);
app.get('/avatar/:email', routes.avatar);

app.listen(config.port, function(err){
  if (err) {
    console.error(err);
  } else {
    console.log("Express server listening on port " + app.get('port'));
  }
});
