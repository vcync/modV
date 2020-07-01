import bulgeFrag from "./Bulge/Bulge.frag";

export default {
  meta: {
    name: "Bulge",
    author: "2xAA",
    version: "1.0.0",
    previewWithOutput: true,
    meyda: [], // returned variables passed to the shader individually as uniforms
    type: "shader"
  },
  fragmentShader: bulgeFrag,

  props: {
    aperture: {
      label: "Aperture",
      type: "float",
      min: 0.0,
      max: 180.0,
      step: 1.0,
      default: 180.0
    }
  }
};
