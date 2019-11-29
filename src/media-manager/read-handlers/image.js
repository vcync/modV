const animated = require("animated-gif-detector");
// const ffbinaries = require("ffbinaries");
const Ffmpeg = require("fluent-ffmpeg");

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
  folder: "image",
  identifier: "🖼",

  // Requests stream writing to the video folder
  folderAccess: ["video"],

  fileTypes: [
    // @todo regex match
    "jpg",
    "jpeg",
    "png",
    "gif"
  ],

  ignore: ["processed-gifs"],

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
  process({ file, fileName, fileType }, { getStream, log }) {
    return new Promise((resolve, reject) => {
      if (fileType !== "gif" && animated(file)) {
        log("Converting animated gif to video");

        const outputStream = getStream();

        Ffmpeg(file)
          .inputFormat("gif")
          .format("mp4")
          .noAudio()
          .videoCodec("libx264")
          .on("error", err => {
            reject(
              new Error(
                `An error occurred converting ${fileName}:`,
                err.message
              )
            );
          })
          .on("end", () => {
            resolve({
              file: outputStream,
              folder: "video"
            });
          })
          .pipe(
            outputStream,
            { end: true }
          );
      } else {
        resolve(true);
      }

      reject(new Error("Unknown error"));
    });
  }

  /**
   * Called before File Handler is added to the Media Manager.
   * Should return a Promise resolving true or a FileOutputContext if the File Handler is ready to
   * be added to the Media Manager.
   * This function can be omitted if no checks or pre-requisites need to be made or fetched.
   *
   * @param {String}   options.binaryPath  Path to a common binaries folder to store binaries the
   *                                       handler may require.
   * @param {Function} options.exists      async Function which returns true if a file or folder
   *                                       exists, false otherwise.
   * @param {Function} options.join        Function to join paths together with the appropriate
   *                                       filesystem delimiter. Similar to fs.join.
   * @param {Function} util.log            Log something to the console.
   *
   * @return {Promise<true|FileOutputContext>}
   */
  // init({ binaryPath, exists, join }, { log }) {
  // return new Promise(resolve => resolve(true));
  // return new Promise((resolve, reject) => {
  //   const ffmpegCommand = new Ffmpeg();

  //   function gotPath(path) {
  //     Ffmpeg.setFfmpegPath(path);
  //     resolve({
  //       file: path,
  //     });
  //   }

  //   function download(dest, platform, destFfmpeg) {
  //     ffbinaries.downloadFiles({ components: ['ffmpeg'], destination: dest }, () => {
  //       log(`Downloaded ffmpeg for ${platform}`);
  //       gotPath(destFfmpeg);
  //     });
  //   }

  //   /* eslint-disable no-underscore-dangle */
  //   ffmpegCommand._getFfmpegPath((err, result) => {
  //     if (err || result.trim() === '') {
  //       const dest = binaryPath;
  //       let destFfmpeg = join(dest, 'ffmpeg');
  //       const platform = ffbinaries.detectPlatform();
  //       const isWin = /^win/.test(process.platform);

  //       if (isWin) destFfmpeg += '.exe';

  //       exists(destFfmpeg, (err) => {
  //         if (err && err.code === 'ENOENT') {
  //           log('‼️  ffmpeg not found locally, in environment or within path');

  //           yesno.ask(`Do you want to download ffmpeg locally for platform ${platform}? (yes)`, true, (ok) => {
  //             if (ok) {
  //               download(dest, platform, destFfmpeg);
  //             } else {
  //               reject('ffmpeg is required, user denied ffmpeg download');
  //             }
  //           });
  //         } else {
  //           log('ffmpeg found locally for platform', platform);
  //           gotPath(destFfmpeg);
  //         }
  //       });
  //     } else {
  //       log('ffmpeg found in path or environment');
  //       gotPath(result);
  //     }
  //   });
  // });
  // }
};
