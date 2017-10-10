/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HKDF = require('node-hkdf');
const base64url = require('base64url');

const KEY_LENGTH = 32;

class ScopedKeys {

  /**
   * Derive a scoped key
   * @param options
   * @param options.inputKey
   * @param options.keyMaterial
   * @param options.timestamp
   * @param options.identifier
   * @returns {Promise}
   */
  deriveScopedKeys(options) {
    return new Promise((resolve) => {
      if (! options.inputKey) {
        throw new Error('inputKey required');
      }

      if (! options.keyMaterial) {
        throw new Error('keyMaterial required');
      }

      if (! options.timestamp) {
        throw new Error('timestamp required');
      }

      if (! options.identifier) {
        throw new Error('identifier required');
      }

      const context = 'identity.mozilla.com/picl/v1/scoped_key\n' +
        options.identifier;
      const contextKid = 'identity.mozilla.com/picl/v1/scoped_kid\n' +
        options.identifier;
      const scopedKey = {
        kty: 'oct',
        scope: options.identifier,
      };

      this.deriveHKDF(options.keyMaterial, options.inputKey, context)
        .then((key) => {
          scopedKey.k = base64url(key);

          return this.deriveHKDF(options.keyMaterial, options.inputKey, contextKid);
        })
        .then((kidKey) => {
          const keyTimestamp = Math.round(options.timestamp / 1000);

          scopedKey.kid = keyTimestamp + '-' + base64url(kidKey);

          resolve({
            [options.identifier]: scopedKey
          });
        });
    });

  }

  /**
   * Derive a key using HKDF
   * @param keyMaterial - Hex string
   * @param inputKey - Hex string
   * @param context - String
   * @returns {Promise}
   */
  deriveHKDF(keyMaterial, inputKey, context) {
    return new Promise((resolve) => {
      const keyMaterialBuf = new Buffer(keyMaterial, 'hex');
      const inputKeyBuf = new Buffer(inputKey, 'hex');
      const contextBuf = new Buffer(context);
      const hkdf = new HKDF('sha256', keyMaterialBuf, inputKeyBuf);

      hkdf.derive(contextBuf, KEY_LENGTH, (key) => {
        return resolve(key);
      });
    });

  }
}

module.exports = ScopedKeys;
