import store from "../worker/store";
import * as THREEimport from "three/build/three.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const THREE = { ...THREEimport, GLTFLoader };
const threeModuleData = {};

const threeCanvas = new OffscreenCanvas(300, 300);
const threeContext = threeCanvas.getContext("webgl2", {
  antialias: true,
  desynchronized: true,
  powerPreference: "high-performance",
  premultipliedAlpha: false,
});

store.dispatch("outputs/addAuxillaryOutput", {
  name: "three-buffer",
  context: threeContext,
  group: "buffer",
});

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: false,
  canvas: threeCanvas,
  powerPreference: "high-performance",
  premultipliedAlpha: false,
});
renderer.setPixelRatio(1);

const inputTextureCanvas = new OffscreenCanvas(300, 300);
const inputTextureContext = inputTextureCanvas.getContext("2d");
store.dispatch("outputs/addAuxillaryOutput", {
  name: "three-inputTexture-buffer",
  context: inputTextureContext,
  group: "buffer",
});

const inputTexture = new THREE.CanvasTexture(inputTextureCanvas);

/**
 * Called each frame to update the Module
 * @param  {Object}                   Module        A three Module
 * @param  {HTMLCanvas}               canvas        The Canvas to draw to
 * @param  {WebGL2RenderingContext}   context       The Context of the Canvas
 * @param  {HTMLVideoElement}         video         The video stream requested by modV
 * @param  {Array<MeydaFeatures>}     features      Requested Meyda features
 * @param  {Meyda}                    meyda         The Meyda instance
 *                                                  (for Windowing functions etc.)
 *
 * @param  {DOMHighResTimeStamp}      delta         Timestamp returned by requestAnimationFrame
 * @param  {Number}                   bpm           The detected or tapped BPM
 * @param  {Boolean}                  kick          Indicates if BeatDetektor detected a kick in
 *                                                  the audio stream
 */
function render({
  module,
  canvas,
  context,
  video,
  features,
  meyda,
  delta,
  bpm,
  kick,
  props,
  data,
  fftCanvas,
  pipeline,
}) {
  resize(canvas);
  inputTextureContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  inputTexture.image = inputTextureCanvas.transferToImageBitmap();
  inputTexture.needsUpdate = true;

  const { scene, camera } = threeModuleData[module.meta.name];

  module.draw({
    THREE,
    inputTexture,
    canvas,
    video,
    features,
    meyda,
    delta,
    bpm,
    kick,
    props,
    data: { ...data },
    scene,
    camera,
    fftCanvas,
  });

  renderer.render(scene, camera);

  // clear context if we're in pipeline mode
  if (pipeline) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Copy three Canvas to Main Canvas
  context.drawImage(threeCanvas, 0, 0, canvas.width, canvas.height);
}

/**
 * Called each frame to update the Module
 */
function updateModule({
  moduleDefinition,
  props,
  data,
  canvas,
  context,
  delta,
}) {
  const { scene, camera } = threeModuleData[moduleDefinition.meta.name];

  const {
    data: dataUpdated,
    scene: sceneUpdated,
    camera: cameraUpdated,
  } = moduleDefinition.update({
    THREE,
    props,
    data,
    canvas,
    context,
    delta,
    scene,
    camera,
  });

  threeModuleData[moduleDefinition.meta.name] = {
    scene: sceneUpdated ?? scene,
    camera: cameraUpdated ?? camera,
  };

  return dataUpdated ?? data;
}

async function setupModule(moduleDefinition) {
  const { data, scene, camera } = await moduleDefinition.setupThree({
    THREE,
    inputTexture,
    data: moduleDefinition.data || {},
    width: renderer.domElement.width,
    height: renderer.domElement.height,
  });

  threeModuleData[moduleDefinition.meta.name] = {
    scene,
    camera,
  };

  moduleDefinition.data = data;

  return moduleDefinition;
}

function resizeModule({ moduleDefinition, canvas, data, props }) {
  const { scene, camera } = threeModuleData[moduleDefinition.meta.name];
  return moduleDefinition.resize({ canvas, data, props, camera, scene });
}

// @TODO create an asset system to reduce duplication of models (etc.) in memory
function removeActiveModule(/*module*/) {
  // delete threeModuleData[module.meta.name];
}

function createPresetData(module) {
  return module.data;
}

function loadPresetData(module, data) {
  threeModuleData[module.meta.name] = data;
}

function resize({ width, height }) {
  inputTextureCanvas.width = width;
  inputTextureCanvas.height = height;
  renderer.setSize(width, height, false);
}

function getModuleData(name) {
  return threeModuleData[name];
}

export default {
  render,
  updateModule,
  resize,
  resizeModule,
  setupModule,
  removeActiveModule,
  createPresetData,
  loadPresetData,
  getModuleData,
};
export { threeModuleData };
