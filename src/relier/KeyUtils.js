/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let jose = require('node-jose');

class KeyUtils {
  constructor(options = {}) {
    this.keystore = null;
  }

  /**
   *
   * @returns {Promise.<Object>}
   */
  createApplicationKeyPair() {
    var keystore = jose.JWK.createKeyStore();

    return keystore.generate('EC', 'P-256')
      .then((keyPair) => {
        this.keystore = keystore;

        return {
          jwkPublicKey: keyPair.toJSON(),
          jwkPrivateKey: keyPair.toJSON(true)
        };
      });

  }

  /**
   *
   * @param appPrivateKey
   * @param bundle
   */
  decryptBundle(appPrivateKey, bundle) {
    var jwe = jose.JWE.createDecrypt(this.keystore);

    console.log('decryptBundle', appPrivateKey, bundle);
    return jwe.decrypt(bundle)
      .then((result) => {
        return JSON.parse(jose.util.utf8.encode(result.plaintext));
      });

  }
}

module.exports = KeyUtils;
