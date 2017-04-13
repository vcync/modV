const webpack = require('webpack');

console.log(__dirname);

module.exports = {
  output: {
    filename: '[name].js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      'forIn': __dirname + '/src/fragments/for-in.js'
    })
  ]
};