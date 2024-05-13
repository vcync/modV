import plasmaFrag from "./Plasma/plasma.frag?raw";

export default {
  meta: {
    name: "Plasma",
    author: "2xAA",
    version: 0.1,
    meyda: [], // returned variables passed to the shader individually as uniforms
    type: "shader",
  },
  fragmentShader: plasmaFrag,
  props: {
    u_scaleX: {
      type: "float",
      label: "Scale X",
      min: 1.0,
      max: 150.0,
      step: 1.0,
      default: 50.0,
    },

    u_scaleY: {
      type: "float",
      label: "Scale Y",
      min: 1.0,
      max: 150.0,
      step: 1.0,
      default: 50.0,
    },

    u_timeScale: {
      type: "float",
      label: "Time Scale",
      min: 1.0,
      max: 1000.0,
      step: 1.0,
      default: 100.0,
    },
  },
};
