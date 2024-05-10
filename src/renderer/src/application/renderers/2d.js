import store from "../worker/store";

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
}) {
  if (
    twoDCanvas.width !== canvas.width ||
    twoDCanvas.height !== canvas.height
  ) {
    twoDCanvas.width = canvas.width;
    twoDCanvas.height = canvas.height;
  }

  twoDContext.clearRect(0, 0, canvas.width, canvas.height);
  twoDContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);

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
  });
  twoDContext.restore();

  context.drawImage(twoDCanvas, 0, 0, canvas.width, canvas.height);
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
  });

  return dataUpdated ?? data;
}

function resizeModule({ moduleDefinition, canvas, data, props }) {
  return moduleDefinition.resize({ canvas, data, props });
}

function resize({ width, height }) {
  twoDCanvas.width = width;
  twoDCanvas.height = height;
}

export default { render, resize, updateModule, resizeModule };
