import createREGL from 'regl';
import defaultShader from './default-shader';

function setupWebGl(modV) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', {
    premultipliedAlpha: false,
  });

  const regl = createREGL(gl);

  const env = { gl, canvas, regl };

  Object.defineProperty(env, 'defaultShader', {
    get: () => defaultShader,
  });

  modV.webgl = env;

  env.resize = (widthIn, heightIn, dpr = 1) => {
    const width = widthIn * dpr;
    const height = heightIn * dpr;

    canvas.width = width;
    canvas.height = height;
  };

  env.resize(modV.width, modV.height);

  return env;
}

export default setupWebGl;
