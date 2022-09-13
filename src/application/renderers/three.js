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
  premultipliedAlpha: false
});

store.dispatch("outputs/addAuxillaryOutput", {
  name: "three-buffer",
  context: threeContext,
  group: "buffer"
});

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  canvas: threeCanvas
});
renderer.setPixelRatio(1);

const inputTextureCanvas = new OffscreenCanvas(300, 300);
const inputTextureContext = inputTextureCanvas.getContext("2d");
store.dispatch("outputs/addAuxillaryOutput", {
  name: "three-inputTexture-buffer",
  context: inputTextureContext,
  group: "buffer"
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
  pipeline
}) {
  inputTextureContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  inputTexture.image = inputTextureCanvas.transferToImageBitmap();
  inputTexture.needsUpdate = true;

  const { scene } = threeModuleData[module.meta.name];

  const { camera } = module.draw({
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
    data: { ...data, scene },
    fftCanvas
  });

  renderer.render(scene, camera);

  // clear context if we're in pipeline mode
  if (pipeline) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Copy three Canvas to Main Canvas
  context.drawImage(threeCanvas, 0, 0, canvas.width, canvas.height);
}

async function setupModule(module) {
  const moduleData = await module.setupThree({
    THREE,
    inputTexture,
    data: module.data || {},
    width: renderer.domElement.width,
    height: renderer.domElement.height
  });

  // We have to use the name for now, as module.$id is not defined yet.
  // This gives us the limitation that we can't have multiple instances of the
  // same three-module in modV as they would share the same scene
  threeModuleData[module.meta.name] = {
    scene: moduleData.scene
  };

  delete moduleData.scene;

  module.data = moduleData;

  return module;
}

function removeModule(module) {
  delete threeModuleData[module.meta.name];
}

function createPresetData(module) {
  delete module.data.scene;
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

export default {
  render,
  resize,
  setupModule,
  removeModule,
  createPresetData,
  loadPresetData
};
export { threeModuleData };
