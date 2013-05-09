jwt-encode-decode-app
==========================

JSON Web Token (JWT) Bearer Token Encoding and Decoding App.

This is a simple Node.js app that allows you to encode and decode JWTs and see the results, as [defined](http://tools.ietf.org/html/draft-ietf-oauth-json-web-token-06)
by the JSON Web Token (JWT) draft. This app is modeled off of Google's OAuth 2.0 [Server to Server Applications](https://developers.google.com/accounts/docs/OAuth2ServiceAccount) and can be used to interact with Google's or xTuple's APIs that support JWT.

Install and Run the App
------------------------------
    git clone git://github.com/xtuple/jwt-encode-decode-app.git
    npm install
    # Or run that as root if you have problems.
    # sudo npm install
    cd jwt-encode-decode-app
    node app.js

Open your browser and go to:
> [http://localhost:3000](http://localhost:3000)

## Credits

  - [bendiy](http://github.com/bendiy)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 xTuple [http://www.xtuple.com/](http://www.xtuple.com/)