import { ModuleShader } from '../Modules';
import filmGrainFrag from './FilmGrain/filmGrain.frag';

class FilmGrain extends ModuleShader {
  constructor() {
    super({
      info: {
        name: 'Film Grain',
        author: '2xAA',
        version: 0.1,
        meyda: [], // returned variables passed to the shader individually as uniforms
        uniforms: {
          strength: {
            type: 'f',
            value: 16.0,
          },
          secondaryOperation: {
            type: 'b',
            value: false,
          },
        }, // Three.JS style uniforms
      },
      fragmentShader: filmGrainFrag,
    });

    this.add({
      type: 'rangeControl',
      variable: 'strength',
      label: 'Strength',
      varType: 'float',
      min: 0.0,
      max: 50.0,
      step: 0.5,
      default: 16.0,
    });

    this.add({
      type: 'checkboxControl',
      variable: 'secondaryOperation',
      label: 'Operation Type',
      checked: false,
    });
  }
}

export default FilmGrain;
