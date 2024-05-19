import createContext from "pex-context";
import { frames } from "../../worker/frame-counter";
import store from "../../worker/store";
import defaultShader from "./default-shader";

const shaderCanvas = new OffscreenCanvas(300, 300);
const shaderContext = shaderCanvas.getContext("webgl2", {
  antialias: true,
  desynchronized: true,
  powerPreference: "high-performance",
  premultipliedAlpha: false,
});

store.dispatch("outputs/addAuxillaryOutput", {
  name: "shader-buffer",
  context: shaderContext,
  group: "buffer",
});

const pex = createContext({ gl: shaderContext });

const a_position = pex.vertexBuffer([-1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1]);
const indices = pex.indexBuffer([0, 1, 2, 3, 4, 5]);

const commands = {};

let canvasTexture;
let fftTexture;

const clearCmd = {
  pass: pex.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1,
  }),
};

function resize({ width, height }) {
  shaderCanvas.width = width;
  shaderCanvas.height = height;

  // pex.set({
  //   width,
  //   height
  // });
}

function generateUniforms(canvasTexture, uniforms, kick = false) {
  const { dpr } = store.state.size;

  const date = new Date();
  const time = performance.now();
  const resolution = [
    canvasTexture?.width || 0,
    canvasTexture?.height || 0,
    dpr,
  ];

  const defaults = {
    iGlobalTime: time / 1000,
    iFrame: frames(),
    iDate: [date.getFullYear(), date.getMonth(), date.getDay(), time / 1000],
    iTime: time / 1000,
    iTimeDelta: time / 1000,
    iResolution: resolution,
    iChannel0: canvasTexture,
    iChannel1: canvasTexture,
    iChannel2: canvasTexture,
    iChannel3: canvasTexture,
    iChannelResolution: [resolution, resolution, resolution, resolution],
    u_modVCanvas: canvasTexture,
    u_fft: fftTexture,
    u_fftResolution: fftTexture ? fftTexture.width : 1,
    u_delta: time / 1000,
    u_time: time,
    u_kick: kick,
  };

  return { ...uniforms, ...defaults };
}

function makeProgram(moduleDefinition) {
  return new Promise((resolve) => {
    let vert = moduleDefinition.vertexShader;
    let frag = moduleDefinition.fragmentShader;

    if (!vert) {
      vert = defaultShader.v;
    }

    if (!frag) {
      frag = defaultShader.f;
    }

    if (frag.search("gl_FragColor") < 0) {
      frag = defaultShader.fWrap.replace(/(%MAIN_IMAGE_INJECT%)/, frag);

      vert = defaultShader.v300;
    }

    const pipeline = pex.pipeline({
      depthTest: true,
      vert,
      frag,
    });

    const shaderUniforms = {};

    if (moduleDefinition.props) {
      const modulePropsKeys = Object.keys(moduleDefinition.props);
      const modulePropsKeysLength = modulePropsKeys.length;

      for (let i = 0; i < modulePropsKeysLength; i++) {
        const key = modulePropsKeys[i];

        if (moduleDefinition.props[key].type === "texture") {
          shaderUniforms[key] = moduleDefinition.props[key].value;
        } else {
          shaderUniforms[key] = moduleDefinition.props[key];
        }
      }
    }

    const uniforms = generateUniforms(canvasTexture, shaderUniforms);

    const command = {
      pipeline,
      attributes: {
        a_position,
        position: a_position,
      },
      indices,
      uniforms,
    };

    commands[moduleDefinition.meta.name] = command;

    resolve(moduleDefinition);
  });
}

async function setupModule(moduleDefinition) {
  try {
    return await makeProgram(moduleDefinition);
  } catch (e) {
    throw new Error(e);
  }
}

function render({ module, props, canvas, context, pipeline, kick, fftCanvas }) {
  resize(canvas);

  if (!canvasTexture) {
    canvasTexture = pex.texture2D({
      data: canvas.data || canvas,
      width: canvas.width,
      height: canvas.height,
      pixelFormat: pex.PixelFormat.RGBA8,
      encoding: pex.Encoding.Linear,
      min: pex.Filter.Linear,
      mag: pex.Filter.Linear,
      wrap: pex.Wrap.Repeat,
    });
    fftTexture = pex.texture2D({
      data: fftCanvas.data || fftCanvas,
      width: fftCanvas.width,
      height: 1,
      pixelFormat: pex.PixelFormat.RGBA8,
      encoding: pex.Encoding.Linear,
      wrap: pex.Wrap.Repeat,
    });
  } else {
    pex.update(canvasTexture, {
      width: canvas.width,
      height: canvas.height,
      data: canvas.data || canvas,
    });
    pex.update(fftTexture, {
      width: fftCanvas.width,
      height: 1,
      data: fftCanvas.data || fftCanvas,
    });
  }

  const shaderUniforms = {};

  if (props) {
    const modulePropsKeys = Object.keys(props);
    const modulePropsKeysLength = modulePropsKeys.length;

    for (let i = 0; i < modulePropsKeysLength; i++) {
      const key = modulePropsKeys[i];

      if (module.props[key].type === "texture") {
        shaderUniforms[key] = props[key].value;
      } else {
        shaderUniforms[key] = props[key];
      }
    }
  }

  const uniforms = generateUniforms(canvasTexture, shaderUniforms, kick);

  const command = commands[module.meta.name];

  pex.submit(clearCmd);
  pex.submit(command, {
    uniforms,
    viewport: [0, 0, canvas.width, canvas.height],
  });

  // clear context if we're in pipeline mode
  if (pipeline) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Copy Shader Canvas to Main Canvas
  context.drawImage(shaderCanvas, 0, 0, canvas.width, canvas.height);
}

/**
 * Called each frame to update the Module
 */
function updateModule({ module, props, data, canvas, context, delta }) {
  const { data: dataUpdated } = module.update({
    props,
    data,
    canvas,
    context,
    delta,
  });

  return dataUpdated ?? data;
}

export { setupModule, render, resize, updateModule };
