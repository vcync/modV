import { streamToString } from "../media-manager-utils/stream-to-string";
const fs = require("fs");
const path = require("path");
const util = require("util");
const webpack = require("webpack");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

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
  folder: "isf",
  identifier: "🌈",

  // Requests stream writing to the video folder
  folderAccess: ["isf/compiled"],

  fileTypes: [
    // @todo regex match
    "fs",
  ],

  ignored: [/isf[\\/]compiled/, /isf[\\/]temp/],

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
  async process({ filePath, fileName, file }) {
    return {
      filePath: await compileModule({ filePath, fileName, file }),
      folder: "isf/compiled",
    };
  },
};

function compileModule({ filePath, fileName, file }) {
  return new Promise(async (resolve) => {
    // Default vertex shader from ISF that is used when the user didn't specify anything
    let vertexShader = "void main() {isf_vertShaderInit();}";
    let fragmentShader;

    // Load the vertex shader
    try {
      vertexShader = await readFile(filePath.replace(".fs", ".vs"), "utf8");
    } catch (err) {
      // Don't show warning when error is because the file doesn't exist
      if (err.code !== "ENOENT") {
        console.warn(err);
      }
    }

    // Convert the fragment shader stream into a string
    try {
      fragmentShader = await streamToString(file);
    } catch (err) {
      console.error(err);
    }

    // Create the module so that modV can understand it as this is the default format
    const isfModule = {
      meta: {
        name: fileName.replace(/(\.\/|\.fs)/g, ""),
        author: "",
        version: "1.0.0",
        type: "isf",
      },
      fragmentShader,
      vertexShader,
    };

    const tempFilePath = path.join(
      path.dirname(filePath),
      "temp",
      path.basename(filePath),
    );

    const tempDirectoryPath = path.join(path.dirname(filePath), "temp");

    try {
      await mkdir(tempDirectoryPath);
    } catch (err) {
      if (err) {
        // don't log errors if the folder already exists
        if (err.code !== "EEXIST") {
          console.error(err);
        }
      }
    }

    const compiledFilePath = path.join(
      path.dirname(filePath),
      "compiled",
      path.basename(filePath),
    );

    const compiledDirectoryPath = path.join(path.dirname(filePath), "compiled");

    try {
      await mkdir(compiledDirectoryPath);
    } catch (err) {
      if (err) {
        // don't log errors if the folder already exists
        if (err.code !== "EEXIST") {
          console.error(err);
        }
      }
    }

    const json = JSON.stringify(isfModule);

    await writeFile(tempFilePath, `export default ${json}`);

    const webpackConfig = {
      entry: tempFilePath,
      output: {
        path: compiledDirectoryPath,
        filename: path.basename(filePath),
        libraryTarget: "var",
      },
      resolveLoader: {
        modules: ["node_modules", __dirname + "/node_modules"],
      },
    };

    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        const statsJson = stats.toJson("minimal");
        const canada = statsJson.errors;
        for (let i = 0, len = canada.length; i < len; i++) {
          console.log(canada[i]);
        }
        console.error(err);
      }

      // 3. save compiled module to user media directory

      // 4. update modv clients with new file contents (then eval in modv)
      resolve(compiledFilePath);
    });
  });
}
