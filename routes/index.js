var config = require('../config'),
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
  })
};

exports.generateCertificate = function (req, res) {

}

exports.authentication = function (req, res) {

};