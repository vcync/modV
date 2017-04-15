const webpack = require('webpack');
const path = require('path');
console.log(__dirname);

module.exports = {
  output: {
    filename: '[name].js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      'forIn': __dirname + '/src/fragments/for-in.js'
    })
  ],
  resolve: {
    alias: {
      meyda: path.resolve(__dirname, 'node_modules/meyda/dist/node/main.js')
    }
  }
};