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
      browserApi: browserApi
    })
    .then((key) => {
      assert.equal(key.length, 64);
      done();
    });

  });

  it('should work in Cordova context', (done) => {
    const browserApiCordova = {
      identity: {
        launchWebAuthFlow: (options) => {
          return new Promise(function (resolve, reject) {
            const authWindow = window.open(options.url, '_blank', 'location=no,toolbar=no');
            authWindow.addEventListener('loadstart', function(e) {
              var url = e.originalEvent.url;
              var code = /\?code=(.+)$/.exec(url);
              var error = /\?error=(.+)$/.exec(url);

              if (code || error) {
                authWindow.close();
                resolve(url);
              }

            });

          });
        }
      }
    };

    oAuthUtils.launchFxaScopedKeyFlow({
      browserApi: browserApiCordova
    })
      .then((key) => {
        assert.equal(key.length, 64);
        done();
      });

  });
});
