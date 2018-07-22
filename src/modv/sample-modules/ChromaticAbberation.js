import chromaticAbberationFrag from './ChromaticAbberation/chromaticAbberation.frag';

export default {
  meta: {
    name: 'Chromatic Abberation',
    author: '2xAA',
    version: '1.0.0',
    previewWithOutput: true,
    meyda: [], // returned variables passed to the shader individually as uniforms
    type: 'shader',
  },
  fragmentShader: chromaticAbberationFrag,

  props: {
    rOffset: {
      type: 'float',
      label: 'Red Offset',
      min: 1.0,
      max: 2.0,
      step: 0.001,
      default: 1.0,
    },
    gOffset: {
      type: 'float',
      label: 'Green Offset',
      min: 1.0,
      max: 2.0,
      step: 0.001,
      default: 1.015,
    },
    bOffset: {
      type: 'float',
      label: 'Blue Offset',
      min: 1.0,
      max: 2.0,
      step: 0.001,
      default: 1.03,
    },
  },
};
