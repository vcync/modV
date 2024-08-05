import createContext from "pex-context";
import { frames } from "../../worker/frame-counter";
import store from "../../worker/store";
import defaultShader from "./default-shader";

function createCanvas(name, contextOptions) {
  const canvas = new OffscreenCanvas(256, 256);
  const context = canvas.getContext("webgl2", contextOptions);

  let canvasTexture;
  let fftTexture;

  const setCanvasTexture = (tex) => (canvasTexture = tex);
  const setFftTexture = (tex) => (fftTexture = tex);

  const getCanvasTexture = () => canvasTexture;
  const getFftTexture = () => fftTexture;

  store.dispatch("outputs/addAuxillaryOutput", {
    name,
    context,
    group: "buffer",
  });

  const pex = createContext({ gl: context });

  const a_position = pex.vertexBuffer([
    -1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1,
  ]);
  const indices = pex.indexBuffer([0, 1, 2, 3, 4, 5]);

  const commands = {};

  const clearCommand = {
    pass: pex.pass({
      clearColor: [0, 0, 0, 1],
      clearDepth: 1,
    }),
  };

  const addCommand = (name, command) => {
    commands[name] = command;
  };

  return {
    pex,
    canvas,
    context,
    commands,
    addCommand,
    clearCommand,
    a_position,
    indices,
    setCanvasTexture,
    setFftTexture,
    getCanvasTexture,
    getFftTexture,
  };
}

const shaderContext = createCanvas("shader-buffer", {
  antialias: true,
  desynchronized: true,
  powerPreference: "high-performance",
  premultipliedAlpha: false,
});

const shaderContextGallery = createCanvas("shader-buffer-gallery", {
  antialias: false,
  desynchronized: true,
  powerPreference: "high-performance",
  premultipliedAlpha: false,
});

function resize({ width, height }, canvasIn) {
  const canvas = canvasIn ?? shaderContext.canvas;

  canvas.width = width;
  canvas.height = height;

  // pex.set({
  //   width,
  //   height
  // });
}

function generateUniforms(canvasTexture, uniforms, kick = false, fftTexture) {
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

function makeProgram(moduleDefinition, id, isGallery) {
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

  const rendererContext = isGallery ? shaderContextGallery : shaderContext;

  const pipeline = rendererContext.pex.pipeline({
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

  const uniforms = generateUniforms(
    rendererContext.getCanvasTexture(),
    shaderUniforms,
    false,
    rendererContext.fftTexture,
  );

  const command = {
    pipeline,
    attributes: {
      a_position: rendererContext.a_position,
      position: rendererContext.a_position,
    },
    indices: rendererContext.indices,
    uniforms,
  };

  rendererContext.addCommand(id, command);

  return moduleDefinition;
}

async function setupModule(moduleDefinition) {
  // try {
  //   return await makeProgram(moduleDefinition);
  // } catch (e) {
  //   throw new Error(e);
  // }

  return moduleDefinition;
}

async function addActiveModule(
  { $id: id, meta: { isGallery } },
  moduleDefinition,
) {
  try {
    return makeProgram(moduleDefinition, id, isGallery);
  } catch (e) {
    throw new Error(e);
  }
}

function render({
  module,
  moduleId,
  props,
  canvas,
  context,
  pipeline,
  kick,
  fftCanvas,
  isGallery,
}) {
  const rendererContext = isGallery ? shaderContextGallery : shaderContext;
  const { pex, setCanvasTexture, setFftTexture } = rendererContext;

  resize(canvas, rendererContext.canvas);

  if (!rendererContext.getCanvasTexture()) {
    setCanvasTexture(
      pex.texture2D({
        data: canvas.data || canvas,
        width: canvas.width,
        height: canvas.height,
        pixelFormat: pex.PixelFormat.RGBA8,
        encoding: pex.Encoding.Linear,
        min: pex.Filter.Linear,
        mag: pex.Filter.Linear,
        wrap: pex.Wrap.Repeat,
      }),
    );

    setFftTexture(
      pex.texture2D({
        data: fftCanvas.data || fftCanvas,
        width: fftCanvas.width,
        height: 1,
        pixelFormat: pex.PixelFormat.RGBA8,
        encoding: pex.Encoding.Linear,
        wrap: pex.Wrap.Repeat,
      }),
    );
  } else {
    pex.update(rendererContext.getCanvasTexture(), {
      width: canvas.width,
      height: canvas.height,
      data: canvas.data || canvas,
    });

    pex.update(rendererContext.getFftTexture(), {
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

  const uniforms = generateUniforms(
    rendererContext.getCanvasTexture(),
    shaderUniforms,
    kick,
    rendererContext.getFftTexture(),
  );

  const command = rendererContext.commands[moduleId];

  pex.submit(rendererContext.clearCommand);
  try {
    pex.submit(command, {
      uniforms,
      viewport: [0, 0, canvas.width, canvas.height],
    });
  } catch (e) {
    console.error(e);
    // nothing
  }

  // clear context if we're in pipeline mode
  if (pipeline) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Copy Shader Canvas to Main Canvas
  context.drawImage(rendererContext.canvas, 0, 0, canvas.width, canvas.height);
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

export { setupModule, render, resize, updateModule, addActiveModule };
