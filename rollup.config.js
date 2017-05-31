import typescript from 'rollup-plugin-typescript2';

export default {
  moduleName: 'FxaCryptoRelier',
  entry: './src/main.ts',
  dest: './dist/js/main.min.js',
  format: 'iife',

  plugins: [
    typescript()
  ]
}
