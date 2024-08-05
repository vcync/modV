export default {
  folder: "palette",
  identifier: "🎨",

  fileTypes: ["json"],

  process() {
    return new Promise(resolve => {
      resolve(true);
    });
  }
};
