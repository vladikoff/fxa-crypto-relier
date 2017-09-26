/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('OAuthKeys', function () {
  const browserApi = {
    identity: {
      launchWebAuthFlow: () => {
        return Promise.resolve('url');
      }
    }
  };

  const oAuthUtils = new window.fxaCryptoRelier.OAuthUtils();

  it('should have HKDF work', (done) => {
    oAuthUtils.launchFxaScopedKeyFlow({
      browserApi: browserApi,
      pkce: true
    })
    .then((key) => {
      assert.equal(key.length, 64);
      done();
    });

  });
});
