import { ModuleISF } from '../Modules';
import vertexShader from './isf-samples/Edge Distort.vs';
import fragmentShader from './isf-samples/Edge Distort.fs';

class EdgeDistort extends ModuleISF {
  constructor() {
    super({
      info: {
        name: 'EdgeDistort',
        author: '2xAA',
        version: 0.1,
        meyda: [] // returned variables passed to the shader individually as uniforms
      },
      fragmentShader,
      vertexShader
    });
  }
}

export default EdgeDistort;