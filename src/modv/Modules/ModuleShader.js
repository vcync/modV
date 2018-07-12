import { webgl } from '@/modv';
import { forIn } from '@/modv/utils';
import Module from './Module';

let modVCanvasTexture;

class ModuleShader extends Module {
  /**
   * The usual ModuleSettings Object with some extra keys
   * @param {ModuleSettings} settings
   * @param {String} settings.vertexFile    (optional) Location of the Vertex shader file
   * @param {String} settings.fragmentFile  (optional) Location of the Fragment shader file
   * @param {Object} settings.info.uniforms (optional) (THREE.js style) Uniforms to pass the shader
   */
  constructor(settings) {
    super(settings);

    this.programIndex = -1;
    this.uniformValues = new Map();
    this._setupUniforms(); // eslint-disable-line
    this._makeProgram().catch((err) => { // eslint-disable-line
      throw new Error(err);
    });
  }

  /**
   * Internal function to make a GL program from the given shader files
   * @private
   * @param  {WebGL2RenderingContext}  gl   A reference to modV's internal GL Context
   * @param  {modV}                    modV A reference to a modV instance
   * @return {Promise}                      Resolves with completion of compiled shaders
   */
  _makeProgram() {
    const regl = webgl.regl;

    return new Promise((resolve, reject) => {
      const settings = this.settings;

      // Read shader documents
      let vert = '';
      let frag = '';

      if ('vertexShader' in settings) {
        vert = settings.vertexShader;
      } else {
        vert = webgl.defaultShader.v;
      }

      if ('fragmentShader' in settings) {
        frag = settings.fragmentShader;
      } else {
        frag = webgl.defaultShader.f;
      }

      if (frag.search('gl_FragColor') < 0) {
        frag = webgl.defaultShader.fWrap.replace(
          /(%MAIN_IMAGE_INJECT%)/,
          frag,
        );

        vert = webgl.defaultShader.v300;
      }

      const uniforms = {
        u_modVCanvas: regl.prop('u_modVCanvas'),
        iFrame: ({ tick }) => tick,
        iTime: ({ time }) => time,
        u_delta: ({ time }) => time,
        u_time: ({ time }) => time * 1000,
        iGlobalTime: ({ time }) => time,
        iResolution: ({ viewportWidth, viewportHeight, pixelRatio }) => [
          viewportWidth,
          viewportHeight,
          pixelRatio,
        ],
        iMouse: regl.prop('iMouse'),
        iChannel0: regl.prop('iChannel0'),
        iChannel1: regl.prop('iChannel1'),
        iChannel2: regl.prop('iChannel2'),
        iChannel3: regl.prop('iChannel3'),
        'iChannelResolution[0]': regl.prop('iChannelResolution[0]'),
        'iChannelResolution[1]': regl.prop('iChannelResolution[1]'),
        'iChannelResolution[2]': regl.prop('iChannelResolution[2]'),
        'iChannelResolution[3]': regl.prop('iChannelResolution[3]'),
      };

      this.uniformValues.forEach((value, key) => {
        // const value = this.uniformValues[key];
        uniforms[key] = () => this[key];
      });

      try {
        const draw = regl({
          vert,
          frag,

          attributes: {
            position: [
              -2, 2,
              0, -2,
              2, 2,
            ],
            a_position: [
              -2, 2,
              0, -2,
              2, 2,
            ],
          },

          uniforms,

          count: 3,
        });

        this.renderShader = draw;
      } catch (e) {
        reject(e);
      }

      resolve();
    }).catch((reason) => {
      throw new Error(reason);
    });
  }

  /**
   * Create getters and setters on the Module for the given Uniforms
   * @private
   * @param {WebGL2RenderingContext} gl A reference to modV's internal GL Context
   */
  _setupUniforms() {
    const settings = this.settings;

    forIn(settings.info.uniforms, (uniformKey, uniform) => {
      Object.defineProperty(this, uniformKey, {
        set: (value) => {
          this.uniformValues.set(uniformKey, value);
        },
        get: () => this.uniformValues.get(uniformKey),
      });

      this.uniformValues.set(uniformKey, uniform.value);
    });
  }

  draw({ canvas, context, pipeline }) {
    const regl = webgl.regl;

    if (!modVCanvasTexture) {
      modVCanvasTexture = regl.texture({
        src: canvas,
      });
    } else {
      modVCanvasTexture(canvas);
    }

    const uniforms = {
      u_modVCanvas: modVCanvasTexture,
      iChannel0: modVCanvasTexture,
      iChannel1: modVCanvasTexture,
      iChannel2: modVCanvasTexture,
      iChannel3: modVCanvasTexture,
      iMouse: [0, 0, 0, 0],
    };

    // if ('meyda' in this.info) {
    //   if (this.info.meyda.length > 0) {
    //     const meydaFeatures = modV.meyda.get(modV.audioFeatures);
    //     this.info.meyda.forEach((feature) => {
    //       const uniLoc = gl.getUniformLocation(webgl.programs[webgl.activeProgram], feature);

    //       const value = parseFloat(meydaFeatures[feature]);
    //       gl.uniform1f(uniLoc, value);
    //     });
    //   }
    // }

    regl.clear({
      depth: 1,
      color: [0, 0, 0, 0],
    });

    this.renderShader(uniforms);

    context.save();
    context.globalAlpha = this.info.alpha || 1;
    context.globalCompositeOperation = this.info.compositeOperation || 'normal';
    if (pipeline) context.clearRect(0, 0, canvas.width, canvas.height);
    // Copy Shader Canvas to Main Canvas
    context.drawImage(webgl.canvas, 0, 0, canvas.width, canvas.height);

    context.restore();
  }
}

export default ModuleShader;
