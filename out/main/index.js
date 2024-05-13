"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const fs$5 = require("fs");
const path$6 = require("path");
const ospath = require("ospath");
const vuex = require("vuex");
const util$1 = require("util");
const os$1 = require("node:os");
const APP_SCHEME = "modv";
function initialState$3() {
  return {};
}
const getters$3 = {
  ignored: (state) => Object.values(state).reduce(
    (arr, folder) => arr.concat(folder.reduce((arr2, rh) => arr2.concat(rh.ignored), [])),
    []
  ),
  forFileType: (state) => (folder, type) => state[folder] && state[folder].filter((rh) => rh.fileTypes.indexOf(type) > -1),
  folders: (state) => Object.keys(state)
};
const actions$3 = {
  addHandler({ commit }, { readHandler }) {
    return new Promise((resolve) => {
      commit("ADD", { folder: readHandler.folder, readHandler });
      resolve();
    });
  }
};
const mutations$3 = {
  ADD(state, { folder, readHandler }) {
    if (!state[folder]) {
      state[folder] = [];
    }
    state[folder].push(readHandler);
  },
  RESET_STATE(state) {
    const s = initialState$3();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];
      state[key] = s[key];
    }
  }
};
const readHandlers = {
  namespaced: true,
  state: initialState$3,
  getters: getters$3,
  actions: actions$3,
  mutations: mutations$3
};
function initialState$2() {
  return {};
}
const getters$2 = {
  ignored: (state) => Object.values(state).reduce(
    (arr, folder) => arr.concat(folder.reduce((arr2, sh) => arr2.concat(sh.ignored), [])),
    []
  ),
  forFileType: (state) => (folder, type) => state[folder] && state[folder].filter((sh) => sh.fileTypes.indexOf(type) > -1),
  folders: (state) => Object.keys(state)
};
const actions$2 = {
  addHandler({ commit }, { saveHandler }) {
    return new Promise((resolve) => {
      commit("ADD", saveHandler);
      resolve();
    });
  }
};
const mutations$2 = {
  ADD(state, saveHandler) {
    state[saveHandler.folder] = saveHandler;
  },
  RESET_STATE(state) {
    const s = initialState$2();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];
      state[key] = s[key];
    }
  }
};
const saveHandlers = {
  namespaced: true,
  state: initialState$2,
  getters: getters$2,
  actions: actions$2,
  mutations: mutations$2
};
function initialState$1() {
  return {
    media: {},
    path: null
  };
}
const getters$1 = {
  projects: (state) => Object.keys(state.media).sort((a, b) => a.localeCompare(b))
};
const actions$1 = {
  async addMedia({ commit }, { project, folder, item }) {
    commit("ADD", { project, folder, item });
  },
  // only runs in modV worker
  async setState({ commit }, newState) {
    commit("CLEAR_MEDIA_STATE");
    await this.dispatch("media/setMediaDirectoryPath", { path: newState.path });
    const projectKeys = Object.keys(newState.media);
    for (let i = 0, len = projectKeys.length; i < len; i++) {
      const projectKey = projectKeys[i];
      const folderKeys = Object.keys(newState.media[projectKey]);
      for (let j = 0, len2 = folderKeys.length; j < len2; j++) {
        const folderKey = folderKeys[j];
        const items = Object.values(newState.media[projectKey][folderKey]);
        for (let k = 0, len3 = items.length; k < len3; k++) {
          const item = items[k];
          await this.dispatch("media/addMedia", {
            project: projectKey,
            folder: folderKey,
            item
          });
        }
      }
    }
  },
  setMediaDirectoryPath({ commit }, { path: path2 }) {
    commit("SET_MEDIA_DIRECTORY_PATH", { path: path2 });
  }
};
const mutations$1 = {
  ADD(state, { project, folder, item }) {
    if (!state.media[project]) {
      state.media[project] = {};
    }
    if (!state.media[project][folder]) {
      state.media[project][folder] = {};
    }
    state.media[project][folder][item.name] = item;
  },
  CLEAR_MEDIA_STATE(state) {
    const stateMediaKeys = Object.keys(state.media);
    for (let i = 0, len = stateMediaKeys.length; i < len; i++) {
      const key = stateMediaKeys[i];
      delete state.media[key];
    }
  },
  RESET_STATE(state) {
    const s = initialState$1();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];
      state[key] = s[key];
    }
  },
  SET_MEDIA_DIRECTORY_PATH(state, { path: path2 }) {
    state.path = path2;
  }
};
const media = {
  namespaced: true,
  state: initialState$1,
  getters: getters$1,
  actions: actions$1,
  mutations: mutations$1
};
function initialState() {
  return {
    plugins: {},
    pluginData: {}
  };
}
const getters = {};
const actions = {
  addMedia({ commit }, { project, folder, item }) {
    return new Promise((resolve) => {
      commit("ADD", { project, folder, item });
      resolve();
    });
  }
};
const mutations = {
  ADD(state, { project, folder, item }) {
    if (!state[project]) {
      state[project] = {};
    }
    if (!state[project][folder]) {
      state[project][folder] = [];
    }
    state[project][folder].push(item);
  },
  RESET_STATE(state) {
    const s = initialState();
    const stateKeys = Object.keys(s);
    for (let i = 0, len = stateKeys.length; i < len; i++) {
      const key = stateKeys[i];
      state[key] = s[key];
    }
  }
};
const plugins = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};
const modules = {
  readHandlers,
  saveHandlers,
  media,
  plugins
};
const store = vuex.createStore({
  strict: false,
  modules,
  actions: {
    resetAll({ commit }) {
      const moduleKeys = Object.keys(modules);
      for (let i = 0, len = moduleKeys.length; i < len; i++) {
        const moduleKey = moduleKeys[i];
        commit(`${moduleKey}/RESET_STATE`);
      }
    }
  }
});
const consoleLog = console.log;
const consoleError = console.error;
function log(...argsIn) {
  const delta = /* @__PURE__ */ new Date();
  const args = [];
  args.push(`[${delta.toLocaleTimeString()}]:`);
  for (let i = 0; i < argsIn.length; i += 1) {
    args.push(argsIn[i]);
  }
  consoleLog.apply(console, args);
}
function logError(...argsIn) {
  const delta = /* @__PURE__ */ new Date();
  const args = [];
  args.push(`[${delta.toLocaleTimeString()}]:`);
  for (let i = 0; i < argsIn.length; i += 1) {
    args.push(argsIn[i]);
  }
  consoleError.apply(console, args);
}
const fs$4 = require("fs");
const path$5 = require("path");
async function addReadHandler$1({ readHandler }) {
  let ok = true;
  if (typeof readHandler.init === "function") {
    try {
      ok = await readHandler.init(
        {
          binaryPath: this.binaryPath,
          join: (...args) => path$5.join.call(args),
          exists: (file) => new Promise((resolve, reject) => {
            fs$4.access(file, fs$4.constants.F_OK, (err) => {
              if (err) {
                resolve();
              } else {
                reject();
              }
            });
          })
        },
        {
          log
        }
      );
    } catch (e) {
      ok = false;
      logError(e);
    }
  }
  if (ok) {
    await store.dispatch("readHandlers/addHandler", { readHandler });
    log(`Added ReadHandler for ${readHandler.folder}`);
  }
}
async function addReadHandler({ saveHandler }) {
  await store.dispatch("saveHandlers/addHandler", { saveHandler });
  log(`Added SaveHandler for ${saveHandler.folder}`);
}
const chokidar = require("chokidar");
const os = require("os");
function createWatcher() {
  return new Promise((resolve) => {
    if (this.watcher) {
      this.watcher.close();
    }
    const ignored = [
      os.platform() === "darwin" ? /(^|[/\\])\../ : void 0,
      /node_modules/,
      "**/package.json",
      "**/package-lock.json"
    ].concat(store.getters["readHandlers/ignored"]);
    this.watcher = chokidar.watch(this.mediaDirectoryPath, {
      ignored
    });
    this.watcher.on("add", (filePath) => {
      log(`➕  File ${filePath} has been added`);
      this.readFile(filePath);
    }).on("change", (filePath) => {
      log(`🔄  File ${filePath} has been changed`);
      this.readFile(filePath);
    }).on("unlink", (filePath) => {
      log(`➖  File ${filePath} has been removed`);
      this.removeFile(filePath);
    }).on("ready", () => {
      resolve();
    });
  });
}
const fs$3 = require("fs");
const path$4 = require("path");
async function readFile$1(filePath) {
  const relativePath = filePath.replace(this.mediaDirectoryPath, "");
  const parsed = path$4.parse(relativePath);
  const seperated = relativePath.split(path$4.sep);
  const project = seperated[seperated.length - 3];
  const folder = seperated[seperated.length - 2];
  const fileType = parsed.ext.replace(".", "").toLowerCase();
  const fileName = parsed.name;
  const handlers = store.getters["readHandlers/forFileType"](folder, fileType);
  if (!handlers || !handlers.length) {
    return;
  }
  for (let i = 0, len = handlers.length; i < len; i++) {
    const handler = handlers[i];
    const file = fs$3.createReadStream(filePath, { encoding: "utf8" });
    const processResult = await handler.process(
      {
        file,
        fileName,
        fileType,
        filePath
      },
      {
        getStream: () => {
        },
        log
      }
    );
    if (processResult && typeof processResult === "boolean") {
      store.dispatch("media/addMedia", {
        project,
        folder,
        item: {
          name: fileName,
          path: relativePath
        }
      });
    } else if (processResult && typeof processResult === "object") {
      const { filePath: path2 } = processResult;
      const relativePath2 = path2.replace(this.mediaDirectoryPath, "");
      store.dispatch("media/addMedia", {
        project,
        folder,
        item: {
          name: fileName,
          path: relativePath2
        }
      });
    }
  }
}
function parseMessage(message, connection) {
  const parsed = JSON.parse(message);
  log(`Received message from client: ${message}`);
  if ("request" in parsed) {
    switch (parsed.request) {
      default:
        break;
      case "update":
        this.broadcast(
          JSON.stringify({
            type: "media/UPDATE",
            payload: {
              media: store.state.media,
              plugins: store.state.plugins
            }
          })
        );
        break;
      case "save-option":
        this.writeOptions(parsed.key, parsed.value);
        break;
      case "set-folder":
        this.changeDirectory(parsed.folder);
        break;
      case "make-profile":
        if (this.makeProfile(parsed.profileName)) {
          this.getOrMakeProfile(parsed.profileName);
          this.updateClients();
        }
        break;
      case "save-preset":
        this.writePreset(
          parsed.name,
          parsed.payload,
          parsed.profile,
          connection
        );
        break;
      case "save-palette":
        this.writePalette(
          parsed.name,
          parsed.payload,
          parsed.profile,
          connection
        );
        break;
      case "save-plugin":
        this.writePlugin(
          parsed.name,
          parsed.payload,
          parsed.profile,
          connection
        );
        break;
    }
  }
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var path$3 = path$6;
var fs$2 = fs$5;
var _0777 = parseInt("0777", 8);
var mkdirp$2 = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
function mkdirP(p, opts, f, made) {
  if (typeof opts === "function") {
    f = opts;
    opts = {};
  } else if (!opts || typeof opts !== "object") {
    opts = { mode: opts };
  }
  var mode = opts.mode;
  var xfs = opts.fs || fs$2;
  if (mode === void 0) {
    mode = _0777;
  }
  if (!made)
    made = null;
  var cb = f || /* istanbul ignore next */
  function() {
  };
  p = path$3.resolve(p);
  xfs.mkdir(p, mode, function(er) {
    if (!er) {
      made = made || p;
      return cb(null, made);
    }
    switch (er.code) {
      case "ENOENT":
        if (path$3.dirname(p) === p)
          return cb(er);
        mkdirP(path$3.dirname(p), opts, function(er2, made2) {
          if (er2)
            cb(er2, made2);
          else
            mkdirP(p, opts, cb, made2);
        });
        break;
      default:
        xfs.stat(p, function(er2, stat) {
          if (er2 || !stat.isDirectory())
            cb(er, made);
          else
            cb(null, made);
        });
        break;
    }
  });
}
mkdirP.sync = function sync(p, opts, made) {
  if (!opts || typeof opts !== "object") {
    opts = { mode: opts };
  }
  var mode = opts.mode;
  var xfs = opts.fs || fs$2;
  if (mode === void 0) {
    mode = _0777;
  }
  if (!made)
    made = null;
  p = path$3.resolve(p);
  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    switch (err0.code) {
      case "ENOENT":
        made = sync(path$3.dirname(p), opts, made);
        sync(p, opts, made);
        break;
      default:
        var stat;
        try {
          stat = xfs.statSync(p);
        } catch (err1) {
          throw err0;
        }
        if (!stat.isDirectory())
          throw err0;
        break;
    }
  }
  return made;
};
const mkdirpTop = /* @__PURE__ */ getDefaultExportFromCjs(mkdirp$2);
const mkdirp$1 = util$1.promisify(mkdirpTop);
async function fsCreateProfile(profileName) {
  await mkdirp$1(path$6.join(this.mediaDirectoryPath, profileName));
  const promises = [
    ...store.getters["readHandlers/folders"].map(
      (folder) => mkdirp$1(path$6.join(this.mediaDirectoryPath, profileName, folder))
    )
  ];
  return Promise.all(promises);
}
const animated = require("animated-gif-detector");
const Ffmpeg = require("fluent-ffmpeg");
const imageReadHandler = {
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
  ignored: ["processed-gifs"],
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
  process({ file, fileName, fileType }, { getStream, log: log2 }) {
    return new Promise((resolve, reject) => {
      if (fileType !== "gif" && animated(file)) {
        log2("Converting animated gif to video");
        const outputStream = getStream();
        Ffmpeg(file).inputFormat("gif").format("mp4").noAudio().videoCodec("libx264").on("error", (err) => {
          reject(
            new Error(
              `An error occurred converting ${fileName}:`,
              err.message
            )
          );
        }).on("end", () => {
          resolve({
            filePath: outputStream,
            folder: "video"
          });
        }).pipe(outputStream, { end: true });
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
const paletteReadHandler = {
  folder: "palette",
  identifier: "🎨",
  fileTypes: ["json"],
  process() {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
};
const presetReadHandler = {
  folder: "preset",
  identifier: "📜",
  fileTypes: ["json"],
  process() {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
};
const recursiveDeps = require("recursive-deps");
const webpack$1 = require("webpack");
const path$2 = require("path");
const npm = require("npm");
const fs$1 = require("fs");
const moduleReadHandler = {
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
  async process({ filePath }, { log: log2 }) {
    return {
      filePath: await compileModule$1(filePath, log2),
      folder: "module/compiled"
    };
  }
};
const ensurePackageJson = ({ dirPath }) => {
  const packageJsonPath = path$2.join(dirPath, "package.json");
  if (!fs$1.existsSync(packageJsonPath)) {
    fs$1.writeFileSync(packageJsonPath, "{}", { encoding: "utf8" });
  }
};
function doWebpack(filePath) {
  return new Promise((resolve, reject) => {
    const webpackConfig = {
      entry: filePath,
      output: {
        path: path$2.join(path$2.dirname(filePath), "compiled"),
        filename: path$2.basename(filePath),
        libraryTarget: "var"
      },
      resolveLoader: {
        modules: ["node_modules", __dirname + "/node_modules"]
      }
    };
    webpack$1(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        const statsJson = stats.toJson("minimal");
        const canada = statsJson.errors;
        for (let i = 0, len = canada.length; i < len; i++) {
          console.log(canada[i]);
        }
        reject(err);
      }
      resolve(
        path$2.join(path$2.dirname(filePath), "compiled", path$2.basename(filePath))
      );
    });
  });
}
async function compileModule$1(filePath, log2) {
  return new Promise((resolve, reject) => {
    const dirPath = path$2.dirname(filePath);
    recursiveDeps(filePath).then((dependencies) => {
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
        (err) => {
          if (err) {
            reject(err);
          }
          npm.commands.ls(dependencies, (_, data) => {
            const installedDeps = Object.keys(data.dependencies).filter(
              (key) => data.dependencies[key].missing === void 0
            );
            const missingDeps = dependencies.filter(
              (dep) => installedDeps.indexOf(dep) < 0
            );
            if (missingDeps.length) {
              log2("🛒  Installing", dependencies.join(", "), "for", filePath);
              npm.commands.install(missingDeps, (err2) => {
                if (err2) {
                  reject(err2);
                }
                log2("🛍  Installed!");
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
function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}
const fs = require("fs");
const path$1 = require("path");
const util = require("util");
const webpack = require("webpack");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const isfReadHandler = {
  folder: "isf",
  identifier: "🌈",
  // Requests stream writing to the video folder
  folderAccess: ["isf/compiled"],
  fileTypes: [
    // @todo regex match
    "fs"
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
      folder: "isf/compiled"
    };
  }
};
function compileModule({ filePath, fileName, file }) {
  return new Promise(async (resolve) => {
    let vertexShader = "void main() {isf_vertShaderInit();}";
    let fragmentShader;
    try {
      vertexShader = await readFile(filePath.replace(".fs", ".vs"), "utf8");
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.warn(err);
      }
    }
    try {
      fragmentShader = await streamToString(file);
    } catch (err) {
      console.error(err);
    }
    const isfModule = {
      meta: {
        name: fileName.replace(/(\.\/|\.fs)/g, ""),
        author: "",
        version: "1.0.0",
        type: "isf"
      },
      fragmentShader,
      vertexShader
    };
    const tempFilePath = path$1.join(
      path$1.dirname(filePath),
      "temp",
      path$1.basename(filePath)
    );
    const tempDirectoryPath = path$1.join(path$1.dirname(filePath), "temp");
    try {
      await mkdir(tempDirectoryPath);
    } catch (err) {
      if (err) {
        if (err.code !== "EEXIST") {
          console.error(err);
        }
      }
    }
    const compiledFilePath = path$1.join(
      path$1.dirname(filePath),
      "compiled",
      path$1.basename(filePath)
    );
    const compiledDirectoryPath = path$1.join(path$1.dirname(filePath), "compiled");
    try {
      await mkdir(compiledDirectoryPath);
    } catch (err) {
      if (err) {
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
        filename: path$1.basename(filePath),
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
        console.error(err);
      }
      resolve(compiledFilePath);
    });
  });
}
const videoReadHandler = {
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
    return new Promise((resolve) => {
      resolve(true);
    });
  }
};
const presetSaveHandler = {
  folder: "preset",
  identifier: "📜",
  fileTypes: ["json"],
  process() {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
};
const mkdirp = util$1.promisify(mkdirpTop);
class MediaManager {
  get dataPath() {
    return path$6.join(ospath.data(), "modV");
  }
  get mediaDirectoryPath() {
    return path$6.join(this.dataPath, "media");
  }
  constructor(options) {
    const defaults = {
      mediaFolderName: "media"
    };
    this.addReadHandler = addReadHandler$1.bind(this);
    this.addSaveHandler = addReadHandler.bind(this);
    this.createWatcher = createWatcher.bind(this);
    this.readFile = readFile$1.bind(this);
    this.parseMessage = parseMessage.bind(this);
    this.fsCreateProfile = fsCreateProfile.bind(this);
    this.$store = store;
    this.update = () => {
      if (options.update) {
        options.update(...arguments);
      }
    };
    this.pathChanged = () => {
      if (options.pathChanged) {
        options.pathChanged(...arguments);
      }
    };
    Object.assign(this, defaults, options);
    this.addReadHandler({ readHandler: imageReadHandler });
    this.addReadHandler({ readHandler: paletteReadHandler });
    this.addReadHandler({ readHandler: presetReadHandler });
    this.addReadHandler({ readHandler: moduleReadHandler });
    this.addReadHandler({ readHandler: isfReadHandler });
    this.addReadHandler({ readHandler: videoReadHandler });
    this.addSaveHandler({ saveHandler: presetSaveHandler });
    store.subscribe((mutation) => {
      if (mutation.type.split("/")[0] !== "media") {
        return;
      } else if (mutation.type === "media/SET_MEDIA_DIRECTORY_PATH") {
        this.pathChanged(mutation);
        return;
      }
      this.update(mutation);
    });
    (async () => {
      try {
        await fs$5.promises.access(path$6.join(this.mediaDirectoryPath));
      } catch (error) {
        await mkdirp(this.mediaDirectoryPath);
      }
      try {
        await fs$5.promises.access(path$6.join(this.mediaDirectoryPath, "default"));
      } catch (error) {
        this.fsCreateProfile("default");
      }
    })();
  }
  async start() {
    await store.dispatch("media/setMediaDirectoryPath", {
      path: this.mediaDirectoryPath
    });
    await this.createWatcher();
  }
  async reset() {
    await store.dispatch("resetAll");
    await store.dispatch("media/setMediaDirectoryPath", {
      path: this.mediaDirectoryPath
    });
  }
  async saveFile({ what, name, fileType, project, payload }) {
    const { saveHandlers: saveHandlers2 } = store.state;
    if (!name) {
      throw new Error("Cannot save without a name");
    }
    if (!fileType) {
      throw new Error("Cannot save without a file type");
    }
    if (!project) {
      throw new Error("Cannot save without a project");
    }
    if (!saveHandlers2[what]) {
      throw new Error(`No save handler for "${what}"`);
    }
    const handler = saveHandlers2[what];
    if (handler.fileTypes.indexOf(fileType) < -1) {
      throw new Error(
        `The "${what}" save handler cannot save files with a type of "${fileType}"`
      );
    }
    await fs$5.promises.writeFile(
      path$6.join(
        this.mediaDirectoryPath,
        project,
        handler.folder,
        `${name}.${fileType}`
      ),
      payload
    );
    return true;
  }
}
let projectNames = ["default"];
let currentProject = "default";
function setCurrentProject(name) {
  currentProject = name;
  windows["mainWindow"].webContents.send("set-current-project", name);
}
function setProjectNames(names = ["default"]) {
  projectNames = names;
}
let mediaManager;
function getMediaManager() {
  if (!mediaManager) {
    mediaManager = new MediaManager({
      update(message) {
        window.webContents.send("media-manager-update", message);
        setProjectNames(mediaManager.$store.getters["media/projects"]);
        updateMenu();
      },
      pathChanged(message) {
        window.webContents.send("media-manager-path-changed", message);
      }
    });
  }
  return mediaManager;
}
const isMac = process.platform === "darwin";
let lastFileSavedPath = null;
async function save(filePath) {
  let result;
  if (!filePath) {
    result = await electron.dialog.showSaveDialog(windows["mainWindow"], {
      defaultPath: lastFileSavedPath || "preset.json",
      filters: [{ name: "Presets", extensions: ["json"] }]
    });
    if (result.canceled) {
      return;
    }
  }
  try {
    await writePresetToFile(filePath ?? result.filePath);
    lastFileSavedPath = path$6.resolve(filePath ?? result.filePath);
    updateMenu();
  } catch (e) {
    console.error(e);
  }
  windows["mainWindow"].setRepresentedFilename(lastFileSavedPath);
  windows["mainWindow"].setDocumentEdited(false);
  windows["mainWindow"].setTitle(path$6.basename(lastFileSavedPath));
}
async function writePresetToFile(filePath) {
  electron.ipcMain.once("preset-data", async (_, presetData) => {
    try {
      await fs$5.promises.writeFile(filePath, presetData);
    } catch (e) {
      electron.dialog.showMessageBox(windows["mainWindow"], {
        type: "error",
        message: "Could not save preset to file",
        detail: e.toString()
      });
    }
  });
  try {
    windows["mainWindow"].webContents.send("generate-preset");
  } catch (e) {
    electron.dialog.showMessageBox(windows["mainWindow"], {
      type: "error",
      message: "Could not generate preset",
      detail: e.toString()
    });
  }
}
function generateMenuTemplate() {
  const mediaManager2 = getMediaManager();
  return [
    // { role: 'appMenu' }
    ...isMac ? [
      {
        label: electron.app.name,
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "services" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideothers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" }
        ]
      }
    ] : [],
    // { role: 'fileMenu' }
    {
      label: "File",
      submenu: [
        {
          label: "Open Preset",
          accelerator: "CmdOrCtrl+O",
          async click() {
            const result = await electron.dialog.showOpenDialog(windows["mainWindow"], {
              filters: [
                { name: "Presets", extensions: ["json"] },
                { name: "All Files", extensions: ["*"] }
              ],
              properties: ["openFile"],
              multiSelections: false
            });
            if (!result.canceled) {
              const filePath = result.filePaths[0];
              openFile(filePath);
              windows["mainWindow"].setRepresentedFilename(filePath);
              windows["mainWindow"].setDocumentEdited(false);
              windows["mainWindow"].setTitle(path$6.basename(filePath));
            }
          }
        },
        ...isMac ? [
          {
            label: "Open Recent",
            role: "recentdocuments",
            submenu: [
              {
                label: "Clear Recent",
                role: "clearrecentdocuments"
              }
            ]
          }
        ] : [],
        { type: "separator" },
        {
          label: "Save Preset",
          accelerator: "CmdOrCtrl+S",
          async click() {
            save(lastFileSavedPath);
          }
        },
        {
          label: "Save Preset As…",
          accelerator: "CmdOrCtrl+Shift+S",
          async click() {
            save();
          }
        },
        { type: "separator" },
        {
          label: "Open Media folder",
          async click() {
            if (mediaManager2.mediaDirectoryPath) {
              const failed = await electron.shell.openPath(
                mediaManager2.mediaDirectoryPath
              );
              if (failed) {
                console.error(failed);
              }
            }
          }
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" }
      ]
    },
    // { role: 'editMenu' }
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...isMac ? [
          { role: "pasteAndMatchStyle" },
          { role: "delete" },
          { role: "selectAll" },
          { type: "separator" },
          {
            label: "Speech",
            submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
          }
        ] : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]
      ]
    },
    // { role: 'projectMenu' }
    {
      label: "Project",
      submenu: [
        ...projectNames.map((name) => ({
          label: name,
          type: "checkbox",
          checked: currentProject === name,
          click: () => setCurrentProject(name)
        }))
      ]
    },
    // { role: 'viewMenu' }
    {
      label: "View",
      submenu: [
        {
          label: "New Output Window",
          click: () => {
            windows["mainWindow"].webContents.send("create-output-window");
          }
        },
        { type: "separator" },
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { type: "separator" },
        {
          label: "Reset layout",
          async click() {
            const { response } = await electron.dialog.showMessageBox(
              windows["mainWindow"],
              {
                type: "question",
                buttons: ["Yes", "No"],
                message: "modV",
                detail: "Are you sure you want to reset the current layout?"
              }
            );
            if (response === 0) {
              windows["mainWindow"].webContents.send("reset-layout");
            }
          }
        }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...isMac ? [
          { type: "separator" },
          { role: "front" },
          { type: "separator" },
          { role: "window" }
        ] : [{ role: "close" }]
      ]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn modV",
          click() {
            const { shell } = require("electron");
            shell.openExternal("https://modv.js.org");
          }
        },
        {
          label: "Search or ask a question",
          click() {
            const { shell } = require("electron");
            shell.openExternal("https://github.com/vcync/modV/discussions");
          }
        }
      ]
    }
  ];
}
function updateMenu(setWindowListener) {
  if (setWindowListener) {
    windows["mainWindow"].on("ready-to-show", () => {
      lastFileSavedPath = null;
      updateMenu();
    });
  }
  const menu = electron.Menu.buildFromTemplate(generateMenuTemplate());
  electron.Menu.setApplicationMenu(menu);
}
async function getMediaPermission() {
  let accessGrantedMicrophone = false;
  let accessGrantedCamera = false;
  accessGrantedMicrophone = await electron.systemPreferences.askForMediaAccess(
    "microphone"
  );
  accessGrantedCamera = await electron.systemPreferences.askForMediaAccess("camera");
  return accessGrantedMicrophone && accessGrantedCamera;
}
async function checkMediaPermission() {
  const { platform } = process;
  let macOSMediaDialogsAccepted = false;
  let hasMediaPermission = false;
  const microphoneAccessStatus = electron.systemPreferences.getMediaAccessStatus(
    "microphone"
  );
  const cameraAccessStatus = electron.systemPreferences.getMediaAccessStatus("camera");
  hasMediaPermission = microphoneAccessStatus === "granted" && cameraAccessStatus === "granted";
  if (platform === "darwin" && !hasMediaPermission) {
    macOSMediaDialogsAccepted = await getMediaPermission();
  } else if (platform === "darwin" && hasMediaPermission) {
    macOSMediaDialogsAccepted = true;
  }
  if (platform === "win32" && !hasMediaPermission || platform === "darwin" && !macOSMediaDialogsAccepted) {
    electron.dialog.showMessageBox({
      type: "warning",
      message: "modV does not have access to camera or microphone",
      detail: "While modV can still be used without these permissions, some functionality will be limited or broken. Please close modV, update your Security permissions and start modV again."
    });
  }
}
const isDevelopment$1 = process.env.NODE_ENV === "development";
const isTest = process.env.CI === "e2e";
let modVReady = false;
const windowPrefs = {
  colorPicker: {
    devPath: "colorPicker",
    prodPath: "color-picker.html",
    options: {
      webPreferences: {
        contextIsolation: false,
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      },
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      fullscreenable: false
    },
    unique: true,
    create(window2) {
      window2.on("close", (e) => {
        e.preventDefault();
        window2.hide();
      });
      window2.on("blur", () => {
        window2.hide();
      });
    }
  },
  mainWindow: {
    devPath: "",
    prodPath: "index.html",
    options: {
      show: isDevelopment$1,
      webPreferences: {
        preload: path$6.join(__dirname, "../preload/index.js"),
        enableRemoteModule: true,
        // electron 12 sets contextIsolation to true by default, this breaks modV
        contextIsolation: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        nativeWindowOpen: true,
        // window.open return Window object(like in regular browsers), not BrowserWindowProxy
        affinity: "main-window"
        // main window, and additional windows should work in one process
      }
    },
    unique: true,
    beforeCreate() {
      const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
      modVReady = false;
      return {
        options: {
          width,
          height
        }
      };
    },
    async create(window2) {
      require("@electron/remote/main").enable(window2.webContents);
      electron.ipcMain.handle("is-modv-ready", () => modVReady);
      window2.setRepresentedFilename(os$1.homedir());
      window2.setDocumentEdited(true);
      window2.setTitle("Untitled");
      window2.webContents.on(
        "new-window",
        (event, url, frameName, disposition, options) => {
          if (frameName === "modal") {
            event.preventDefault();
            event.newGuest = new electron.BrowserWindow({
              ...options,
              autoHideMenuBar: true,
              closable: false,
              enableLargerThanScreen: true,
              title: ""
            });
            event.newGuest.removeMenu();
          }
        }
      );
      const mm = getMediaManager();
      mm.update = (message) => {
        window2.webContents.send("media-manager-update", message);
        setProjectNames(mm.$store.getters["media/projects"]);
        updateMenu();
      };
      mm.pathChanged = (message) => {
        window2.webContents.send("media-manager-path-changed", message);
      };
      electron.ipcMain.on("open-window", (event, message) => {
        createWindow({ windowName: message }, event);
      });
      electron.ipcMain.on("close-window", (event, message) => {
        closeWindow({ windowName: message });
      });
      electron.ipcMain.on("modv-ready", () => {
        modVReady = true;
        mm.start();
      });
      electron.ipcMain.on("modv-destroy", () => {
        mm.reset();
      });
      electron.ipcMain.on("get-media-manager-state", (event) => {
        event.reply(
          "media-manager-state",
          JSON.parse(JSON.stringify(store.state.media))
        );
      });
      electron.ipcMain.on("save-file", async (event, message) => {
        try {
          mm.saveFile(message);
        } catch (e) {
          event.reply("save-file", e);
        }
        event.reply("save-file", "saved");
      });
      electron.ipcMain.on("current-project", (event, message) => {
        setCurrentProject(message);
        updateMenu();
      });
      electron.ipcMain.on("input-update", (event, message) => {
        window2.webContents.send("input-update", message);
      });
      if (!isDevelopment$1 && !isTest) {
        window2.on("close", async (e) => {
          e.preventDefault();
          const { response } = await electron.dialog.showMessageBox(window2, {
            type: "question",
            buttons: ["Yes", "No"],
            message: "modV",
            detail: "Are you sure you want to quit?"
          });
          if (response === 0) {
            electron.app.exit();
          }
        });
      }
      if (process.platform !== "linux") {
        await checkMediaPermission();
      }
    },
    destroy() {
      electron.ipcMain.removeAllListeners("open-window");
      electron.ipcMain.removeAllListeners("modv-ready");
      electron.ipcMain.removeAllListeners("modv-destroy");
      electron.ipcMain.removeAllListeners("get-media-manager-state");
      electron.ipcMain.removeAllListeners("save-file");
      electron.ipcMain.removeAllListeners("current-project");
      electron.ipcMain.removeAllListeners("input-update");
      electron.ipcMain.removeHandler("is-modv-ready");
    }
  },
  splashScreen: {
    devPath: "splashScreen",
    prodPath: "splash-screen.html",
    options: {
      show: !isDevelopment$1,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      },
      transparent: true,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      fullscreenable: false,
      center: true,
      movable: false,
      backgroundColor: "#00000000",
      hasShadow: false,
      width: 600,
      height: 600
    },
    unique: true,
    async create(window2) {
      electron.ipcMain.on("modv-ready", () => {
        try {
          window2.close();
        } catch (e) {
          console.error(e);
        }
        windows["mainWindow"].maximize();
      });
    }
  }
};
const path = require("path");
const windows = {};
function createWindow({ windowName, options = {} }, event) {
  if (windowPrefs[windowName].unique && windows[windowName]) {
    windows[windowName].focus();
    windows[windowName].show();
    if (event) {
      event.reply("window-ready", {
        id: windows[windowName].webContents.id,
        window: windowName
      });
    }
    return;
  }
  let windowOptions = windowPrefs[windowName].options;
  if (typeof windowPrefs[windowName].beforeCreate === "function") {
    const { options: options2 } = windowPrefs[windowName].beforeCreate();
    windowOptions = { ...windowOptions, ...options2 };
  }
  windows[windowName] = new electron.BrowserWindow({
    ...windowOptions,
    ...options
  });
  updateMenu(true);
  if (typeof windowPrefs[windowName].create === "function") {
    windowPrefs[windowName].create(windows[windowName]);
  }
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    windows[windowName].loadURL(
      process.env["ELECTRON_RENDERER_URL"] + windowPrefs[windowName].devPath
    );
    if (!process.env.IS_TEST) {
      windows[windowName].webContents.openDevTools();
    }
  } else {
    windows[windowName].loadFile(
      path.join(__dirname, `../renderer/${windowPrefs[windowName].prodPath}`)
    );
  }
  windows[windowName].on("closed", () => {
    if (typeof windowPrefs[windowName].destroy === "function") {
      windowPrefs[windowName].destroy();
    }
    windows[windowName] = null;
  });
  if (event) {
    windows[windowName].webContents.once("dom-ready", () => {
      event.reply("window-ready", {
        id: windows[windowName].webContents.id,
        window: windowName
      });
    });
  }
}
function closeWindow({ windowName }) {
  if (windows[windowName]) {
    windows[windowName].close();
  }
}
function openFile(filePath) {
  electron.app.addRecentDocument(filePath);
  windows["mainWindow"].webContents.send("open-preset", filePath);
}
require("@electron/remote/main").initialize();
const isDevelopment = process.env.NODE_ENV !== "production";
electron.protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      secure: true,
      standard: true,
      stream: true,
      supportFetchAPI: true,
      bypassCSP: true
    }
  }
]);
electron.app.on("open-file", (event, filePath) => {
  event.preventDefault();
  openFile(filePath);
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", async () => {
  createWindow({ windowName: "mainWindow" });
});
electron.app.on("ready", async () => {
  electron.protocol.handle(APP_SCHEME, (request) => {
    const newPath = "file://" + new URL("http://modv.com/" + request.url.slice(`${APP_SCHEME}://`.length)).pathname;
    return electron.net.fetch(newPath);
  });
  electron.app.commandLine.appendSwitch(
    "disable-backgrounding-occluded-windows",
    "true"
  );
  createWindow({ windowName: "mainWindow" });
  electron.ipcMain.once("main-window-created", () => {
    createWindow({ windowName: "splashScreen" });
    createWindow({ windowName: "colorPicker", options: { show: false } });
  });
});
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        electron.app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      electron.app.quit();
    });
  }
}
