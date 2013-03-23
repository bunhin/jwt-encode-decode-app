#!/usr/bin/env node

/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */

/**
 * Module dependencies.
 */
var express = require('express'),
    app = express(),
    crypto = require('crypto'),
    ursa = require('ursa');

/**
 * Helper functions.
 */
function base64urlUnescape(str) {
  "use strict";

  str += new Array(5 - str.length % 4).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
}

function base64urlDecode(str) {
  "use strict";

  return new Buffer(base64urlUnescape(str), 'base64').toString();
}

function base64urlEscape(str) {
  "use strict";

  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlEncode(str) {
  "use strict";

  return base64urlEscape(new Buffer(str).toString('base64'));
}

/**
 * Configure Express.
 */
app.configure(function () {
  "use strict";

  app.engine('.html', require('ejs').__express);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use(express.bodyParser());
});

/**
 * Set GET route paths.
 */

// Display home page.
app.get('/', function (req, res) {
  "use strict";

  res.render('index');
});

// Display encode JWT page.
app.get('/encode', function (req, res) {
  "use strict";

  var header = {},
      claimSet = {},
      privKey = '',
      today = new Date(),
      expires = new Date(today.getTime() + (60 * 60 * 1000)); // One hour from now.;

  // Set example data.
  header.alg = "RS256";
  header.typ = "JWT";
  claimSet.iss = "your-client-identifer-here";
  claimSet.scope = "https://www.example.com/auth/some-scope";
  claimSet.aud = "https://www.example.com/oauth2/token";
  claimSet.exp = expires.getTime();
  claimSet.iat = today.getTime();

  // This is a real key, but is now public and not secure. Example only.
  privKey = "-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQCpM0Q1VNFIDAD9ad4FlfPK9Qnn54PUGZEim4jfGKawZ0pwgjkq\nTS4Qm2FwXcRs2dorTvtktOlJm7Gr+XVR7br+IqSJ3RMlUaa40iGgSGvilAB6tDSs\nEl/FUtPdMrMw59++BBXDKIyuuhVODHlezT/xY7+ma5eAoswXliTNO+7j4QIDAQAB\nAoGAN7t2RSbaBKRHkzFS+34IHpsWFzgQGUYOo1qd+/ZvuX1cbLDISaHAgaHct5l7\nQOuFTGyoq+RXT3KkVGRH+6OVyuTX0jFU5SYfBmodwzZr13dB2VA+YEiGYtsom86u\nUldCgRZVfbT5nyL8OgIsBgS879/HgJ4yf8X1LlZZqzG0YH0CQQDTnPoCABxScjDZ\nOONXaVnoPuo5OulHofsi+KpvVi9Cv9+zhsr0ToLJnruYQ/aKAwWa6fbt72T+n3+V\nEiQOXFXbAkEAzLDWM5OzEQPtOQE/JqXAH1SAmZ944ET0O4IUEZJiK5hsO64HGvSh\n+ftMR5Itii3ROUb1NqG9c6jcUUl6fyG/8wJAV+7WELi9DCF5XPp/tdYITzK9n7R0\nNZkAw6JzKDq2/tS+f1pWwbhSLrfwGjC7pNPmo13vhyXAYPIkUOyt4O3LmwJASL9g\noZwQvC9lFCl5REcMbRYfTnn6/9oB41RrxYL9GPlnHh7Pr6jaGHpTtewh+0YlYfHy\nHKSHLKALDWjL/HsGOQJADEwwqKz2fyvYlkGK0tnkdlCEjaZHaHGzTBhxSX36s2Yf\nJBAyd7+xD3R0HLV7L85D6oltUaUiCn4gXN1N+p30PA==\n-----END RSA PRIVATE KEY-----\n";

  res.render('encode', { header: JSON.stringify(header, null, 2), claimSet: JSON.stringify(claimSet, null, 2), privKey: privKey, matches: false, example: true });
});

// Display decode JWT page.
app.get('/decode', function (req, res) {
  "use strict";

  // This is a real JWT created from the encode example above.
  var jwt = "IntcclxuICBcImFsZ1wiOiBcIlJTMjU2XCIsXHJcbiAgXCJ0eXBcIjogXCJKV1RcIlxyXG59Ig.IntcclxuICBcImlzc1wiOiBcInlvdXItY2xpZW50LWlkZW50aWZlci1oZXJlXCIsXHJcbiAgXCJzY29wZVwiOiBcImh0dHBzOi8vd3d3LmV4YW1wbGUuY29tL2F1dGgvc29tZS1zY29wZVwiLFxyXG4gIFwiYXVkXCI6IFwiaHR0cHM6Ly93d3cuZXhhbXBsZS5jb20vb2F1dGgyL3Rva2VuXCIsXHJcbiAgXCJleHBcIjogMTM2Mzk4NzUwNTQxOSxcclxuICBcImlhdFwiOiAxMzYzOTgzOTA1NDE5XHJcbn0i.WGhCY3hLRlBFa2Q3OUNCRDJ3ZDd1dWpFaTVJR3BkSi9CSWRMQVdmdzRpd1NWblZVUjJ2aUNQVkF3RExEeXMwakY1LzRVdnlEU29ZYkpRVWlCMWcrNEtab1FnbTJjdHdxMnU0RnQ1UUNONUU3ZDBzR3BrUkN4c2ozNXVkNVJCZHBhYkNudVZiN0NkTjVSQUh1Z282QmI3OE0ySFZPRFBSK3BJSVhaTkdzT2gwPQ",
      pubKey = "";

  // This is a read public key extracted from the private key above.
  pubKey = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpM0Q1VNFIDAD9ad4FlfPK9Qnn\n54PUGZEim4jfGKawZ0pwgjkqTS4Qm2FwXcRs2dorTvtktOlJm7Gr+XVR7br+IqSJ\n3RMlUaa40iGgSGvilAB6tDSsEl/FUtPdMrMw59++BBXDKIyuuhVODHlezT/xY7+m\na5eAoswXliTNO+7j4QIDAQAB\n-----END PUBLIC KEY-----";

  res.render('decode', { jwt: jwt, pubKey: pubKey, example: true, extracted: false });
});

/**
 * Set POST route paths.
 */

// Encode a posted JWT.
app.post('/encode', function (req, res) {
  "use strict";

  try {
    var privKey = req.body.privKey,
        // req.body.xxx comes in as a string, parse it to an object and then convert it into a clean string.
        encodeHeader = base64urlEncode(JSON.stringify(JSON.parse(req.body.header))),
        encodeClaimSet = base64urlEncode(JSON.stringify(JSON.parse(req.body.claimSet))),
        data = encodeHeader + "." + encodeClaimSet,
        signer = crypto.createSign("RSA-SHA256"),
        signature,
        extracted = false;

    signer.update(data);
    signature = base64urlEncode(signer.sign(privKey, 'base64'));

    // Extract the public key from the privte one.
    var pubKey = ursa.coerceKey(privKey).toPublicPem();

    if (pubKey) {
      extracted = true;
    }

    res.render('decode', { jwt: data + "." + signature, pubKey: pubKey, example: false, extracted: extracted });
  } catch (error) {
    res.render('decode', { jwt: "invalid", pubKey: "invalid", example: false, extracted: false });
  }
});

// Decode a posted JWT.
app.post('/decode', function (req, res) {
  "use strict";

  try {
    var pubKey = req.body.pubKey,
        jwt = req.body.jwt,
        contents = [],
        header = "",
        claimSet = "",
        signature = "",
        data = "",
        verifier = crypto.createVerify("RSA-SHA256"),
        matches = false;

    // Convert JWT to an array of 3 parts.
    contents = jwt.split(".");

    if (!Array.isArray(contents)) { contents = [ contents ]; }

    if (contents.length != 3) {
      res.render('encode', { header: "invalid", claimSet: "invalid", privKey: "invalid", matches: false, example: false });
      return;
    }

    header = base64urlDecode(contents[0]);
    claimSet = base64urlDecode(contents[1]);
    signature = base64urlDecode(contents[2]);
    data = contents[0] + "." + contents[1];

    if (header && claimSet && signature) {
      // These come in as a strings, parse them to an object and then convert it into a clean string.
      header = JSON.stringify(JSON.parse(header), null, 2);
      claimSet = JSON.stringify(JSON.parse(claimSet), null, 2);

      verifier.update(data);
      matches = verifier.verify(pubKey, signature, 'base64');

      res.render('encode', { header: header, claimSet: claimSet, privKey: "Enter your Private Key Here to Encode Again.", matches: matches, example: false });
    } else {
      res.render('encode', { header: "invalid", claimSet: "invalid", privKey: "invalid", matches: matches, example: false });
    }
  } catch (error) {
    res.render('encode', { header: "invalid", claimSet: "invalid", privKey: "invalid", matches: false, example: false });
  }
});

/**
 * Start the server.
 */
app.listen(3000);
console.log('JSON Web Token (JWT) app started on port 3000');
