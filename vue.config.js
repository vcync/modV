const DefinePlugin = require("webpack").DefinePlugin;

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
    },

    node: {
      __dirname: process.env.NODE_ENV !== "production",
      __filename: process.env.NODE_ENV !== "production"
    }
  },

  pluginOptions: {
    electronBuilder: {
      externals: [
        "!color",
        "!lodash.clonedeep",
        "!lodash.get",
        "!events",
        "!debug",
        "!assert",

        "fluent-ffmpeg",
        "animated-gif-detector",
        "ospath",
        "stream-to-blob",
        "grandiose"
      ],

      builderOptions: {
        appId: "gl.vcync.modv",
        productName: "modV",

        linux: {
          category: "Graphics"
        }
      },

      chainWebpackRendererProcess: config => {
        config.plugin("define").use(DefinePlugin, [
          {
            "process.env": {
              NODE_ENV: '"production"',
              BASE_URL: "`app://./`",
              IS_ELECTRON: true
            }
            // __dirname: "`app://./`",
            // __filename: "`app://./index.html`",
            // __static: "`app://./`"
          }
        ]);

        // console.log(JSON.stringify(config.toConfig(), null, 2));
        return config;
      }
    }
  }
};
