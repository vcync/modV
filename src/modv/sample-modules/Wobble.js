import fragmentShader from './Wobble/wobble.frag';

export default {
  meta: {
    type: 'shader',
    name: 'Wobble',
    author: '2xAA',
    version: '1.0.0',
    previewWithOutput: true,
  },

  fragmentShader,

  props: {
    strength: {
      type: 'float',
      label: 'Float',
      min: 0.0,
      max: 0.05,
      step: 0.001,
      default: 0.001,
    },

    size: {
      type: 'float',
      label: 'Size',
      min: 1.0,
      max: 50.0,
      step: 1.0,
      default: 1.0,
    },
  },
};
