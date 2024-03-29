import Meyda from "meyda";
import constants from "./constants";

let floatFrequencyDataArray;
let byteFrequencyDataArray;
let byteTimeDomainDataArray;
let analyserNode;

async function enumerateDevices() {
  const { _store: store } = this;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const sources = {
    audio: [],
    video: []
  };

  for (let i = 0, len = devices.length; i < len; i++) {
    const device = devices[i];

    if (device.kind === "audioinput") {
      sources.audio.push(device);
    } else if (device.kind === "videoinput") {
      sources.video.push(device);
    }
  }

  store.commit("mediaStream/CLEAR_AUDIO_SOURCES");
  store.commit("mediaStream/CLEAR_VIDEO_SOURCES");

  const audioDevices = sources.audio;
  for (let i = 0, len = audioDevices.length; i < len; i++) {
    store.commit("mediaStream/ADD_AUDIO_SOURCE", { source: audioDevices[i] });
  }

  const videoDevices = sources.video;
  for (let i = 0, len = videoDevices.length; i < len; i++) {
    store.commit("mediaStream/ADD_VIDEO_SOURCE", { source: videoDevices[i] });
  }

  return sources;
}

async function getMediaStream({ audioSourceId, videoSourceId }) {
  const audioConstraints = {};
  const videoConstraints = {};

  if (audioSourceId) {
    audioConstraints.audio = {
      echoCancellation: { exact: false },
      deviceId: audioSourceId
    };
  }

  if (videoSourceId) {
    videoConstraints.video = {
      deviceId: videoSourceId,
      frameRate: {
        ideal: 60
      }
    };
  }

  /* Ask for user media access */
  return [
    audioSourceId && navigator.mediaDevices.getUserMedia(audioConstraints),
    videoSourceId && navigator.mediaDevices.getUserMedia(videoConstraints)
  ];
}

async function setupMedia({ audioId, videoId, useDefaultDevices = false }) {
  const { _store: store } = this;

  const mediaStreamDevices = await enumerateDevices.bind(this)();

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
    streams.push(this._audioMediaStream);
  }

  if (videoId) {
    streams.push(this._videoMediaStream);
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
      videoSourceId
    })
  );

  // This video element is required to keep the camera alive for the ImageCapture API
  // (this._imageCapture, ./index.js)
  if (videoMediaStream) {
    if (this.videoStream) {
      this.videoStream.pause();
      delete this.videoStream;
    }

    this.videoStream = document.createElement("video");
    this.videoStream.autoplay = true;
    this.videoStream.muted = true;

    this.videoStream.srcObject = videoMediaStream;
    this.videoStream.onloadedmetadata = () => {
      this.videoStream.play();
    };

    const [track] = videoMediaStream.getVideoTracks();
    if (track) {
      this._imageCapture = new ImageCapture(track);
    }

    store.commit("mediaStream/SET_CURRENT_VIDEO_SOURCE", {
      videoId: videoSourceId
    });
  }

  if (audioMediaStream) {
    if (this.audioContext) {
      this.audioContext.close();
    }

    // Create new Audio Context
    this.audioContext = new window.AudioContext({
      latencyHint: "playback"
    });

    // Create new Audio Analyser
    analyserNode = this.audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 0;

    // Set up arrays for analyser
    floatFrequencyDataArray = new Float32Array(analyserNode.frequencyBinCount);
    byteFrequencyDataArray = new Uint8Array(analyserNode.frequencyBinCount);
    byteTimeDomainDataArray = new Uint8Array(
      analyserNode.frequencyBinCount / 2
    );

    // Create a gain node
    this.gainNode = this.audioContext.createGain();

    // Default gain
    this.gainNode.gain.value = 1;

    // Create the audio input stream (audio)
    this.audioStream = this.audioContext.createMediaStreamSource(
      audioMediaStream
    );

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
      featureExtractors: ["complexSpectrum"]
    });

    store.commit("mediaStream/SET_CURRENT_AUDIO_SOURCE", {
      audioId: audioSourceId
    });
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
  enumerateDevices,
  setupMedia,
  getFloatFrequencyData,
  getByteFrequencyData,
  getByteTimeDomainData
};
