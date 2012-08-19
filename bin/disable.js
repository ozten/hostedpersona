#!/usr/bin/env node
var config = require('../config'),
    enable = require('./enable'),
    mysql = require('mysql');

if (require.main === module) {
    if (2 === process.argv.length) {
      console.error('Usage: disable.js alice@example.com bob@example.com');
      process.exit(1);
    }
    enable.updateEnabled(process.argv.slice(2), false, function (err) {
        if (err) process.exit(2);
        process.exit(0);
    });
}