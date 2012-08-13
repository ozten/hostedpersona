var accounts = require('../lib/accounts'),
    auth = require('../lib/auth'),
    certify = require('../lib/certifier'),
    config = require('../config'),
    fs = require('fs'),
    libravatar = require('libravatar'),
    path = require('path'),
    verify = require('../lib/verify');

var publicKey;

// When module is loaded, put public key into memory
var publicKeyPath = path.resolve(__dirname, '..', 'var', 'key.publickey');
console.log('Loading', publicKeyPath);
fs.readFile(publicKeyPath, 'utf8', function (err, data) {
  if (err) {
    console.error('Unable to read ' + publicKeyPath +
      ' please setup the Certifier and copy the public key.');
    process.exit(1);
  } else {
    console.log(data);
    publicKey = data;
  }
});

/************ BrowserID routes **************/

exports.wellKnown = function (req, res) {
  if (publicKey) {
    res.setHeader('Content-Type', 'application/json');
    res.render('well-known', {publicKey: publicKey})
  } else {
    res.send('Loading public key', 500);
  }
}

exports.provisioning = function (req, res) {
  emails = [];
  if (req.session && req.session.emails) {
    console.log('Sure, we have a session', req.session);
    emails = req.session.emails;
  }
  res.render('provisioning', {
    browserid_server: config.personaBaseUrl,
    emails: emails,
    num_emails: emails.length
  });
};

  var cryptoError = function (res) {
    res.writeHead(500);
    res.end();
    return false;
  };

exports.generateCertificate = function (req, res) {
  var authed_email = req.body.authed_email;

  if (!req.session.emails ||
      -1 === req.session.emails.indexOf(authed_email)) {
    res.writeHead(401);
    return res.end();
  }

  if (!req.body.pubkey || !req.body.duration) {
    res.writeHead(400);
    return res.end();
  }

  var certified_cb = function(err, cert) {
    var user_cert = cert,
    certificate;

    if (err) {
      return cryptoError(res);
    } else {
      try {
        var certResp = JSON.parse(cert);
        if (certResp && certResp.success) {
          // Kill Session Issue #62
          req.session.reset();
          res.json({ cert: certResp.certificate });
        } else {
          console.error('certifier expected success: true, but got ', cert);
          return cryptoError(res);
        }

      } catch (e) {
        console.error('Bad output from certifier');
        if (e.stack) console.error(e.stack);
        return cryptoError(res);
      }
    }
  };

  certify(req.body.pubkey,
          authed_email,
          req.body.duration,
          certified_cb);
}

exports.authentication = function (req, res) {
  res.render('authentication', {
    browserid_server: config.personaBaseUrl
  });
};

exports.auth = function (req, res) {
  if (req.body.email && req.body.password) {
    var email = req.body.email,
        password = req.body.password;
    _commonAuth(email, password, true, function (err, authed) {
      if (err) {
        console.log('AUTH Error: ', err, ' for ', email);
        res.send('Error checking password', 500);
      } else if (authed) {
        console.log('AUTH Success');
        _commonSession(email, req);
        res.send('OK');
      } else {
        console.log('AUTH FAILED');
        res.send('nope', 401);
      }
    });
  } else {
    res.send('Missing email / password', 400);
  }
};

_commonAuth = function (email, password, forPersona, cb) {
  auth.checkPassword(email, password, forPersona, function (err, authed) {
    console.log('_commonAuth callback err=', err, 'authed=', authed);
    if (err) {
      console.error(err);
      cb(err, false);
    } else {
      cb(null, authed);
    }
  });
};

_commonSession = function (email, req) {
  emails = [];
  if (req.session && req.session.emails) {
    emails = req.session.emails;
  }
  emails.push(email);
  req.session.emails = emails;
};

/**************** General Routes *************/

/*
 * GET home page.
 */
exports.index = function(req, res) {
  var ctx = {
    content: 'pages/homepage'
  };
  res.render('account_layout', ctx);
};

exports.logout = function (req, res) {
  req.session.reset();
  res.redirect('https://hostedpersona.me/account');
};

exports.register = function (req, res) {
  var ctx = {
    content: 'pages/register',
    errors: {},
    data: {email: '', password: '', password2: ''}
  };
  res.render('account_layout', ctx);
};

exports.registerAccount = function (req, res) {
  /*
    1) verify email is email-like
    2) verify passwords match
    3) verify account doesn't exist
    4) create account
    5) SUCCESS - redirect to account
  */
  var emailError = verify.email(req.body.email);
  var data = req.body;
  var ctx = {
    content: 'pages/register',
    errors: {},
    data: data
  };
  if (emailError) {
    ctx.errors.email = emailError;
    return res.render('account_layout', ctx);
  };

  var passError = verify.password(req.body.password,
                                  req.body.password2);
  if (passError) {
    ctx.errors.email = passError;
    return res.render('account_layout', ctx);
  }
  accounts.createAccount(req.body.email, req.body.password, false, function (err) {
    if (err) {
      ctx.errors.email = err;
      return res.render('account_layout', ctx);
    }
    res.redirect('https://hostedpersona.me/account');
  });
};

exports.account = function (req, res) {
  var ctx = {
    content: 'pages/accounts'
  };
  if (req.session && req.session.emails) {
    ctx.title = 'My Accounts';
    accounts.enabled(req.session.emails, function (err, accounts) {
      if (err) {
        ctx.accounts = [];
      } else {
        ctx.accounts = accounts;
      }
      return res.render('account_layout', ctx);
    });
  } else {
    var ctx = {
      content: 'pages/account_login',
      errors: {},
      data: {email: '', password: ''}
    };
    return res.render('account_layout', ctx);
  }
};

exports.accountLogin = function (req, res) {
  var email = req.body.email,
      password = req.body.password;
  var ctx = {
    content: 'pages/account_login',
    errors: {},
    data: {email: '', password: ''}
  };
  _commonAuth(email, password, false, function (err, authed) {
    ctx.data = req.body;
    if (err) {
      console.error("Error duing account login:" + err);
      ctx.errors.general = 'System Error, please try again later',

      res.render('account_layout', ctx);
    } else if (authed) {
      _commonSession(req.body.email, req);
      res.redirect('/account');
    } else {
      ctx.errors.general = 'Wrong email or password.';
      res.render('account_layout', ctx);
    }
  });
};

exports.avatar = function (req, res) {
  libravatar.url({
    email: req.params.email,
    size: 120
  }, function (err, url) {
    if (err) {
      res.send('Ouch', 400);
    } else {
      res.send(url);
    }
  });

};