/* global BigInt */
/* env node worker */
import { getGrandioseSender, setupGrandiose } from "../setup-grandiose";

let sender;
let grandiose;

const canvas = new OffscreenCanvas(256, 256);
const context = canvas.getContext("2d", {
  alpha: false,
  willReadFrequently: true,
});

// process.hrtime accessed via global["process"] to bypass the slightly
// incorrect bundle polyfill
const timeStart =
  BigInt(Date.now()) * BigInt(1e6) - global["process"].hrtime.bigint();

function timeNow() {
  return timeStart + global["process"].hrtime.bigint();
}

let buffer;
let imageData;
let senderPromise;
let ndiWidth = 256;
let ndiHeight = 256;
let prevTime = performance.now();
let frames = 0;
let targetFps = 60;
let followModVFps = true;
let actualFps = 0;

const NDI_LIB_FOURCC = (ch0, ch1, ch2, ch3) =>
  ch0.charCodeAt(0) |
  (ch1.charCodeAt(0) << 8) |
  (ch2.charCodeAt(0) << 16) |
  (ch3.charCodeAt(0) << 24);

const FOURCC_UYVY = NDI_LIB_FOURCC("U", "Y", "V", "Y");
const FOURCC_UYVA = NDI_LIB_FOURCC("U", "Y", "V", "A");
const FOURCC_P216 = NDI_LIB_FOURCC("P", "2", "1", "6");
const FOURCC_PA16 = NDI_LIB_FOURCC("P", "A", "1", "6");
const FOURCC_YV12 = NDI_LIB_FOURCC("Y", "V", "1", "2");
const FOURCC_I420 = NDI_LIB_FOURCC("I", "4", "2", "0");
const FOURCC_NV12 = NDI_LIB_FOURCC("N", "V", "1", "2");
const FOURCC_BGRA = NDI_LIB_FOURCC("B", "G", "R", "A");
const FOURCC_BGRX = NDI_LIB_FOURCC("B", "G", "R", "X");
const FOURCC_RGBA = NDI_LIB_FOURCC("R", "G", "B", "A");
const FOURCC_RGBX = NDI_LIB_FOURCC("R", "G", "B", "X");
const FOURCC_FLTp = NDI_LIB_FOURCC("F", "L", "T", "p");

const fourCC = {
  FOURCC_UYVY,
  FOURCC_UYVA,
  FOURCC_P216,
  FOURCC_PA16,
  FOURCC_YV12,
  FOURCC_I420,
  FOURCC_NV12,
  FOURCC_BGRA,
  FOURCC_BGRX,
  FOURCC_RGBA,
  FOURCC_RGBX,
  FOURCC_FLTp,
};

(async () => {
  grandiose = await setupGrandiose();
  sender = await getGrandioseSender();
})();

// @TODO add extra handling for Grandiose destroy. self.onclose seems to do
// nothing. This should allow us to keep one NDI Output name instead of
// appending the date. Also better for memory as somewhere a reference is kept
// to the old sender.
self.onclose = function () {
  if (sender) {
    sender.destroy();
  }
};

self.onmessage = async function ({ data: { type, payload } }) {
  if (type === "setScale") {
    const { width, height } = payload;
    ndiWidth = width;
    ndiHeight = height;
  }

  if (type === "destroy") {
    console.log(
      "ndi worker got modv-destroy, doing that and replying destroyed",
    );

    if (senderPromise) {
      await senderPromise;
    }

    await sender.destroy();
    self.postMessage("destroyed");
    sender = null;
    self.close();
    return;
  }

  if (!sender || type !== "imageBitmap") {
    return;
  }

  const {
    imageBitmap,
    imageBitmap: { width, height },
  } = payload;

  canvas.width = width;
  canvas.height = height;

  context.drawImage(imageBitmap, 0, 0);
  imageBitmap.close();

  imageData = context.getImageData(0, 0, width, height);

  buffer = Buffer.from(imageData.data);

  if (buffer.byteLength % 4 !== 0) {
    return;
  }

  // https://github.com/rse/vingester/blob/master/vingester-browser-worker.js
  const now = timeNow();
  const bytesForRGBA = 4;
  const frame = {
    timecode: now / BigInt(100),

    xres: width,
    yres: height,
    frameRateN: actualFps * 1000,
    frameRateD: 1000,
    pictureAspectRatio: width / height,
    frameFormatType: grandiose.FORMAT_TYPE_PROGRESSIVE,
    lineStrideBytes: width * bytesForRGBA,

    fourCC: fourCC.FOURCC_RGBX,
    data: buffer,
  };

  senderPromise = sender.video(frame);
  await senderPromise;

  frames += 1;

  const time = performance.now();

  if (time >= prevTime + 1000) {
    actualFps = (frames * 1000) / (time - prevTime);

    prevTime = time;
    frames = 0;
  }
};
