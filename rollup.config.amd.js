import typescript from 'rollup-plugin-typescript2';

export default {
  moduleName: 'FxaCryptoRelier',
  entry: './src/main.ts',
  dest: './dist/js/fxa-crypto-relier.amd.js',
  format: 'amd',

  plugins: [
    typescript()
  ]
}
