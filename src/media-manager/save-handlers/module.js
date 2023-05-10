export default {
  folder: "module",
  identifier: "📄",

  fileTypes: ["js"],

  process() {
    return new Promise(resolve => {
      resolve(true);
    });
  }
};
