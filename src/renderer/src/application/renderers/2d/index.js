import store from "../../worker/store";
import { resizeCanvas, clearCanvas, copyCanvas } from "../utils";

const twoDCanvas = new OffscreenCanvas(300, 300);
const twoDContext = twoDCanvas.getContext("2d");
store.dispatch("outputs/addAuxillaryOutput", {
  name: "2d-buffer",
  context: twoDContext,
  group: "buffer",
});

/**
 * Called each frame to update the Module
 * @param  {Object}                   Module        A 2D Module
 * @param  {HTMLCanvas}               canvas        The Canvas to draw to
 * @param  {CanvasRenderingContext2D} context       The Context of the Canvas
 * @param  {HTMLVideoElement}         video         The video stream requested by modV
 * @param  {Array<MeydaFeatures>}     meydaFeatures Requested Meyda features
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
  osc,
  pipeline,
}) {
  // For pipeline mode, we need the intermediate canvas to avoid feedback loops
  if (pipeline) {
    // Optimized: Use shared utility for canvas resizing
    resizeCanvas(twoDCanvas, canvas.width, canvas.height);

    clearCanvas(twoDContext);
    copyCanvas(twoDContext, canvas);

    twoDContext.save();
    module.draw({
      canvas: twoDCanvas,
      context: twoDContext,
      video,
      features,
      meyda,
      delta,
      bpm,
      kick,
      props,
      data,
      osc,
    });
    twoDContext.restore();

    copyCanvas(context, twoDCanvas, canvas.width, canvas.height);
  } else {
    // Optimized: Draw directly to output canvas (no intermediate buffer)
    context.save();
    module.draw({
      canvas: canvas,
      context: context,
      video,
      features,
      meyda,
      delta,
      bpm,
      kick,
      props,
      data,
      osc,
    });
    context.restore();
  }
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
  const { data: dataUpdated } = moduleDefinition.update({
    props,
    data,
    canvas,
    context,
    delta,
    store,
  });

  return dataUpdated ?? data;
}

function resizeModule({ moduleDefinition, canvas, data, props }) {
  return moduleDefinition.resize({ canvas, data, props });
}

function resize({ width, height }) {
  // Optimized: Use shared utility for canvas resizing
  resizeCanvas(twoDCanvas, width, height);
}

/**
 * Setup module lifecycle method
 */
async function setupModule(moduleDefinition) {
  if (moduleDefinition.setupModule) {
    const result = await moduleDefinition.setupModule({
      store,
      moduleId: moduleDefinition.meta?.name || "unknown",
    });

    if (result && typeof result === "object") {
      // Update the module definition with any returned data
      if (result.data) {
        moduleDefinition.data = { ...moduleDefinition.data, ...result.data };
      }
    }
  }

  return moduleDefinition;
}

export default { render, resize, updateModule, resizeModule, setupModule };
