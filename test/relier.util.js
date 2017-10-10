/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var assert = chai.assert;

const util = window.fxaCryptoRelier.OAuthUtils.__util;

describe('relier.util', function () {

  describe('createQueryParam', () => {
    it('can create query param', () => {
      const c = util.createQueryParam;

      assert.equal(c('key', 'value'), 'key=value');
      assert.equal(c('key spaced', 'value spaced'), 'key%20spaced=value%20spaced');
    });
  });

  describe('createRandomString', () => {
    it('can create strings', () => {
      const s = util.createRandomString;

      assert.equal(s(3).length, 3);
      assert.equal(s(0).length, 0);
    });
  });

  describe('extractAccessToken', () => {
    const e = util.extractAccessToken;

    it('extracts the code', () => {
      assert.equal(e('https://some.example.com/?test=1&code=foo'), 'foo');
      assert.equal(e('https://some.example.com/?code=foo'), 'foo');
      assert.equal(e('https://some.example.com/?test=1&code=foo&test=5'), 'foo');
    });

    it('returns null when there is no code', () => {
      assert.equal(e('https://some.example.com/?test=1'), null);
    });
  });

  describe('objectToQueryString', () => {
    it('creates query strings', () => {
      const o = util.objectToQueryString;

      assert.equal(o({
        key: 'test',
        second: 'bar'
      }), '?key=test&second=bar');
    });
  });

  describe('sha256', () => {
    it('works for normal strings', () => {
      return util.sha256('foo').then((result) => {
        assert.equal(result, 'LCa0a2j_xo_5m0U8HTBBNBNCLXBkg7-g-YpeiGJm564');
      });
    });

    it('works with no strings', () => {
      return util.sha256().then((result) => {
        assert.equal(result, '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU');
      });
    });
  });

});
