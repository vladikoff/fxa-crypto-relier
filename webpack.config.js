/* global __dirname, require, module*/

const path = require('path');

const env  = require('yargs').argv.env; // use --env with webpack 2
const webpack = require('webpack');

const MODULE_CONFIG = {
  rules: [
    {
      test: /(\.jsx|\.js)$/,
      loader: 'babel-loader',
      exclude: /(node_modules|bower_components)/
    },
    {
      test: /(\.jsx|\.js)$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }
  ]
};

let relierLibraryName = 'fxa-crypto-relier';
let deriverLibraryName = 'fxa-crypto-deriver';

let PLUGINS = [], relierOutputFile, deriverOutputFile;

const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

if (env === 'build') {
  PLUGINS.push(new UglifyJsPlugin({ minimize: true }));
  relierOutputFile = relierLibraryName + '.min.js';
  deriverOutputFile = deriverLibraryName + '.min.js';
} else {
  relierOutputFile = relierLibraryName + '.js';
  deriverOutputFile = deriverLibraryName + '.js';
}

const config = {
  // fxa-content-server component
    entry: {
      deriver: __dirname + '/src/deriver/index.js',
      relier: __dirname + '/src/relier/index.js'
    },
    output: {
      path: __dirname + '/dist',
      filename: 'FxaCrypto.[name].js',
      library: ['FxaCrypto', '[name]'],
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    module: MODULE_CONFIG,
    plugins: PLUGINS
};

module.exports = config;
