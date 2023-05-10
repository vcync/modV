export default {
  folder: "image",
  identifier: "🖼",

  fileTypes: ["jpg", "png"],

  process() {
    return new Promise(resolve => {
      resolve(true);
    });
  }
};
