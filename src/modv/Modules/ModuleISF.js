import { isf } from '@/modv';
import {
  Renderer as ISFRenderer,
  Parser as ISFParser,
  Upgrader as ISFUpgrader,
} from 'interactive-shader-format-for-modv';
import Module from './Module';

class ModuleISF extends Module {
  /**
   * The usual ModuleSettings Object with some extra keys
   * @param {ModuleSettings} settings
   * @param {String} settings.vertexShader   (optional) Location of the Vertex shader file
   * @param {String} settings.fragmentShader (optional) Location of the Fragment shader file
   * @param {Object} settings.info.uniforms  (optional) (THREE.js style) Uniforms to pass the shader
   */
  constructor(settings) {
    super(settings);

    this.gl = isf.gl;
    this.ISFcanvas = isf.canvas;
    this.imageInputs = [];
    this.inputs = [];
    this.paused = false;

    function render({ canvas, context, video, features, meyda, delta, bpm, kick, pipeline }) { //eslint-disable-line
      if (this.inputs) {
        this.imageInputs.forEach((input) => {
          if (input.NAME in this.info.controls) {
            this.renderer.setValue(input.NAME, this[input.NAME] || canvas);
          } else {
            this.renderer.setValue(input.NAME, canvas);
          }
        });
      }

      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.renderer.draw(this.ISFcanvas);

      context.save();
      context.globalAlpha = this.info.alpha || 1;
      context.globalCompositeOperation = this.info.compositeOperation || 'normal';
      if (pipeline) context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(this.ISFcanvas, 0, 0, canvas.width, canvas.height);
      context.restore();
    }

    Object.defineProperty(this, 'render', {
      get() {
        return render.bind(this);
      },
      set() {
        throw new Error('ModuleISF\'s method "render" cannot be overwritten');
      },
    });

    this.draw = this.render;
  }

  init(can) { //eslint-disable-line
    this.ISFcanvas.width = can.width;
    this.ISFcanvas.height = can.height;

    let fragmentShader = this.settings.fragmentShader;
    let vertexShader = this.settings.vertexShader;

    const parser = new ISFParser();
    parser.parse(fragmentShader, vertexShader);
    if (parser.error) {
      console.error(`Error evaluating ${this.settings.info.name}'s shaders`);
      throw new Error(parser.error);
    }

    if (parser.isfVersion < 2) {
      fragmentShader = ISFUpgrader.convertFragment(fragmentShader);
      if (vertexShader) vertexShader = ISFUpgrader.convertVertex(vertexShader);
    }

    this.settings.info.isfVersion = parser.isfVersion;
    this.settings.info.author = parser.metadata.CREDIT;
    this.settings.info.description = parser.metadata.DESCRIPTION;
    this.settings.info.version = parser.metadata.VSN;

    this.renderer = new ISFRenderer(this.gl);
    this.renderer.loadSource(fragmentShader, vertexShader);

    this.inputs = parser.inputs;
    this.imageInputs = parser.inputs.filter(input => input.TYPE === 'image');

    this.uniformValues = new Map();

    this.inputs.forEach((input) => {
      switch (input.TYPE) {
        default:
          break;

        case 'float':
          this.add({
            type: 'rangeControl',
            variable: input.NAME,
            label: input.LABEL || input.NAME,
            varType: 'float',
            default: input.DEFAULT,
            min: input.MIN,
            max: input.MAX,
            step: 0.01,
          });
          break;

        case 'bool':
          this.add({
            type: 'checkboxControl',
            variable: input.NAME,
            label: input.LABEL || input.NAME,
            checked: input.DEFAULT || 0.0,
          });
          break;

        case 'long':
          this.add({
            type: 'selectControl',
            variable: input.NAME,
            label: input.NAME,
            enum: input.VALUES
              .map((value, idx) => ({
                label: input.LABELS[idx],
                value,
                selected: (value === input.DEFAULT),
              }),
              ),
          });
          break;

        case 'color':
          this.add({
            type: 'colorControl',
            variable: input.NAME,
            label: input.LABEL || input.NAME,
            returnFormat: 'mappedRgbaArray',
            default: input.DEFAULT,
          });
          break;

        case 'point2D':
          this.add({
            type: 'twoDPointControl',
            variable: input.NAME,
            label: input.LABEL || input.NAME,
            default: input.DEFAULT,
            min: input.MIN,
            max: input.MAX,
          });
          break;

        case 'image':
          this.info.previewWithOutput = true;

          this.add({
            type: 'imageControl',
            variable: input.NAME,
            label: input.LABEL || input.NAME,
          });

          break;
      }

      this.uniformValues.set(input.NAME, input.DEFAULT || 0.0);

      Object.defineProperty(this, input.NAME, {
        set: (value) => {
          this.uniformValues.set(input.NAME, value);
          this.renderer.setValue(input.NAME, value);
        },
        get: () => this.uniformValues.get(input.NAME),
      });
    });
  }

  resize(can) { //eslint-disable-line
    this.ISFcanvas.width = can.width;
    this.ISFcanvas.height = can.height;
  }
}

export default ModuleISF;
