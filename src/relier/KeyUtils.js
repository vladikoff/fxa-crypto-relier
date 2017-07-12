/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let utils = require('../shared/utils');
let jose = require('node-jose');

console.log(utils);
console.log(jose);

class KeyUtils {
  constructor(options = {}) {
    this.win = options.window || window;

    if (! utils.environmentTest(this.win)) {
      throw new Error('Unsupported TextEncoder, atob or crypto environment');
    }
  }


  createApplicationKeyPair() {
    return window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true, // extractable key
      ['deriveKey'] // can be 'deriveKey' and 'deriveBits'
    )
    .then((keys) => {
      let jwkPrivateKey;

      return window.crypto.subtle.exportKey('jwk', keys.privateKey)
        .then((privateKey) => {
          jwkPrivateKey = privateKey;
          return window.crypto.subtle.exportKey('jwk', keys.publicKey);
        })
        .then((jwkPublicKey) => {
          return {
            rawPublicKey: keys.publicKey,
            rawPrivateKey: keys.privateKey,

            jwkPrivateKey: jwkPrivateKey,
            jwkPublicKey: jwkPublicKey,

            base64JwkPrivateKey: utils.str2base64url(JSON.stringify(jwkPrivateKey)),
            base64JwkPublicKey: utils.str2base64url(JSON.stringify(jwkPublicKey)),
          };
        });
    });
  }

  /**
   *
   * @param appPrivateKey
   * @param relierPublicKey
   * @param initializationVector The initialization vector
   * @param bundle
   * @returns {PromiseLike<Object>}
   */
  decryptBundle(appPrivateKey, bundle) {
    console.log('decryptBundle', appPrivateKey, bundle);
    var sp = bundle.split('.');
    console.log('sp', sp)
    var head = utils.base64url2str(sp[0]);
    var epk = JSON.parse(head).epk
    console.log('epk', epk);
    crypto.subtle.importKey("jwk", epk, {name: "ECDH", namedCurve: "P-256"}, true, [])
      .then(function (resDeriverPublicKey) {
        console.log('resDeriverPublicKey', resDeriverPublicKey);

        var derivedKeyPromise = window.crypto.subtle.deriveKey(
          {
            name: 'ECDH',
            namedCurve: 'P-256',
            public: resDeriverPublicKey,
          },
          appPrivateKey,
          {
            name: 'AES-GCM',
            length: 256,
          },
          true, // extractable key
          ['decrypt']
        ).catch(function(err0) {
          console.log('err0', err0);
          debugger
        });

        //console.log('derivedKey', derivedKey);

        var cryptographer = new jose.Jose.WebCryptographer();
        cryptographer.setKeyEncryptionAlgorithm("A256GCM");
        cryptographer.setContentEncryptionAlgorithm("A256GCM");

        var decrypter = new jose.JoseJWE.Decrypter(cryptographer, derivedKeyPromise);
        return decrypter.decrypt(bundle);

      }, function (err) {
        console.log('errX', err);
      })
      .then(function (decr) {
        console.log('decr', decr);
      }, function (err) {
        console.log('errXP', err);
        console.dir(err)
        throw err;
      })



    // const alg = {
    //   name: 'ECDH',
    //   namedCurve: 'P-256',
    //   public: relierPublicKey,
    // };
    //
    // return window.crypto.subtle.deriveKey(
    //   alg,
    //   appPrivateKey,
    //   {
    //     name: 'AES-GCM',
    //     length: 256,
    //   },
    //   false, // no need to export this key
    //   ['encrypt', 'decrypt']
    // ).then((derivedKey) => {
    //   return window.crypto.subtle.decrypt(
    //     {
    //       name: 'AES-GCM',
    //       iv: initializationVector,
    //       tagLength: 128,
    //     },
    //     derivedKey,
    //     bundle,
    //   );
    // }).then(function (decrypted) {
    //   let arr = new Uint8Array(decrypted);
    //
    //   return new TextDecoder().decode(arr);
    // });
  }
}

module.exports = KeyUtils;