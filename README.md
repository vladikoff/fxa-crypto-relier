# fxa-crypto-relier

![](http://imgur.com/QH7eDUj.jpg)


### Get Application Keys
```js

const fxaKeyUtils = new FxaCryptoRelier.KeyUtils();

return fxaKeyUtils.createApplicationKeyPair()
  .then((keyTypes) => {
    // ...
    // make an oauth web auth flow
    return browser.identity.launchWebAuthFlow({
      interactive: true,
      // client_id 
      url: `${AUTH_URL}&scopes="profile notes sync:bookmarks"&keys_jwk=${keyTypes.base64JwkPublicKey}`
    });
  })
    

```


### Decrypt Key Bundle
```js

const fxaKeyUtils = new FxaCryptoRelier.KeyUtils();

// get the `decryptedBundle`
return fxaKeyUtils.decryptBundle(appPrivateKey, relierPublicKey, encryptedBundle)
  .then((decryptedBundle) => {
    // ...
    // KEYS HERE!
    {"sync_bookmarks": ..., notes: ...}
  })
    

```