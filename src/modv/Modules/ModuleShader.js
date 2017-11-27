import { modV, webgl } from '@/modv';
import { forIn } from '@/modv/utils';
import setActiveProgramFromIndex from '@/modv/webgl/set-active-program-from-index';
import makeProgram from '@/modv/webgl/make-program-promise';
import Module from './Module';
import twgl from 'twgl.js'; //eslint-disable-line

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
    this._makeProgram().then(() => { //eslint-disable-line
      this._setupUniforms(); //eslint-disable-line
    }).catch((err) => {
      console.error(err);
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
    const gl = webgl.gl;

    return new Promise((resolve, reject) => {
      const settings = this.settings;

      // Read shader documents
      const shaderStrings = [];

      if ('vertexShader' in settings) {
        shaderStrings.push(settings.vertexShader);
      } else {
        shaderStrings.push(webgl.defaultShader.v);
      }

      if ('fragmentShader' in settings) {
        shaderStrings.push(settings.fragmentShader);
      } else {
        shaderStrings.push(webgl.defaultShader.f);
      }

      Promise.all(shaderStrings).then((values) => {
        let vs = values[0];
        let fs = values[1];

        const morePromises = [];

        if (typeof vs !== 'string') vs = vs.text();
        if (typeof fs !== 'string') fs = fs();

        morePromises.push(vs);
        morePromises.push(fs);

        Promise.all(morePromises).then((values) => {
          let vs = values[0];
          let fs = values[1];

          if (fs.search('gl_FragColor') < 0) {
            fs = webgl.defaultShader.fWrap.replace(
              /(%MAIN_IMAGE_INJECT%)/,
              fs,
            );

            vs = webgl.defaultShader.v300;
          }

          makeProgram(vs, fs).then((program) => {
            gl.useProgram(program);
            this.programIndex = webgl.programs.push(program) - 1;

            this.programInfo = twgl.createProgramInfoFromProgram(gl, program);

            // finish up
            resolve(this, 'shader');
          }).catch((error) => {
            console.error(`Registration of ModuleShader ${name} unsuccessful.`);
            reject(error);
          });
        }).catch((reason) => {
          reject(reason);
        });
      }).catch((reason) => {
        reject(reason);
      });
    });
  }

  /**
   * Make program information (used by twgl) from a previously compiled and stored program
   * in modV's Shader Environment, then store it on the Module (Module.programInfo)
   * @private
   * @param  {modV}   modV A reference to a modV instance
   */
  _makeProgramInfoFromIndex() {
    const program = webgl.programs[this.programIndex];
    const gl = webgl.gl;
    this.programInfo = twgl.createProgramInfoFromProgram(gl, program);
  }

  /**
   * Create getters and setters on the Module for the given Uniforms
   * @private
   * @param {WebGL2RenderingContext} gl A reference to modV's internal GL Context
   */
  _setupUniforms() {
    const gl = webgl.gl;

    const settings = this.settings;
    const programInfo = this.programInfo;
    const twGLUniforms = programInfo.uniformSetters;

    forIn(settings.info.uniforms, (uniformKey, uniform) => {
      if (uniformKey in twGLUniforms) {
        const uniformSetter = twGLUniforms[uniformKey];
        Object.defineProperty(this, uniformKey, {
          set: (value) => {
            gl.useProgram(this.programInfo.program);
            uniformSetter(value);
            this.uniformValues.set(uniformKey, value);
          },
          get: () => this.uniformValues.get(uniformKey),
        });

        gl.useProgram(this.programInfo.program);
        uniformSetter(uniform.value);
        this.uniformValues.set(uniformKey, uniform.value);
      }
    });
  }

  draw({ delta, canvas, pixelRatio, context }) {
    const gl = webgl.gl;

    webgl.texture = gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      canvas,
    );

    // Clear WebGL canvas
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const programIndex = this.programIndex;
    const programInfo = this.programInfo;

    const uniforms = {
      iGlobalTime: delta / 1000,
      iDelta: delta,
      u_delta: delta,
      u_time: delta,
      iResolution: [canvas.width, canvas.height, pixelRatio || 1.0],
    };

    Object.keys(this.uniformValues).forEach((key) => {
      const value = this.uniformValues[key];
      uniforms[key] = value;
    });

    setActiveProgramFromIndex(programIndex);
    twgl.setUniforms(programInfo, uniforms);

    if ('meyda' in this.info) {
      if (this.info.meyda.length > 0) {
        const meydaFeatures = modV.meyda.get(modV.audioFeatures);
        this.info.meyda.forEach((feature) => {
          const uniLoc = gl.getUniformLocation(webgl.programs[webgl.activeProgram], feature);

          const value = parseFloat(meydaFeatures[feature]);
          gl.uniform1f(uniLoc, value);
        });
      }
    }

    // required as we need to resize our drawing boundaries for gallery and main canvases
    // TODO: this is a performance hinderance, the most expensive call within this function,
    // consider seperate GL environment for gallery
    // setRectangle(0, 0, canvas.width, canvas.height, env.buffer);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Copy Shader Canvas to Main Canvas
    context.drawImage(
      webgl.canvas,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }
}

export default ModuleShader;
