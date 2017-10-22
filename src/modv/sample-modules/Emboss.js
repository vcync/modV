import { ModuleISF } from '../Modules';
import vertexShader from './isf-samples/Emboss.vs';
import fragmentShader from './isf-samples/Emboss.fs';

class Emboss extends ModuleISF {
  constructor() {
    super({
      info: {
        name: 'Emboss',
        author: '2xAA',
        version: 0.1,
        meyda: [] // returned variables passed to the shader individually as uniforms
      },
      fragmentShader,
      vertexShader
    });
  }
}

export default Emboss;