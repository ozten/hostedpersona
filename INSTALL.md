# INSTALL #

* Install [Node.js](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
* Install [BrowserID Certifier](https://github.com/mozilla/browserid-certifier)
* `mkdir var`
* `cp ${BROWSERID-CERTIFER}/var/key.publickey var/`
* `cp config.dist config.js`
** Make sure `certifierPort` matches the Certifier's port number
* Install MySQL and create a database (see db_ddl/schema_000.sql)
** run all remaining sql `mysql -u foo -ppassword -D 'hostedpersona.me' < db_ddl/schema_001.sql`
* `npm start`