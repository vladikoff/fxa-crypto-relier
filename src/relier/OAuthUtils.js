/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 global browser
 */

const jose = require('node-jose');

const KeyUtils = require('./KeyUtils');
const util = require('./util');
const fxaKeyUtils = new KeyUtils();

const OAUTH_SERVER_URL = 'https://oauth.accounts.firefox.com/v1';

class OAuthUtils {
  constructor(options = {}) {
    this.oauthServer = options.oauthServer || OAUTH_SERVER_URL;
  }

  launchFxaScopedKeyFlow(options = {}) {
    const browserApi = options.browserApi || browser;
    const getBearerTokenRequest = options.getBearerTokenRequest || this._getBearerTokenRequest;
    const clientId = options.client_id; // eslint-disable-line camelcase
    const SCOPES = options.scopes || [];

    const state = util.createRandomString(16);
    const codeVerifier = util.createRandomString(32);
    const queryParams = {
      access_type: 'offline', // eslint-disable-line camelcase
      client_id: clientId, // eslint-disable-line camelcase
      redirect_uri: options.redirect_uri, // eslint-disable-line camelcase
      scope: SCOPES.join(' '),
      state: state
    };

    let authUrl = `${this.oauthServer}/authorization`;

    return util.sha256(codeVerifier)
      .then(codeChallenge => {

        if (options.pkce) {
          queryParams.response_type = 'code'; // eslint-disable-line camelcase
          queryParams.code_challenge_method = 'S256'; // eslint-disable-line camelcase
          queryParams.code_challenge = codeChallenge; // eslint-disable-line camelcase
        } else {
          throw new Error('Only Public Client flow is currently supported');
        }

        authUrl += util.objectToQueryString(queryParams);

        return fxaKeyUtils.createApplicationKeyPair();
      })
      .then((keyTypes) => {
        const base64JwkPublicKey = jose.util.base64url.encode(JSON.stringify(keyTypes.jwkPublicKey), 'utf8');
        const finalAuth = `${authUrl}&keys_jwk=${base64JwkPublicKey}`;

        return browserApi.identity.launchWebAuthFlow({
          interactive: true,
          url: finalAuth
        }).then((redirectURL) => {
          const code = util.extractAccessToken(redirectURL);

          return getBearerTokenRequest(this.oauthServer, code, clientId, codeVerifier);
        })
          .then((tokenResult) => {
            const bundle = tokenResult.keys_jwe;

            if (! bundle) {
              throw new Error('Failed to fetch bundle');
            }

            return fxaKeyUtils.decryptBundle(bundle)
              .then(function (keys) {
                delete tokenResult.keys_jwe;

                tokenResult.keys = keys;
                return tokenResult;
              });
          });
      });
  }

  _getBearerTokenRequest(server, code, clientId, codeVerifier, options = {}) {
    const fetchInterface = options.fetch || fetch;
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');

    const request = new Request(`${server}/token`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        code: code,
        client_id: clientId, // eslint-disable-line camelcase
        code_verifier: codeVerifier // eslint-disable-line camelcase
      })
    });

    return fetchInterface(request).then((response) => {
      if (response.status === 200) {
        return response.json();
      } else { // eslint-disable-line no-else-return
        throw new Error('Failed to fetch token');
      }
    });
  }

}

// Exposed for testing purposes
OAuthUtils.__util = util;

module.exports = OAuthUtils;
