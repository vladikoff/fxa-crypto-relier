/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


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
    return !! (this.win.TextEncoder || this.win['crypto'].subtle.generateKey);
  }

  private _covered: boolean = false;

  public coverageTest() {
    /* Should be uncovered. */
    this._covered = true;
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

        return window.crypto.subtle.exportKey("jwk", keys.privateKey)
          .then((privateKey) => {
            jwkPrivateKey = privateKey;
            return window.crypto.subtle.exportKey("jwk", keys.publicKey);
          })
          .then((jwkPublicKey) => {
            return {
              rawPublicKey: keys.publicKey,
              rawPrivateKey: keys.privateKey,

              jwkPrivateKey: jwkPrivateKey,
              jwkPublicKey: jwkPublicKey,

              base64JwkPrivateKey: atob(JSON.stringify(jwkPrivateKey)),
              base64JwkPublicKey: atob(JSON.stringify(jwkPublicKey)),
            };
          });
      })


      // .catch(function(err:any){
      //   console.error('createKeyPair failed', err);
      //   throw err;
      // })
  }

  public decryptBundle(appPrivateKey: CryptoKey, relierPublicKey: CryptoKey, bundle: String) {

  }
}
