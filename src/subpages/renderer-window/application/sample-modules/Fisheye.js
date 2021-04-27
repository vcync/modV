import fragmentShader from "./Fisheye/fisheye.frag";

export default {
  meta: {
    name: "Fisheye",
    type: "shader",
    version: "1.0.0",
    author: "???",
    previewWithOutput: true
  },

  fragmentShader,

  props: {
    aperture: {
      type: "float",
      label: "Aperture",
      default: 180.0,
      min: 1.0,
      max: 360.0,
      step: 0.5
    }
  }
};
