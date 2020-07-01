import createREGL from "regl/dist/regl.unchecked";
import defaultShader from "./default-shader";

function setupWebGl(modV) {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", {
    premultipliedAlpha: false,
    antialias: true
  });

  const regl = createREGL({
    gl,
    attributes: {
      antialias: true
    }
  });

  const env = { gl, canvas, regl };

  Object.defineProperty(env, "defaultShader", {
    get: () => defaultShader
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
