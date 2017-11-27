import { ModuleISF } from '../Modules';
import vertexShader from './isf-samples/Neon.vs';
import fragmentShader from './isf-samples/Neon.fs';

class Neon extends ModuleISF {
  constructor() {
    super({
      info: {
        name: 'Neon',
        author: '2xAA',
        version: 0.1,
        meyda: [], // returned variables passed to the shader individually as uniforms
      },
      fragmentShader,
      vertexShader,
    });
  }
}

export default Neon;
