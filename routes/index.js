var auth = require('../lib/auth'),
    certify = require('../lib/certifier'),
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
    auth.checkPassword(email, password, function (err, authed) {
      if (err) {
        res.send('Error checking password', 500);
      } else if (authed) {

        emails = [];
        if (req.session && req.session.emails) {
          console.log('Sure, we have a session', req.session);
          emails = req.session.emails;
        }
        emails.push(email);
        req.session.emails = emails;
        res.send('OK');

      } else {
        res.send('nope', 401);
      }
    });
  } else {
    res.send('Missing email / password', 400);
  }
};

exports.logout = function (req, res) {
  req.session.reset();
  res.send('Bye');
};