import { ModuleISF } from '../Modules';
import vertexShader from './isf-samples/Mirror Edge.vs';
import fragmentShader from './isf-samples/Mirror Edge.fs';

class MirrorEdge extends ModuleISF {
  constructor() {
    super({
      info: {
        name: 'MirrorEdge',
        author: '2xAA',
        version: 0.1,
        meyda: [], // returned variables passed to the shader individually as uniforms
      },
      fragmentShader,
      vertexShader,
    });
  }
}

export default MirrorEdge;
