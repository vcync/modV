import twgl from 'twgl.js'; //eslint-disable-line
// import setRectangle from './set-rectangle';
import { webgl, modV } from '@/modv';
import setActiveProgramFromIndex from './set-active-program-from-index';

export default function render({ delta, canvas, pixelRatio, Module }) {
  const gl = webgl.gl;

  // Clear WebGL canvas
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const programIndex = Module.programIndex;
  const programInfo = Module.programInfo;

  const uniforms = {
    iGlobalTime: delta / 1000,
    iDelta: delta,
    u_delta: delta,
    u_time: delta,
    iResolution: [canvas.width, canvas.height, pixelRatio || 1.0],
  };

  Module.uniformValues.forEach((value, key) => {
    uniforms[key] = value;
  });

  setActiveProgramFromIndex(programIndex);
  twgl.setUniforms(programInfo, uniforms);

  if ('meyda' in Module.info) {
    if (Module.info.meyda.length > 0) {
      const meydaFeatures = modV.meyda.get(modV.audioFeatures);
      Module.info.meyda.forEach((feature) => {
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
}
