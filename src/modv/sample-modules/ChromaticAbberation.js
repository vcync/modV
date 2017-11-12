import { ModuleShader } from '../Modules';
import chromaticAbberationFrag from './ChromaticAbberation/chromaticAbberation.frag';

class ChromaticAbberation extends ModuleShader {
  constructor() {
    super({
      info: {
        name: 'Chromatic Abberation',
        author: '2xAA',
        version: 0.1,
        meyda: [], // returned variables passed to the shader individually as uniforms
        uniforms: {
          rOffset: {
            type: 'f',
            value: 1.0,
          },
          gOffset: {
            type: 'f',
            value: 1.015,
          },
          bOffset: {
            type: 'f',
            value: 1.03,
          },
        }, // Three.JS style uniforms
      },
      fragmentShader: chromaticAbberationFrag,
    });

    this.add({
      type: 'rangeControl',
      variable: 'rOffset',
      label: 'Red Offset',
      varType: 'float',
      min: 1.0,
      max: 2.0,
      step: 0.001,
      default: 1.0,
    });

    this.add({
      type: 'rangeControl',
      variable: 'gOffset',
      label: 'Green Offset',
      varType: 'float',
      min: 1.0,
      max: 2.0,
      step: 0.001,
      default: 1.015,
    });

    this.add({
      type: 'rangeControl',
      variable: 'bOffset',
      label: 'Blue Offset',
      varType: 'float',
      min: 1.0,
      max: 2.0,
      step: 0.001,
      default: 1.03,
    });
  }
}

export default ChromaticAbberation;
