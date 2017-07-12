let utils = require('../shared/utils');
let jose = require('jose-jwe-jws');

console.log(utils);
console.log(jose);

module.exports = {
  DeriverUtils: require('./DeriverUtils'),
  utils: utils,
  jose: jose
};
