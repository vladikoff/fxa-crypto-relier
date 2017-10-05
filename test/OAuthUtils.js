/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('OAuthUtils', function () {
  let keysJwk;
  let encryptedBundle;

  const browserApi = {
    identity: {
      launchWebAuthFlow: (args) => {

        keysJwk = args.url.split('&').pop().split('=')[1];

        console.log(keysJwk);

        const keysJwk2 = window.fxaCryptoDeriver.jose.util.base64url.decode(JSON.stringify(keysJwk));
        const fxaDeriverUtils = new window.fxaCryptoDeriver.DeriverUtils();

        return fxaDeriverUtils.encryptBundle(keysJwk2, JSON.stringify({cake: true}))
          .then((bundle) => {
            encryptedBundle = bundle;
            console.log('encryptedBundle', encryptedBundle)
            return 'wat';
          });
      }
    }
  };
  const getBearerTokenRequest = function () {
    return new Promise((resolve) => {
      resolve({
        derivedKeyBundle: encryptedBundle
      });
    });
  };

  const oAuthUtils = new window.fxaCryptoRelier.OAuthUtils();

  it('should encrypt and decrypt the bundle', () => {
    return oAuthUtils.launchFxaScopedKeyFlow({
      browserApi: browserApi,
      getBearerTokenRequest: getBearerTokenRequest,
      pkce: true,
    })
      .then((key) => {
        console.log(key)
        assert.equal(key.length, 64);
      });

  });

});
