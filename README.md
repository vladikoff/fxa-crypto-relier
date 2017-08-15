# fxa-crypto-relier

Scoped Encryption Keys for Firefox Accounts Util Library

![](http://imgur.com/QH7eDUj.jpg)


## Installation

```sh
npm install fxa-crypto-relier --save
```

## API

### Relier

> For Firefox Accounts Reliers


#### WebExtension

```js
const oAuthUtils = new window.fxaCryptoRelier.OAuthUtils();

oAuthUtils.launchFxaScopedKeyFlow({
  client_id: FXA_CLIENT_ID,
  // oauth_uri: FXA_OAUTH_SERVER,
  pkce: true,
  redirect_uri: browser.identity.getRedirectURL(),
  scopes: ['profile', 'https://identity.mozilla.org/apps/[APP_NAME]'],
})
.then((scopedKey) => {

});

```

### Deriver

> For Firefox Accounts Content Server

```js

// TODO

```

## Local Development

### Scripts

`npm run build` - build library

`npm run dev` - development mode

### Tests

```
npm test
```

## Dependencies

- [base64url](https://github.com/brianloveswords/base64url): For encoding to/from base64urls
- [install](https://github.com/benjamn/install): Minimal JavaScript module loader
- [node-hkdf](https://github.com/benadida/node-hkdf): HKDF key derivation function
- [node-jose](git@github.com/cisco/node-jose.git): A JavaScript implementation of the JSON Object Signing and Encryption (JOSE) for current web browsers and node.js-based servers
- [strftime](https://github.com/samsonjs/strftime): strftime for JavaScript

## Dev Dependencies

- [babel-cli](https://github.com/babel/babel/tree/master/packages): Babel command line.
- [babel-core](https://github.com/babel/babel/tree/master/packages): Babel compiler core.
- [babel-eslint](https://github.com/babel/babel-eslint): Custom parser for ESLint
- [babel-loader](https://github.com/babel/babel-loader): babel module loader for webpack
- [babel-plugin-add-module-exports](https://github.com/59naga/babel-plugin-add-module-exports): Fix babel/babel#2212
- [babel-preset-es2015](https://github.com/babel/babel/tree/master/packages): Babel preset for all es2015 plugins.
- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-loader](https://github.com/MoOx/eslint-loader): eslint loader (for webpack)
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [webpack](https://github.com/webpack/webpack): Packs CommonJs/AMD modules for the browser. Allows to split your codebase into multiple bundles, which can be loaded on demand. Support loaders to preprocess files, i.e. json, jsx, es7, css, less, ... and your custom stuff.
- [yargs](https://github.com/yargs/yargs): yargs the modern, pirate-themed, successor to optimist.


## License

MPL-2.0
