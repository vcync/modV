import filmGrainFrag from "./FilmGrain/filmGrain.frag";

export default {
  meta: {
    name: "Film Grain",
    author: "2xAA",
    version: 0.1,
    meyda: [], // returned variables passed to the shader individually as uniforms
    type: "shader"
  },
  fragmentShader: filmGrainFrag,

  strength: {
    type: "float",
    label: "Strength",
    min: 0.0,
    max: 50.0,
    step: 0.5,
    default: 16.0
  },

  secondaryOperation: {
    type: "bool",
    label: "Operation Type",
    default: false
  }
};
