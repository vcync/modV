import defaultShader from './default-shader';
import twgl from 'twgl.js'; //eslint-disable-line

import resize from './resize';
import makeProgram from './make-program';
import setRectangle from './set-rectangle';

function shaderEnvInit(modV) {
  const env = {};
  modV.webgl = env;

  env.programs = [null]; // null at position 0 because programs can't be 0
  env.texture = null;
  env.activeProgram = -1;
  env.buffer = null;
  env.useMipmap = false;

  env.canvas = document.createElement('canvas');
  env.gl = env.canvas.getContext('webgl2', {
    // antialias: false,
    premultipliedAlpha: false,
  });

  const gl = env.gl;
  const canvas = env.canvas;

  // Disable Colourspace conversion
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

  // Disable pre-multiplied alpha
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, gl.NONE);

  // Make basic shader program
  Object.defineProperty(env, 'defaultShader', {
    get: () => defaultShader,
  });

  const program = makeProgram(gl, defaultShader.v, defaultShader.f);
  const programInfo = twgl.createProgramInfoFromProgram(gl, program);
  env.programs.push(program);
  gl.useProgram(env.programs[1]);

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  };

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  // twgl.setUniforms(programInfo, uniforms);

  // Create a texture
  env.texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0); // At Unit position 0
  gl.bindTexture(gl.TEXTURE_2D, env.texture);

  // Fill the texture with a 1x1 transparent pixel.
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]),
  );
  if (env.useMipmap) gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Set canvas and viewport sizes
  resize(gl, canvas, modV.width, modV.height);

  // Get position of position attribute
  const positionLocation = gl.getAttribLocation(env.programs[1], 'a_position');

  // Create a buffer for the position of the rectangle corners.
  env.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, env.buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  setRectangle(gl, 0, 0, modV.width, modV.height, env.buffer);

  env.resize = (widthIn, heightIn, dpr = 1) => {
    const width = widthIn * dpr;
    const height = heightIn * dpr;

    resize(gl, canvas, width, height);
    setRectangle(gl, 0, 0, width, height, env.buffer);
  };

  env.resize(modV.width, modV.height);

  return env;
}

export default shaderEnvInit;
