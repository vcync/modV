import { ModuleShader } from '../Modules';
import plasmaFrag from './Plasma/plasma.frag';

class Plasma extends ModuleShader {
  constructor() {
    super({
      info: {
        name: 'Plasma',
        author: '2xAA',
        version: 0.1,
        meyda: [], // returned variables passed to the shader individually as uniforms
        uniforms: {
          u_scaleX: {
            type: 'f',
            value: 50,
          },
          u_scaleY: {
            type: 'f',
            value: 50,
          },
          u_timeScale: {
            type: 'f',
            value: 100.0,
          },
        }, // Three.JS uniforms
      },
      fragmentShader: plasmaFrag,
    });

    this.add({
      type: 'rangeControl',
      variable: 'u_scaleX',
      label: 'Scale X',
      varType: 'float',
      min: 1.0,
      max: 150.0,
      step: 1.0,
      default: 50.0,
    });

    this.add({
      type: 'rangeControl',
      variable: 'u_scaleY',
      label: 'Scale Y',
      varType: 'float',
      min: 1.0,
      max: 150.0,
      step: 1.0,
      default: 50.0,
    });

    this.add({
      type: 'rangeControl',
      variable: 'u_timeScale',
      label: 'Time Scale',
      varType: 'float',
      min: 1.0,
      max: 1000.0,
      step: 1.0,
      default: 100.0,
    });
  }
}

export default Plasma;
