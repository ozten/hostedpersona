# Hosted Persona

This Node.js express app is a Persona IdP for delegated domains.

One runs this under https (I run mine at
[https://hostedpersona.me](https://hostedpersona.me)) and then
updates their personal website with a well known file to delegate
authority.

Example: My personal identity is alice@example.com

    curl https://example.com/.well-known/browserid
    { "authority": "https://hostedpersona.org" }

## Dependencies

* Node
* [Certifier](https://github.com/mozilla/browserid-certifier)

Install the Certifier per it's README. Got that up and working?

## Test Drive

    npm install
    cp config.dist config.js
    mkdir var
    cp path/to/certifier/var/key.publickey var/
    # Read config.js, read it again, okay now edit config.js
    npm start

## Status

I use this to host my Identity as well as a couple other folks.
Not the highest security in the world, but not the worst either.
