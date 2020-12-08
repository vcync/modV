const DefinePlugin = require("webpack").DefinePlugin;

const publishingOptions = {
  provider: "github",
  releaseType: "prerelease",
  vPrefixedTagName: false
};

module.exports = {
  // https://cli.vuejs.org/config/#pages
  pages: {
    index: "src/main.js",
    colorPicker: "src/subpages/color-picker/main.js"
  },

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
        "grandiose",
        "npm",
        "webpack-2",
        "font-list"
      ],

      builderOptions: {
        appId: "gl.vcync.modv",
        productName: "modV",

        linux: {
          category: "Graphics"
        },

        snap: {
          publish: publishingOptions
        },

        // See https://www.electron.build/configuration/mac
        mac: {
          // See https://developer.apple.com/documentation/security/hardened_runtime
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: "build/entitlements.mac.plist",
          entitlementsInherit: "build/entitlements.mac.plist"
        },

        dmg: {
          sign: false
        },

        afterSign: "notarize.js",

        win: {
          icon: "build/icon.ico"
        },

        publish: publishingOptions
      },

      chainWebpackMainProcess: config => {
        config.module
          .rule("nodeloader")
          .test(/\.node$/)
          .use("nodeloader")
          .loader("node-loader");

        config
          .plugin("define")
          .use(DefinePlugin, [{ "process.env.FLUENTFFMPEG_COV": false }]);
      },

      chainWebpackRendererProcess: config => {
        config.plugin("define").use(DefinePlugin, [
          {
            "process.env": {
              NODE_ENV: '"production"',
              BASE_URL: "`app://./`",
              IS_ELECTRON: true
            }
          }
        ]);

        return config;
      }
    }
  }
};
