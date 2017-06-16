/**
 * String to ArrayBuffer
 * @param str
 * @returns {ArrayBuffer}
 */
export function str2ab(str: string): Uint8Array {
  return new TextEncoder('utf-8').encode(str);
}

/**
 * ArrayBuffer to String
 * @param uint8array
 * @returns {string}
 */
export function ab2str(uint8array: ArrayBuffer|Uint8Array): string {
  return new TextDecoder('utf-8').decode(uint8array as any);
}

/**
 * use this to make a Base64 encoded string URL friendly,
 * i.e. '+' and '/' are replaced with '-' and '_' also any trailing '='
 * characters are removed
 *
 * @param {String} str the encoded string
 * @returns {String} the URL friendly encoded String
 */
export function str2base64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

/**
 * Use this to recreate a Base64 encoded string that was made URL friendly
 * using Base64EncodeurlFriendly.
 * '-' and '_' are replaced with '+' and '/' and also it is padded with '+'
 *
 * @param {String} str the encoded string
 * @returns {String} the URL friendly encoded String
 */
export function base64url2str(str: string): string {
  str = (str + '===').slice(0, str.length + (str.length % 4));
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}


