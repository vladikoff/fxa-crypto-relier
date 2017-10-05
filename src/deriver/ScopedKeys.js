/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HKDF = require('node-hkdf');
const base64url = require('base64url');
const timestamp = require('time-stamp');

const KEY_LENGTH = 32;

class ScopedKeys {

  /**
   * Derive a scoped key
   * @param options
   * @param options.inputKey
   * @param options.scopedKeySalt
   * @param options.scopedKeyTimestamp
   * @param options.scopedKeyIdentifier
   * @returns {Promise}
   */
  deriveScopedKeys(options) {
    return new Promise((resolve) => {
      if (! options.inputKey) {
        throw new Error('inputKey required');
      }

      if (! options.scopedKeySalt) {
        throw new Error('scopedKeySalt required');
      }

      if (! options.scopedKeyTimestamp) {
        throw new Error('scopedKeyTimestamp required');
      }

      if (! options.scopedKeyTimestamp) {
        throw new Error('scopedKeyIdentifier required');
      }

      const context = 'identity.mozilla.com/picl/v1/scoped_key\n' +
        options.scopedKeyIdentifier;
      const contextKid = 'identity.mozilla.com/picl/v1/scoped_kid\n' +
        options.scopedKeyIdentifier;
      const scopedKey = {
        kty: 'oct',
        scope: options.scopedKeyIdentifier,
      };

      this.deriveHKDF(options.scopedKeySalt, options.inputKey, context)
        .then((key) => {
          scopedKey.k = base64url(key);

          return this.deriveHKDF(options.scopedKeySalt, options.inputKey, contextKid);
        })
        .then((kidKey) => {
          const ts = timestamp('YYYYMMDDHHmmss', new Date(options.scopedKeyTimestamp)); // YYYYMMDDHHMMSS timestamp

          scopedKey.kid = ts + '-' + base64url(kidKey);

          resolve({
            [options.scopedKeyIdentifier]: scopedKey
          });
        });
    });

  }

  /**
   * Derive a key using HKDF
   * @param scopedKeySalt - Hex string
   * @param inputKey - Hex string
   * @param context - String
   * @returns {Promise}
   */
  deriveHKDF(scopedKeySalt, inputKey, context) {
    return new Promise((resolve) => {
      const scopedKeySaltBuf = new Buffer(scopedKeySalt, 'hex');
      const inputKeyBuf = new Buffer(inputKey, 'hex');
      const contextBuf = new Buffer(context);
      const hkdf = new HKDF('sha256', scopedKeySaltBuf, inputKeyBuf);

      hkdf.derive(contextBuf, KEY_LENGTH, (key) => {
        return resolve(key);
      });
    });

  }
}

module.exports = ScopedKeys;
