const recursiveDeps = require("recursive-deps");
const webpack = require("webpack-3");
const path = require("path");
const npm = require("npm");
const fs = require("fs");

/**
 * @typedef {OutputFileContext}
 * @property {Stream|String} file      Processed file or file path
 * @property {String}        [folder]  Folder in which to save processed file
 */

/**
 * @typedef {ReadHandler}
 * @property {String} folder                  The folder name to watch
 * @property {String} identifier              An identifier for logging (usually a single emoji)
 * @property {Array<String>} folderAccess     A list of folder names for Stream writing
 * @property {Array<String|Regex>} fileTypes  File types to match this File Handler against
 * @property {Function} init                  Called before File Hander is added, for setup
 * @property {Function} process               Function to process matched files
 */
export default {
  folder: "module",
  identifier: "📄",

  // Requests stream writing to the video folder
  folderAccess: ["module/compiled"],

  fileTypes: [
    // @todo regex match
    "js"
  ],

  ignored: [/module[\\/]compiled/],

  /**
   * Takes in a readable stream, processes file accordingly and outputs file location plus stream
   *
   * @param {Stream}   options.file                   Readable stream of file.
   * @param {String}   options.fileName               The file's name.
   * @param {String}   options.fileType               The file's extension type e.g. .jpeg.
   * @param {String}   options.filePath               The path to the file.
   * @param {Function} util.log                       Log something to the console.
   *
   * @return {Promise<true|OutputFileContext|Error>}  A Promise resolving with `true` if the file
   *                                                  needed no modification and can remain in the
   *                                                  same folder.
   *                                                  A Promise resolving a `OutputFileContext` if
   *                                                  the file required processing.
   *                                                  A Promise rejecting with `Error` if something
   *                                                  went wrong.
   */
  async process({ filePath }, { log }) {
    return {
      filePath: await compileModule(filePath, log),
      folder: "module/compiled"
    };
  }
};

const ensurePackageJson = ({ dirPath }) => {
  const packageJsonPath = path.join(dirPath, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    fs.writeFileSync(packageJsonPath, "{}", { encoding: "utf8" });
  }
};

function doWebpack(filePath) {
  return new Promise((resolve, reject) => {
    // 2. webpack compilation
    // ---
    // @todo figure out a way to allow modv and local
    // classes/libs (three.js/Module/Module2D/ModuleISF etc)
    // to be skipped here so extra data doesn't need transferring

    const webpackConfig = {
      entry: filePath,
      output: {
        path: path.join(path.dirname(filePath), "compiled"),
        filename: path.basename(filePath),
        libraryTarget: "var"
      },
      resolveLoader: {
        modules: ["node_modules", __dirname + "/node_modules"]
      }
    };

    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        const statsJson = stats.toJson("minimal");
        const canada = statsJson.errors;
        for (let i = 0, len = canada.length; i < len; i++) {
          console.log(canada[i]);
        }
        reject(err);
      }

      // 3. save compiled module to user media directory

      // 4. update modv clients with new file contents (then eval in modv)
      resolve(
        path.join(path.dirname(filePath), "compiled", path.basename(filePath))
      );
    });
  });
}

async function compileModule(filePath, log) {
  return new Promise((resolve, reject) => {
    const dirPath = path.dirname(filePath);

    // 1. install file deps
    //
    // Shameless clone of szymonkaliski's awesome Neutron
    // https://github.com/szymonkaliski/Neutron/blob/b8523e0efa3a7cc8bf5fcafc753d3d01b3c5338c/src/index.js#L54
    recursiveDeps(filePath).then(dependencies => {
      if (!dependencies.length) {
        resolve(doWebpack(filePath));
      }

      ensurePackageJson({ dirPath });

      npm.load(
        {
          color: false,
          loglevel: "silent",
          maxsockets: 1,
          parseable: true,
          prefix: dirPath,
          progress: true,
          save: true,
          unicode: false
        },
        err => {
          if (err) {
            reject(err);
          }

          npm.commands.ls(dependencies, (_, data) => {
            const installedDeps = Object.keys(data.dependencies).filter(
              key => data.dependencies[key].missing === undefined
            );

            const missingDeps = dependencies.filter(
              dep => installedDeps.indexOf(dep) < 0
            );

            if (missingDeps.length) {
              log("🛒  Installing", dependencies.join(", "), "for", filePath);

              npm.commands.install(missingDeps, err => {
                if (err) {
                  reject(err);
                }

                log("🛍  Installed!");
                resolve(doWebpack(filePath));
              });
            } else {
              resolve(doWebpack(filePath));
            }
          });
        }
      );
    });
  });
}
