import { ModuleShader } from '../Modules';
import fisheyeFrag from './Fisheye/fisheye.frag';

class Fisheye extends ModuleShader {
  constructor() {
    super({
      info: {
        name: 'Fisheye',
        author: '???',
        version: 0.1,
        meyda: [], // returned variables passed to the shader individually as uniforms
        uniforms: {
          aperture: {
            type: 'f',
            value: 180.0,
          },
        }, // Three.JS uniforms
      },
      fragmentShader: fisheyeFrag,
    });

    this.add({
      type: 'rangeControl',
      variable: 'aperture',
      label: 'Aperture',
      varType: 'float',
      min: 1.0,
      max: 360.0,
      step: 0.5,
      default: 180.0,
    });
  }
}

export default Fisheye;
