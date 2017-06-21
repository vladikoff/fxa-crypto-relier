/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { str2base64url, str2ab, ab2str } from './utils';

export interface KeyUtilsOptions {
  window?: Window,
}

export class KeyUtils {
  private win: Window;

  constructor(options: KeyUtilsOptions = {}) {
    this.win = options.window || window;

    if (! this.environmentTest()) {
      throw new Error('Unsupported TextEncoder, atob or crypto environment');
    }
  }

  private environmentTest(): boolean {
    return !! (this.win.TextEncoder || this.win.TextDecoder || this.win['crypto'] || this.win['crypto'].subtle || this.win['crypto'].subtle.generateKey);
  }

  public createApplicationKeyPair() {
    return window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      true, // extractable key
      ['deriveKey'] // can be 'deriveKey' and 'deriveBits'
    )
    .then((keys) => {
      let jwkPrivateKey:object;

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

            base64JwkPrivateKey: str2base64url(JSON.stringify(jwkPrivateKey)),
            base64JwkPublicKey: str2base64url(JSON.stringify(jwkPublicKey)),
          };
        });
    })
  }

  /**
   *
   * @param appPrivateKey
   * @param relierPublicKey
   * @param initializationVector The initialization vector
   * @param bundle
   * @returns {PromiseLike<Object>}
   */
  public decryptBundle(appPrivateKey: CryptoKey, relierPublicKey: CryptoKey, initializationVector: Uint8Array, bundle: ArrayBuffer) {
    const alg = {
      name: 'ECDH',
      namedCurve: 'P-256',
      public: relierPublicKey,
    };

    return window.crypto.subtle.deriveKey(
      alg,
      appPrivateKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false, // no need to export this key
      ['encrypt', 'decrypt']
    ).then((derivedKey : CryptoKey) => {
      return window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: initializationVector,
          tagLength: 128,
        },
        derivedKey,
        bundle,
      )
    }).then(function(decrypted: ArrayBuffer) {
      let arr = new Uint8Array(decrypted) as any;
      return new TextDecoder().decode(arr);
    });
  }

  public encryptBundle(appPublicKeyJwk: JsonWebKey, bundle: ArrayBuffer) {
    var initializationVector = window.crypto.getRandomValues(new Uint8Array(12)) as any;

    let RELIER_PUBLIC_KEY: CryptoKey;
    let RELIER_PRIVATE_KEY: CryptoKey;
    return window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256',
      },
      false, // non-extractable key
      ['deriveKey']
    ).then((keys) => {
      RELIER_PUBLIC_KEY = keys.publicKey;
      RELIER_PRIVATE_KEY = keys.privateKey;


      return window.crypto.subtle.importKey(
        'jwk',
        appPublicKeyJwk,
        {
          name: "ECDH",
          namedCurve: "P-256",
        },
        false, //whether the key is extractable (i.e. can be used in exportKey)
        [] //"deriveKey" and/or "deriveBits" for private keys only (just put an empty list if importing a public key)
      )

    }).then((APP_PUBLIC_KEY) => {

      const alg = {
        name: 'ECDH',
        namedCurve: 'P-256',
        public: APP_PUBLIC_KEY,
      };

      return window.crypto.subtle.deriveKey(
        alg,
        RELIER_PRIVATE_KEY,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false, // non-extractable key
        ['encrypt']
      )
    }).then((derivedKey) => {
      return window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: initializationVector,
          tagLength: 128,
        },
        derivedKey,
        str2ab(JSON.stringify(bundle)),
      )
    }).then((encryptedBundle) => {
      debugger
      const jweHeader = str2base64url(JSON.stringify(RELIER_PUBLIC_KEY))
      const contentKey = str2base64url('');
      const iv = str2base64url(ab2str(initializationVector))
      const ciphertext = str2base64url(ab2str(encryptedBundle))
      const authentication_tag = str2base64url('');

      return `
        ${jweHeader}
        .
        ${contentKey}
        .
        ${iv}
        .
        ${ciphertext}
        .
        ${authentication_tag}
      `
      })

    }
}
