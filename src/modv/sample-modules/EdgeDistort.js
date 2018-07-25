import vertexShader from './isf-samples/Edge Distort.vs';
import fragmentShader from './isf-samples/Edge Distort.fs';

export default {
  info: {
    name: 'EdgeDistort',
    author: '2xAA',
    version: 0.1,
    meyda: [], // returned variables passed to the shader individually as uniforms
    type: 'isf',
  },
  fragmentShader,
  vertexShader,
};
