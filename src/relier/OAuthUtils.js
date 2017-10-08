/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 global browser
 */

const jose = require('node-jose');

const KeyUtils = require('./KeyUtils');
const fxaKeyUtils = new KeyUtils();

const OAUTH_SERVER_URL = 'https://oauth.accounts.firefox.com/v1';

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
  let buf = new Uint8Array(length);

  return jose.util.base64url.encode(crypto.getRandomValues(buf)).substr(0, length);
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
 * @param {String} value
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

class OAuthUtils {
  constructor(options = {}) {
    this.oauthServer = options.oauth_uri || OAUTH_SERVER_URL;
  }

  launchFxaScopedKeyFlow(options = {}) {
    const browserApi = options.browserApi || browser;
    const getBearerTokenRequest = options.getBearerTokenRequest || getBearerToken;
    const CLIENT_ID = options.client_id; // eslint-disable-line camelcase
    const SCOPES = options.scopes || [];

    const state = createRandomString(16);
    const codeVerifier = createRandomString(32);
    const queryParams = {
      access_type: 'offline', // eslint-disable-line camelcase
      client_id: CLIENT_ID, // eslint-disable-line camelcase
      redirect_uri: options.redirect_uri, // eslint-disable-line camelcase
      scope: SCOPES.join(' '),
      state: state
    };

    let AUTH_URL;

    return sha256(codeVerifier)
      .then(codeChallenge => {

        if (options.pkce) {
          queryParams.response_type = 'code'; // eslint-disable-line camelcase
          queryParams.code_challenge_method = 'S256'; // eslint-disable-line camelcase
          queryParams.code_challenge = codeChallenge; // eslint-disable-line camelcase
        } else {
          throw new Error('Only Public Client flow is currently supported');
        }

        AUTH_URL = `${this.oauthServer}/authorization` + objectToQueryString(queryParams);

        return fxaKeyUtils.createApplicationKeyPair();
      })
      .then((keyTypes) => {
        const base64JwkPublicKey = jose.util.base64url.encode(JSON.stringify(keyTypes.jwkPublicKey), 'utf8');
        const finalAuth = `${AUTH_URL}&keys_jwk=${base64JwkPublicKey}`;

        return browserApi.identity.launchWebAuthFlow({
          interactive: true,
          url: finalAuth
        }).then((redirectURL) => {
          const code = extractAccessToken(redirectURL);

          return getBearerTokenRequest(this.oauthServer, code, CLIENT_ID, codeVerifier);
        })
          .then(function (tokenResult) {
            const bundle = tokenResult.derivedKeyBundle;

            if (! bundle) {
              throw new Error('Failed to fetch bundle');
            }

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

OAuthUtils.__util = {
  // exposed for testing purposes
  extractAccessToken: extractAccessToken,
  createRandomString: createRandomString,
  sha256: sha256,
  createQueryParam: createQueryParam,
  objectToQueryString: objectToQueryString
};

module.exports = OAuthUtils;
