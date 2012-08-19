#!/usr/bin/env node
var config = require('../config'),
    mysql = require('mysql');

var updateEnabled;

exports.updateEnabled = updateEnabled = function (emails, flag, cb) {
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
    };

    withConn(function (err, conn) {
        if (err) {
          return cb(err);
        }
        var enabled = flag ? 'Y' : 'N';

        conn.query('UPDATE users SET enabled = ? WHERE email IN (?)', [enabled, emails],
           function (err, res) {
             if (err) {
              console.error('Error createing account:' + err);
              return cb (err);
             }
             cb(null);
           });
      });
};

if (require.main === module) {
    if (2 === process.argv.length) {
      console.error('Usage: enable.js alice@example.com bob@example.com');
      process.exit(1);
    }
    updateEnabled(process.argv.slice(2), true, function (err) {
        if (err) process.exit(2);
        process.exit(0);
    });
}


