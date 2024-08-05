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
  folder: "video",
  identifier: "📹",

  // Requests stream writing to the video folder
  folderAccess: ["video"],

  fileTypes: [
    // @todo regex match
    "mp4",
    "webv"
  ],

  /**
   * Takes in a readable stream, processes file accordingly and outputs file location plus stream
   *
   * @param {Stream}   options.file                   Readable stream of file.
   * @param {String}   options.fileName               The file's name.
   * @param {String}   options.fileType               The file's extension type e.g. .jpeg.
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
  process() {
    return new Promise(resolve => {
      resolve(true);
    });
  }
};
