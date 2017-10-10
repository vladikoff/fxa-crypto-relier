/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jose = require('node-jose');

/**
 *
 * @param redirectUri
 * @returns {null}
 */
function extractAccessToken(redirectUri) {
  const m = redirectUri.match(/[#?](.*)/);

  if (! m || m.length < 1) return null;
  const params = new URLSearchParams(m[1].split('#')[0]);

  return params.get('code');
}

function createRandomString(length) {
  let buf = new Uint8Array(length);

  return jose.util.base64url.encode(crypto.getRandomValues(buf)).substr(0, length);
}

function sha256(str) {
  const buffer = new TextEncoder('utf-8').encode(str);

  return crypto.subtle.digest('SHA-256', buffer)
    .then(digest => {
      return jose.util.base64url.encode(digest);
    });
}

/**
 * Create a query parameter string from a key and value
 *
 * @method createQueryParam
 * @param {String} key
 * @param {String} value
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
  const queryParams = [];

  for (const key in obj) {
    queryParams.push(createQueryParam(key, obj[key]));
  }

  return '?' + queryParams.join('&');
}

module.exports = {
  createQueryParam,
  createRandomString,
  extractAccessToken,
  objectToQueryString,
  sha256,
};
