import Meyda from "meyda";

async function scanSources() {
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

  return sources;
}

async function getMediaStream({ audioSourceId, videoSourceId }) {
  const constraints = {};

  if (audioSourceId) {
    constraints.audio = {
      echoCancellation: { exact: false },
      deviceId: audioSourceId
    };
  }

  if (videoSourceId) {
    constraints.video = {
      deviceId: videoSourceId
    };
  }

  /* Ask for user media access */
  return navigator.mediaDevices.getUserMedia(constraints);
}

export default async function setupMedia() {
  const { _store: store } = this;

  const mediaStreamDevices = await scanSources();

  const audioDevices = mediaStreamDevices.audio;
  for (let i = 0, len = audioDevices.length; i < len; i++) {
    store.commit("media-stream/ADD_AUDIO_SOURCE", { source: audioDevices[i] });
  }

  const videoDevices = mediaStreamDevices.video;
  for (let i = 0, len = videoDevices.length; i < len; i++) {
    store.commit("media-stream/ADD_VIDEO_SOURCE", { source: videoDevices[i] });
  }

  let audioSourceId;
  let videoSourceId;

  if (store.getters["user/currentAudioSource"]) {
    audioSourceId = store.getters["user/currentAudioSource"];
  } else if (mediaStreamDevices.audio.length > 0) {
    audioSourceId = mediaStreamDevices.audio[0].deviceId;
  }

  if (store.getters["user/setCurrentVideoSource"]) {
    videoSourceId = store.getters["user/setCurrentVideoSource"];
  } else if (mediaStreamDevices.video.length > 0) {
    videoSourceId = mediaStreamDevices.video[0].deviceId;
  }

  const mediaStream = await getMediaStream({ audioSourceId, videoSourceId });

  if (this.audioContext) this.audioContext.close();

  // Create new Audio Context
  this.audioContext = new window.AudioContext({
    latencyHint: "playback"
  });

  // Create new Audio Analyser
  this.analyserNode = this.audioContext.createAnalyser();

  // Create a gain node
  this.gainNode = this.audioContext.createGain();

  // Mute the node
  this.gainNode.gain.value = 0;

  // Create the audio input stream (audio)
  this.audioStream = this.audioContext.createMediaStreamSource(mediaStream);

  // Connect the audio stream to the analyser (this is a passthru) (audio->(analyser))
  this.audioStream.connect(this.analyserNode);

  // Connect the audio stream to the gain node (audio->(analyser)->gain)
  this.audioStream.connect(this.gainNode);

  // Connect the gain node to the output (audio->(analyser)->gain->destination)
  this.gainNode.connect(this.audioContext.destination);

  // Set up Meyda
  // eslint-disable-next-line new-cap
  this.meyda = new Meyda.createMeydaAnalyzer({
    audioContext: this.audioContext,
    source: this.audioStream,
    bufferSize: 512,
    windowingFunction: "rect",
    featureExtractors: ["complexSpectrum"]
  });

  return mediaStream;
}
