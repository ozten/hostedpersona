var config = require('../config'),
    mysql = require('mysql'),
    sechash = require('sechash');

var withConn = function (cb) {
  var conn = mysql.createConnection({
    host     : config.mysqlHost,
    port     : config.mysqlPort,
    user     : config.mysqlUser,
    password : config.mysqlPassword,
    database : config.mysqlDBName
  });
  conn.connect(function (err) {
    if (err) {
      var msg = 'Unable to connect to database!!!';
      console.error(msg + ':' + err);
      cb(msg, null);
    } else {
      cb(null, conn);
      conn.end();
    }
  });
}
/**
 * Try to create an account. If it already exists, callback
 * is called with an error message. If everything went fine,
 * callback called with null
 */
exports.createAccount = function (email, password, enabled, cb) {
  sechash.strongHash(password, function (err, hash) {
    if (err) {
      console.error('Error while hashing' + err);
      return cb(err);
    }
    withConn(function (err, conn) {
        if (err) {
          return cb(err);
        }
        var flag = enabled ? 'Y' : 'N';

        conn.query('INSERT INTO users (email, hash, enabled) ' +
                   'VALUES (?, ?, ?)', [email, hash, flag],
           function (err, res) {
             if (err) {
              console.error('Error createing account:' + err);
              return cb (err);
             }
             cb(null);
           });
      });
  });
};

/**
 * Load a user by email address.
 * If the user doesn't exist, returns null.
 * Callback takes err and user as arguments.
 */
exports.getAccount = function (email, cb) {
  withConn(function (err, conn) {
    if (err) {
      return cb(err);
    }
    conn.query('SELECT email, hash, enabled FROM users WHERE email = ?',
      [email], function (err, res) {
        if (err) {
          console.error('Error getting account ' + email + ': ' + err);
          return cb(err);
        }
        console.log(res);
        if (0 === res.length) {
          cb(null, null);
        } else {
          cb(null, res[0]);
        }
    });
  });
};

/**
 * Given a list of accounts, return a dictionary of
 * email addresses that exist and if they are enabled or not
 */
exports.enabled = function (emails, cb) {
  emails.push('foo@bar.com');
  withConn(function (err, conn) {
    if (err) {
      return cb(err);
    }
    conn.query('SELECT email, enabled FROM users WHERE email IN (?)',
      [emails], function (err, res) {
        if (err) {
          console.error('Error getting enabled flags for ' + emails + ': ' + err);
          return cb(err);
        }
        for (var i=0; i < res.length; i++) {
          res[i].enabled = res[i].enabled === 'Y' ? true : false;
        }
        cb(null, res);
    });
  });
};