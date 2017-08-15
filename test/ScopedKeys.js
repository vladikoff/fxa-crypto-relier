/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


describe('ScopedKeys', function() {
  const scopedKeys = new window.fxaCryptoDeriver.ScopedKeys();
  const sampleKb = 'bc3851e9e610f631df94d7883d5defd5e5f55ab520bd5a9ae33dae26575c6b1a';
  const scopedKeyIdentifier = 'https://identity.mozilla.com/apps/notes';
  const scopedKeyTimestamp = 1494446722583;

  it('should have HKDF work', (done) => {
    scopedKeys.deriveScopedKeys({
      inputKey: sampleKb,
      scopedKeySalt: scopedKeyIdentifier,
      scopedKeyTimestamp: scopedKeyTimestamp
    })
      .then((key) => {
        assert.equal(key.length, 64);
        done();
      });

  });
});
