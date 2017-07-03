import { isf } from '@/modv';
import { Renderer as ISFRenderer, Parser as ISFParser } from 'interactive-shader-format';
import Module from './Module';

class ModuleISF extends Module {
  /**
   * The usual ModuleSettings Object with some extra keys
   * @param {ModuleSettings} settings
   * @param {String} settings.vertexShader        (optional) Location of the Vertex shader file
   * @param {String} settings.fragmentShader      (optional) Location of the Fragment shader file
   * @param {Object} settings.info.uniforms     (optional) (THREE.js style) Uniforms to pass to the shader
   */
  constructor(settings) {
    super(settings);

    this.gl = isf.gl;
    this.ISFcanvas = isf.canvas;
    this.time = 0;

    function render({ canvas, context, video, features, meyda, delta, bpm, kick }) { //eslint-disable-line
      this.inputs.filter(input => input.TYPE === 'image').forEach((input) => {
        this.renderer.setValue(input.NAME, canvas);
      });

      this.renderer.setValue('TIME', this.time);

      this.renderer.draw(this.ISFcanvas);
      this.time += 0.01;

      context.save();
      context.globalAlpha = this.info.alpha || 1;
      context.globalCompositeOperation = this.info.compositeOperation || 'normal';
      context.drawImage(this.ISFcanvas, 0, 0);
      context.restore();
    }

    Object.defineProperty(this, 'render', {
      get() {
        return render.bind(this);
      },
      set() {
        throw new Error('ModuleISF\'s method "render" cannot be overwritten');
      }
    });

    this.draw = this.render;
  }

  init(can) { //eslint-disable-line
    this.ISFcanvas.width = can.width;
    this.ISFcanvas.height = can.height;

    this.renderer = new ISFRenderer(this.gl);
    this.renderer.loadSource(this.settings.fragmentShader, this.settings.vertexShader);

    const parser = new ISFParser();
    parser.parse(this.settings.fragmentShader);
    this.inputs = parser.inputs;

    this.uniformValues = new Map();

    this.inputs.forEach((input) => {
      switch(input.TYPE) {
        default:
          break;

        case 'float':
          this.add({
            type: 'rangeControl',
            variable: input.NAME,
            label: input.LABEL,
            varType: 'float',
            min: input.MIN || 0.0,
            max: input.MAX || 1.0,
            default: input.DEFAULT || 0.0,
            step: 0.01
          });

          break;

        case 'bool':
          this.add({
            type: 'checkboxControl',
            variable: input.NAME,
            label: input.LABEL,
            checked: input.DEFAULT || 0.0
          });
          break;

        case 'long':
          this.add({
            type: 'selectControl',
            variable: input.NAME,
            label: input.NAME,
            enum: input.VALUES.map((value, idx) => new Object({ label: input.LABELS[idx], value, selected: (value === input.DEFAULT) })) //eslint-disable-line
          });
          break;
      }

      this.uniformValues.set(input.NAME, input.DEFAULT || 0.0);

      Object.defineProperty(this, input.NAME, {
        set: (value) => {
          this.uniformValues.set(input.NAME, value);
          this.renderer.setValue(input.NAME, value);
        },
        get: () => this.uniformValues.get(input.NAME)
      });
    });
  }

  resize(can) { //eslint-disable-line
    this.ISFcanvas.width = can.width;
    this.ISFcanvas.height = can.height;
  }
}

export default ModuleISF;