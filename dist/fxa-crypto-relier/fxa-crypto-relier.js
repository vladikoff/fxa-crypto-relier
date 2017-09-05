(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("fxaCryptoRelier", [], factory);
	else if(typeof exports === 'object')
		exports["fxaCryptoRelier"] = factory();
	else
		root["fxaCryptoRelier"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 88);
/******/ })
/************************************************************************/
/******/ ({

/***/ 48:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var jose = __webpack_require__(54);

var KeyUtils = function () {
  function KeyUtils() {
    _classCallCheck(this, KeyUtils);

    this.keystore = null;
  }

  _createClass(KeyUtils, [{
    key: 'createApplicationKeyPair',
    value: function createApplicationKeyPair() {
      var _this = this;

      var keystore = jose.JWK.createKeyStore();

      return keystore.generate('EC', 'P-256').then(function (keyPair) {
        _this.keystore = keystore;

        return {
          jwkPublicKey: keyPair.toJSON()
        };
      });
    }
  }, {
    key: 'decryptBundle',
    value: function decryptBundle(bundle) {
      if (!this.keystore) {
        throw new Error('No Key Store. Use .createApplicationKeyPair() to create it first.');
      }

      return jose.JWE.createDecrypt(this.keystore).decrypt(bundle).then(function (result) {
        return JSON.parse(jose.util.utf8.encode(result.plaintext));
      });
    }
  }]);

  return KeyUtils;
}();

module.exports = KeyUtils;

/***/ }),

/***/ 54:
/***/ (function(module, exports) {

"use strict";
throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/Users/vladikoff/mozilla/fxa-crypto-relier/node_modules/node-jose/lib/index.js'\n    at Error (native)");

/***/ }),

/***/ 87:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 global browser
 */

var KeyUtils = __webpack_require__(48);
var jose = __webpack_require__(54);

var fxaKeyUtils = new KeyUtils();

function getBearerToken(oauthUrl, code, clientId, codeVerifier) {
  var myHeaders = new Headers();

  myHeaders.append('Content-Type', 'application/json');

  return fetch(new Request(oauthUrl + '/token', {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      code: code,
      client_id: clientId, // eslint-disable-line camelcase
      code_verifier: codeVerifier // eslint-disable-line camelcase
    })
  })).then(function (response) {
    if (response.status === 200) {
      return response.json();
    } else {
      // eslint-disable-line no-else-return
      throw new Error('Failed to fetch token');
    }
  });
}

function extractAccessToken(redirectUri) {
  var m = redirectUri.match(/[#?](.*)/);

  if (!m || m.length < 1) return null;
  var params = new URLSearchParams(m[1].split('#')[0]);

  return params.get('code');
}

function createRandomString(length) {
  if (length <= 0) {
    return '';
  }
  var _state = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

  for (var i = 0; i < length; i++) {
    _state += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return _state;
}

function sha256(str) {
  var buffer = new TextEncoder('utf-8').encode(str);

  return crypto.subtle.digest('SHA-256', buffer).then(function (digest) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
  });
}

/**
 * Create a query parameter string from a key and value
 *
 * @method createQueryParam
 * @param {String} key
 * @param {Variant} value
 * @returns {String}
 * URL safe serialized query parameter
 */
function createQueryParam(key, value) {
  return encodeURIComponent(key) + '=' + encodeURIComponent(value);
}

/**
 * Create a query string out of an object.
 * @method objectToQueryString
 * @param {Object} obj
 * Object to create query string from
 * @returns {String}
 * URL safe query string
 */
function objectToQueryString(obj) {
  var queryParams = [];

  for (var key in obj) {
    queryParams.push(createQueryParam(key, obj[key]));
  }

  return '?' + queryParams.join('&');
}

var OAuthUtils = function () {
  function OAuthUtils() {
    _classCallCheck(this, OAuthUtils);

    this.oauthServer = 'http://127.0.0.1:9010/v1';
  }

  _createClass(OAuthUtils, [{
    key: 'launchFxaScopedKeyFlow',
    value: function launchFxaScopedKeyFlow() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var browserApi = options.browserApi || browser;
      var FXA_OAUTH_SERVER = options.oauth_uri || this.oauthServer;
      var CLIENT_ID = options.client_id; // eslint-disable-line camelcase
      var SCOPES = options.scopes || [];

      var state = createRandomString(16);
      var codeVerifier = createRandomString(32);
      var queryParams = {
        access_type: 'offline', // eslint-disable-line camelcase
        client_id: CLIENT_ID, // eslint-disable-line camelcase
        redirect_uri: options.redirect_uri, // eslint-disable-line camelcase
        scope: encodeURIComponent(SCOPES.join(' ')),
        state: state
      };

      var AUTH_URL = void 0;

      return sha256(codeVerifier).then(function (codeChallenge) {

        if (options.pkce) {
          queryParams.response_type = 'code'; // eslint-disable-line camelcase
          queryParams.code_challenge_method = 'S256'; // eslint-disable-line camelcase
          queryParams.code_challenge = codeChallenge; // eslint-disable-line camelcase
        }

        AUTH_URL = FXA_OAUTH_SERVER + '/authorization' + objectToQueryString(queryParams);

        return fxaKeyUtils.createApplicationKeyPair();
      }).then(function (keyTypes) {
        var base64JwkPublicKey = jose.util.base64url.encode(JSON.stringify(keyTypes.jwkPublicKey), 'utf8');
        var finalAuth = AUTH_URL + '&keys_jwk=' + base64JwkPublicKey;

        return browserApi.identity.launchWebAuthFlow({
          interactive: true,
          url: finalAuth
        }).then(function (redirectURL) {
          var code = extractAccessToken(redirectURL);

          return getBearerToken(FXA_OAUTH_SERVER, code, CLIENT_ID, codeVerifier);
        }).then(function (tokenResult) {
          var bundle = tokenResult.derivedKeyBundle;

          if (!bundle) {
            throw new Error('Failed to fetch bundle');
          }

          return fxaKeyUtils.decryptBundle(bundle).then(function (keys) {
            delete tokenResult.derivedKeyBundle;

            tokenResult.keys = keys;
            return tokenResult;
          });
        });
      });
    }
  }]);

  return OAuthUtils;
}();

module.exports = OAuthUtils;

/***/ }),

/***/ 88:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  KeyUtils: __webpack_require__(48),
  OAuthUtils: __webpack_require__(87)
};

/***/ })

/******/ });
});