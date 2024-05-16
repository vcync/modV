/* global BigInt */
/* env node worker */
import { getGrandioseSender, setupGrandiose } from "../setup-grandiose";

let sender;
let grandiose;

const canvas = new OffscreenCanvas(300, 300);
const context = canvas.getContext("2d", { willReadFrequently: true });

// process.hrtime accessed via global["process"] to bypass the slightly
// incorrect bundle polyfill
const timeStart =
  BigInt(Date.now()) * BigInt(1e6) - global["process"].hrtime.bigint();

function timeNow() {
  return timeStart + global["process"].hrtime.bigint();
}

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
  if (!sender || (type !== "imageBitmap" && type !== "destroy")) {
    return;
  }

  if (type === "destroy") {
    console.log(
      "ndi worker got modv-destroy, doing that and replying destroyed",
    );

    sender.destroy();
    self.postMessage("destroyed");
    sender = null;
    self.close();
    return;
  }

  const {
    imageBitmap,
    imageBitmap: { width, height },
    fps,
  } = payload;

  canvas.width = width;
  canvas.height = height;

  context.drawImage(imageBitmap, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);

  const buffer = Buffer.from(imageData.data);

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
    frameRateN: fps * 1000,
    frameRateD: 1000,
    pictureAspectRatio: width / height,
    frameFormatType: grandiose.FORMAT_TYPE_PROGRESSIVE,
    lineStrideBytes: width * bytesForRGBA,

    fourCC: fourCC.FOURCC_RGBA,
    data: buffer,
  };

  sender.video(frame);
};
