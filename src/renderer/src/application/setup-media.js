import Meyda from "meyda";
import constants from "./constants";

let floatFrequencyDataArray;
let byteFrequencyDataArray;
let byteTimeDomainDataArray;
let analyserNode;

async function getMediaStream({ audioSourceId, videoSourceId }) {
  const audioConstraints = {};
  const videoConstraints = {};

  if (audioSourceId) {
    audioConstraints.audio = {
      echoCancellation: { exact: false },
      deviceId: audioSourceId,
    };
  }

  if (videoSourceId) {
    videoConstraints.video = {
      deviceId: videoSourceId,
      frameRate: {
        ideal: 60,
      },
    };
  }

  /* Ask for user media access */
  return [
    audioSourceId && navigator.mediaDevices.getUserMedia(audioConstraints),
    videoSourceId && navigator.mediaDevices.getUserMedia(videoConstraints),
  ];
}

async function setupMedia({ audioId, videoId, useDefaultDevices = false }) {
  const { mediaDeviceManager } = this;

  const mediaStreamDevices = await mediaDeviceManager.enumerateDevices();

  let audioSourceId = audioId;
  let videoSourceId = videoId;

  if (!audioId && useDefaultDevices && mediaStreamDevices.audio.length > 0) {
    audioSourceId = mediaStreamDevices.audio[0].deviceId;
  }

  if (!videoId && useDefaultDevices && mediaStreamDevices.video.length > 0) {
    videoSourceId = mediaStreamDevices.video[0].deviceId;
  }

  const streams = [];

  if (audioId) {
    // When switching audio device, stop the previous audio stream
    streams.push(this._audioMediaStream);
  }

  // For video, do not stop existing streams when adding a new device
  // If the requested video device already exists, short-circuit
  if (videoId && this._imageCaptures && this._imageCaptures[videoSourceId]) {
    mediaDeviceManager.selectVideoDevice(videoSourceId);
    return [undefined, undefined];
  }

  for (let i = 0, len = streams.length; i < len; i++) {
    const stream = streams[i];

    if (stream) {
      const tracks = stream.getTracks();
      for (let j = 0, jLen = tracks.length; j < jLen; j++) {
        const track = tracks[j];
        track.stop();
      }
    }
  }

  const [audioMediaStream, videoMediaStream] = await Promise.all(
    await getMediaStream({
      audioSourceId,
      videoSourceId,
    }),
  );

  // This video element is required to keep the camera alive for the ImageCapture API
  // (this._imageCapture, ./index.js)
  if (videoMediaStream) {
    // Create a hidden video element per device to keep streams alive
    const videoEl = document.createElement("video");
    videoEl.autoplay = true;
    videoEl.muted = true;
    videoEl.srcObject = videoMediaStream;
    videoEl.onloadedmetadata = () => {
      videoEl.play();
    };

    const [track] = videoMediaStream.getVideoTracks();
    if (track) {
      // Store ImageCapture per device
      if (!this._imageCaptures) this._imageCaptures = {};
      this._imageCaptures[videoSourceId] = new ImageCapture(track);
      // Start async capture loop for this deviceId
      this.startCaptureForDevice && this.startCaptureForDevice(videoSourceId);
    }

    // Keep reference to the video element per deviceId for possible cleanup
    if (!this.videoStreams) this.videoStreams = {};
    // Stop and replace any existing stream for the same deviceId
    if (this.videoStreams[videoSourceId]) {
      try {
        this.videoStreams[videoSourceId].pause();
      } catch (e) {
        // Ignore
      }
      this.videoStreams[videoSourceId].srcObject = null;
    }
    this.videoStreams[videoSourceId] = videoEl;

    mediaDeviceManager.selectVideoDevice(videoSourceId);
  }

  if (audioMediaStream) {
    if (this.audioContext) {
      this.audioContext.close();
    }

    // Create new Audio Context
    this.audioContext = new window.AudioContext({
      latencyHint: "playback",
    });

    // Create new Audio Analyser
    analyserNode = this.audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 0;

    // Set up arrays for analyser
    floatFrequencyDataArray = new Float32Array(analyserNode.frequencyBinCount);
    byteFrequencyDataArray = new Uint8Array(analyserNode.frequencyBinCount);
    byteTimeDomainDataArray = new Uint8Array(
      analyserNode.frequencyBinCount / 2,
    );

    // Create a gain node
    this.gainNode = this.audioContext.createGain();

    // Default gain
    this.gainNode.gain.value = 1;

    // Create the audio input stream (audio)
    this.audioStream =
      this.audioContext.createMediaStreamSource(audioMediaStream);

    // Connect the audio stream to the analyser (this is a passthru) (audio->(analyser))
    this.audioStream.connect(analyserNode);

    // Connect the audio stream to the gain node (audio->(analyser)->gain)
    this.audioStream.connect(this.gainNode);

    // Set up Meyda
    // eslint-disable-next-line new-cap
    this.meyda = new Meyda.createMeydaAnalyzer({
      audioContext: this.audioContext,
      source: this.gainNode,
      bufferSize: constants.AUDIO_BUFFER_SIZE,
      windowingFunction: "rect",
      featureExtractors: ["complexSpectrum"],
    });

    mediaDeviceManager.selectAudioDevice(audioSourceId);
  }

  this._audioMediaStream = audioMediaStream || this._audioMediaStream;
  this._videoMediaStream = videoMediaStream || this._videoMediaStream;

  return [audioMediaStream, videoMediaStream];
}

function getFloatFrequencyData() {
  analyserNode.getFloatFrequencyData(floatFrequencyDataArray);

  return floatFrequencyDataArray;
}

function getByteFrequencyData() {
  analyserNode.getByteFrequencyData(byteFrequencyDataArray);
  return byteFrequencyDataArray;
}

function getByteTimeDomainData() {
  analyserNode.getByteTimeDomainData(byteTimeDomainDataArray);
  return byteTimeDomainDataArray;
}

export {
  setupMedia,
  getFloatFrequencyData,
  getByteFrequencyData,
  getByteTimeDomainData,
};
