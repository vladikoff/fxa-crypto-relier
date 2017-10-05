/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = chai.assert;

describe('ScopedKeys', function () {
  const scopedKeys = new window.fxaCryptoDeriver.ScopedKeys();
  const sampleKb = 'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a';
  const scopedKeyIdentifier = 'https://identity.mozilla.com/apps/notes';
  const scopedKeyTimestamp = 1494446722583; // GMT Wednesday, May 10, 2017 8:05:22.583 PM
  const scopedKeySalt = 'abcdef123456';

  it('should have HKDF work', (done) => {
    scopedKeys.deriveScopedKeys({
      inputKey: sampleKb,
      scopedKeySalt: scopedKeySalt,
      scopedKeyTimestamp: scopedKeyTimestamp,
      scopedKeyIdentifier: scopedKeyIdentifier
    })
      .then((key) => {
        const k = key[scopedKeyIdentifier];
        const importSpec = {
          name: 'AES-CTR',
        };
        assert.equal(k.kty, 'oct');
        assert.equal(k.k.length, 43);
        assert.equal(k.kid, '20170510160522-O-ZDFFfhO2Tzpdag6csDmsRH2a1c9UMKlD0GdouP-5k');
        assert.equal(k.scope, scopedKeyIdentifier);
        window.crypto.subtle.importKey('jwk', k, importSpec, false, ['encrypt']).then(function (rawKey) {
          assert.equal(rawKey.type, 'secret');
          assert.equal(rawKey.usages[0], 'encrypt');
          assert.equal(rawKey.extractable, false);
          done();
        }).catch(function (err) {
          console.error(err);
          done(err);
        });
      });

  });
});
