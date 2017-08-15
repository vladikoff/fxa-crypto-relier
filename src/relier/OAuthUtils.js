/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 global browser
 */

const KeyUtils = require('./KeyUtils');
const jose = require('node-jose');

const fxaKeyUtils = new KeyUtils();

class OAuthUtils {
  constructor() {
    this.oauthServer = 'http://127.0.0.1:9010/v1';
  }

  launchFxaScopedKeyFlow(options = {}) {
    const browserApi = options.browserApi || browser;
    const FXA_OAUTH_SERVER = options.oauth_uri || this.oauthServer;
    const CLIENT_ID = options.client_id; // eslint-disable-line camelcase
    const SCOPES = options.scopes || [];

    const state = createRandomString(16);
    const codeVerifier = createRandomString(32);
    const queryParams = {
      access_type: 'offline',
      redirect_uri: options.redirect_uri, // eslint-disable-line camelcase
      client_id: CLIENT_ID, // eslint-disable-line camelcase
      state: state,
      scope: encodeURIComponent(SCOPES.join(' ')),
    };

    let AUTH_URL;

    return sha256(codeVerifier)
      .then(codeChallenge => {

        if (options.pkce) {
          queryParams.response_type = 'code'; // eslint-disable-line camelcase
          queryParams.code_challenge_method = 'S256'; // eslint-disable-line camelcase
          queryParams.code_challenge = codeChallenge; // eslint-disable-line camelcase
        }

        AUTH_URL = FXA_OAUTH_SERVER + '/authorization' + objectToQueryString(queryParams);

        return fxaKeyUtils.createApplicationKeyPair();
      })
      .then((keyTypes) => {
        const base64JwkPublicKey = jose.util.base64url.encode(JSON.stringify(keyTypes.jwkPublicKey), 'utf8');
        const finalAuth = `${AUTH_URL}&keys_jwk=${base64JwkPublicKey}`;

        return browserApi.identity.launchWebAuthFlow({
          interactive: true,
          url: finalAuth
        }).then(function (redirectURL) {
          const code = extractAccessToken(redirectURL);

          return getBearerToken(FXA_OAUTH_SERVER, code, CLIENT_ID, codeVerifier);
        })
          .then(function (tokenResult) {
            const bundle = tokenResult.derivedKeyBundle;

            return fxaKeyUtils.decryptBundle(bundle)
              .then(function (keys) {
                delete tokenResult.derivedKeyBundle;

                tokenResult.keys = keys;
                return tokenResult;
              });
          });
      });

  }

}

function getBearerToken(oauthUrl, code, clientId, codeVerifier) {
  const myHeaders = new Headers();

  myHeaders.append('Content-Type', 'application/json');

  return fetch(
    new Request(oauthUrl + '/token', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        code: code,
        client_id: clientId, // eslint-disable-line camelcase
        code_verifier: codeVerifier // eslint-disable-line camelcase
      })
    })
  )
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else { // eslint-disable-line no-else-return
        throw new Error('Failed to fetch token');
      }
    });
}

function extractAccessToken(redirectUri) {
  const m = redirectUri.match(/[#?](.*)/);

  if (! m || m.length < 1) return null;
  const params = new URLSearchParams(m[1].split('#')[0]);

  return params.get('code');
}

function createRandomString(length) {
  if (length <= 0) {
    return '';
  }
  let _state = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

  for (let i = 0; i < length; i ++) {
    _state += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return _state;
}

function sha256(str) {
  const buffer = new TextEncoder('utf-8').encode(str);

  return crypto.subtle.digest('SHA-256', buffer)
    .then(digest => {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
    });
}

/**
 * Create a query parameter string from a key and value
 *
 * @method createQueryParam
 * @param {String} key
 * @param {Variant} value
 * @returns {String}
 * URL safe serialized query parameter
 */
function createQueryParam(key, value) {
  return encodeURIComponent(key) + '=' + encodeURIComponent(value);
}

/**
 * Create a query string out of an object.
 * @method objectToQueryString
 * @param {Object} obj
 * Object to create query string from
 * @returns {String}
 * URL safe query string
 */
function objectToQueryString(obj) {
  const queryParams = [];

  for (const key in obj) {
    queryParams.push(createQueryParam(key, obj[key]));
  }

  return '?' + queryParams.join('&');
}

module.exports = OAuthUtils;
