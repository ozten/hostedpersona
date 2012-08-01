var config = require('../config'),
    sechash = require('sechash');

exports.checkPassword  = function (email, password, cb) {
  var hash = config.passwd[email];
  if (hash) {
    sechash.testHash(password, hash, cb);
  } else {
    return false;
  }
};