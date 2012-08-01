var auth = require('../lib/auth'),
    config = require('../config'),
    fs = require('fs'),
    path = require('path');

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

/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index');
};

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

exports.generateCertificate = function (req, res) {

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
    auth.checkPassword(email, password, function (err, authed) {
      if (err) {
        res.send('Error checking password', 500);
      } else if (authed) {
         res.send('OK');
      } else {
        res.send('nope', 401);
      }
    });
  } else {
    res.send('Missing email / password', 400);
  }
};