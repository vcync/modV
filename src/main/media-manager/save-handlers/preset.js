export default {
  folder: "preset",
  identifier: "📜",

  fileTypes: ["json"],

  process() {
    return new Promise((resolve) => {
      resolve(true);
    });
  },
};
