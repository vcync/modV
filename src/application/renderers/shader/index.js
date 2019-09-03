import store from "../../worker/store";
import createREGL from "regl";
import defaultShader from "./default-shader";

const glCanvas = new OffscreenCanvas(300, 300);
const gl = glCanvas.getContext("webgl2", {
  premultipliedAlpha: false,
  antialias: true
});
store.dispatch("outputs/addAuxillaryOutput", {
  name: "shader-buffer",
  context: gl
});

const regl = createREGL(gl);

let modVCanvasTexture;

function render({ module, canvas, context, pipeline }) {
  if (!modVCanvasTexture) {
    modVCanvasTexture = regl.texture({
      data: canvas,
      mipmap: false,
      wrap: ["mirror", "mirror"],
      mag: "linear",
      min: "linear mipmap linear",
      flipY: module.meta.flipY || false
    });
  } else {
    // modVCanvasTexture({
    //   data: canvas,
    //   mipmap: true,
    //   wrap: ["mirror", "mirror"],
    //   mag: "linear",
    //   min: "linear mipmap linear",
    //   flipY: module.meta.flipY || false
    // });
  }

  const uniforms = {
    u_modVCanvas: modVCanvasTexture,
    iChannel0: modVCanvasTexture,
    iChannel1: modVCanvasTexture,
    iChannel2: modVCanvasTexture,
    iChannel3: modVCanvasTexture
  };

  if (module.props) {
    const modulePropsKeys = Object.keys(module.props);
    const modulePropsKeysLength = modulePropsKeys.length;

    for (let i = 0; i < modulePropsKeysLength; i++) {
      const key = modulePropsKeys[i];

      if (module.props[key].type === "texture") {
        uniforms[key] = module[key].texture;
      } else {
        uniforms[key] = module[key];
      }
    }
  }

  // if ('meyda' in Module.meta) {
  //   if (Module.meta.meyda.length > 0) {
  //     const meydaFeatures = modV.meyda.get(modV.audioFeatures);
  //     Module.meta.meyda.forEach((feature) => {
  //       const uniLoc = gl.getUniformLocation(webgl.programs[webgl.activeProgram], feature);

  //       const value = parseFloat(meydaFeatures[feature]);
  //       gl.uniform1f(uniLoc, value);
  //     });
  //   }
  // }

  // regl.clear({
  //   depth: 1,
  //   color: [0, 0, 0, 0]
  // });

  glCanvas.width = canvas.width;
  glCanvas.height = canvas.height;
  module.reglDraw(uniforms);

  context.save();
  context.globalAlpha = module.meta.alpha || 1;
  context.globalCompositeOperation = module.meta.compositeOperation || "normal";
  if (pipeline) context.clearRect(0, 0, canvas.width, canvas.height);
  // Copy Shader Canvas to Main Canvas
  context.drawImage(glCanvas, 0, 0, canvas.width, canvas.height);

  context.restore();
}

/**
 * Makes a regl program from the given shader files
 *
 * @param  {Object}  A Shader Module definition
 * @return {Promise} Resolves with completion of compiled shaders
 */
function makeProgram(Module) {
  return new Promise((resolve, reject) => {
    // Read shader documents
    let vert = Module.vertexShader;
    let frag = Module.fragmentShader;

    if (!vert) vert = defaultShader.v;
    if (!frag) frag = defaultShader.f;

    if (frag.search("gl_FragColor") < 0) {
      frag = defaultShader.fWrap.replace(/(%MAIN_IMAGE_INJECT%)/, frag);

      vert = defaultShader.v300;
    }

    const uniforms = {
      u_modVCanvas: regl.prop("u_modVCanvas"),
      iFrame: ({ tick }) => tick,
      iTime: ({ time }) => time,
      u_delta: ({ time }) => time,
      u_time: ({ time }) => time * 1000,
      iGlobalTime: ({ time }) => time,
      iResolution: ({ viewportWidth, viewportHeight, pixelRatio }) => [
        viewportWidth,
        viewportHeight,
        pixelRatio
      ],
      iChannel0: regl.prop("iChannel0"),
      iChannel1: regl.prop("iChannel1"),
      iChannel2: regl.prop("iChannel2"),
      iChannel3: regl.prop("iChannel3"),
      "iChannelResolution[0]": regl.prop("iChannelResolution[0]"),
      "iChannelResolution[1]": regl.prop("iChannelResolution[1]"),
      "iChannelResolution[2]": regl.prop("iChannelResolution[2]"),
      "iChannelResolution[3]": regl.prop("iChannelResolution[3]")
    };

    if (Module.props) {
      const modulePropsKeys = Object.keys(Module.props);
      const modulePropsKeysLength = modulePropsKeys.length;
      for (let i = 0; i < modulePropsKeysLength; i++) {
        const key = modulePropsKeys[i];

        uniforms[key] = regl.prop(key);
      }
    }

    try {
      const draw = regl({
        vert,
        frag,

        attributes: {
          position: [-2, 2, 0, -2, 2, 2],
          a_position: [-2, 2, 0, -2, 2, 2]
        },

        uniforms,

        count: 3
      });

      Module.reglDraw = draw;
      Module.draw = render;
    } catch (e) {
      reject(e);
    }

    resolve(Module);
  }).catch(reason => {
    throw new Error(reason);
  });
}

async function setupModule(Module) {
  try {
    return await makeProgram(Module);
  } catch (e) {
    throw new Error(e);
  }
}

function tick() {
  regl.poll();
}

export { setupModule, render, tick };
