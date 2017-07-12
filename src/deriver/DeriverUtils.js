let utils = require('../shared/utils');
let jose = require('jose-jwe-jws');

class DeriverUtils {
  constructor(options = {}) {
    this.win = options.window || window;

    if (! utils.environmentTest(this.win)) {
      throw new Error('Unsupported TextEncoder, atob or crypto environment');
    }
  }

  encryptBundle(appPublicKeyJwk, bundle) {
    let initializationVector = window.crypto.getRandomValues(new Uint8Array(12));
    let RELIER_PUBLIC_KEY;
    let RELIER_PRIVATE_KEY;

    return window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true, // extractable key
      ['deriveKey']
    ).then((keys) => {
      RELIER_PUBLIC_KEY = keys.publicKey;
      RELIER_PRIVATE_KEY = keys.privateKey;

      return window.crypto.subtle.importKey(
        'jwk',
        appPublicKeyJwk,
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        false, // non-extractable key
        []
      );

    }).then((APP_PUBLIC_KEY) => {
      return window.crypto.subtle.deriveKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256',
          public: APP_PUBLIC_KEY,
        },
        RELIER_PRIVATE_KEY,
        {
          name: 'AES-GCM',
          length: 256,
        },
        true, // extractable key
        ['encrypt']
      );
    }).then((derivedKey) => {
      debugger
      return window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: initializationVector,
          tagLength: 128,
        },
        derivedKey,
        utils.str2ab(JSON.stringify(bundle)),
      ).then((encryptedBundle) => {
        return {
          encryptedBundle: encryptedBundle,
          derivedKey: derivedKey
        }
      })
    }).then((context) => {

      return window.crypto.subtle.exportKey('jwk', RELIER_PUBLIC_KEY)
        .then((relierPublicKeyJwk) => {
          context.relierPublicKeyJwk = relierPublicKeyJwk;

          return context;
        });
    }).then((context) => {

      return window.crypto.subtle.exportKey('jwk', context.derivedKey)
        .then((jwk) => {
          context.jwk = jwk;

          return context;
        });
    }).then((context) => {
      var cryptographer = new jose.Jose.WebCryptographer();
      cryptographer.setKeyEncryptionAlgorithm("A256GCM");
      cryptographer.setContentEncryptionAlgorithm("A256GCM");

      var headerJwk = {
        kty: context.jwk.kty,
        k: context.jwk.k.replace(/=/, ''),
      };

      var shared_key = crypto.subtle.importKey("jwk", headerJwk, {name: "AES-GCM"}, true, ["wrapKey", "unwrapKey"]);

      var encrypter = new jose.JoseJWE.Encrypter(cryptographer, shared_key);
      console.log(context);
      encrypter.addHeader('epk', context.relierPublicKeyJwk);

      return encrypter.encrypt('hi remy');
    }).catch(function(err) {
      console.log('err2', err)
    })

  }
}

module.exports = DeriverUtils;
