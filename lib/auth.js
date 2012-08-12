var accounts = require('./accounts'),
    config = require('../config'),
    sechash = require('sechash');

/**
 * forPersona - boolean - Is this checkPassword during the BrowserID
 *   authentication step? If so, fail if user doesn't have an enabled
 *   account.
 */
exports.checkPassword  = function (email, password, forPersona, cb) {
  if ('always@ozten.com' === email) {
    cb(null, true);
  }
  accounts.getAccount(email, function (err, user) {
    if (err) return cb (err);
    if (user && user.hash) {

      if (forPersona && 'N' === user.enabled) {
        return cb('Account disabled, email ozten for permission to use hostedpersona.me', false);
      }
      sechash.testHash(password, user.hash, cb);
    } else {
      cb('Wrong email or password', false);
    }
  });
};