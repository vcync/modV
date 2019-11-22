module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(glsl|vert|frag|fs|vs)$/,
          loader: "text-loader"
        }
      ]
    },

    serve: {
      hot: true,
      // hotOnly: true,
      contentBase: "./"
    }
  },

  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "gl.vcync.modv",
        productName: "modV"
      }
    }
  }
};
