import { ModuleISF } from '../Modules';
import vertexShader from './isf-samples/Optical Flow Distort.vs';
import fragmentShader from './isf-samples/Optical Flow Distort.fs';

class OpticalFlowDistort extends ModuleISF {
  constructor() {
    super({
      info: {
        name: 'Optical Flow Distort',
        author: '2xAA',
        version: 0.1,
        meyda: [], // returned variables passed to the shader individually as uniforms
      },
      fragmentShader,
      vertexShader,
    });
  }
}

export default OpticalFlowDistort;
