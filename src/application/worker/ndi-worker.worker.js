/* global BigInt */
import { getGrandioseSender, setupGrandiose } from "../setup-grandiose";

// Referenced from: https://github.com/rse/vingester/blob/master/vingester-browser-worker.js
// And: https://github.com/rse/grandiose

let sender;
let grandiose;

const canvas = new OffscreenCanvas(300, 300);
const context = canvas.getContext("2d");

const timeStart = BigInt(Date.now()) * BigInt(1e6) - process.hrtime.bigint();

function timeNow() {
  return timeStart + process.hrtime.bigint();
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
  FOURCC_FLTp
};

const bytesForRGBA = 4;

(async () => {
  grandiose = await setupGrandiose();
  sender = await getGrandioseSender();
})();

self.onmessage = async function({ data: { type, payload } }) {
  if (!sender || type !== "imageBitmap") {
    return;
  }

  const {
    imageBitmap,
    imageBitmap: { width, height },
    fps
  } = payload;

  canvas.width = width;
  canvas.height = height;

  context.drawImage(imageBitmap, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);

  const buffer = Buffer.from(imageData.data);

  const now = timeNow();
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
    data: buffer
  };

  sender.video(frame);
};
