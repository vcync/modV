import Meyda from "meyda";

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

async function setupMedia({ audioId, videoId }) {
  const { _store: store } = this;

  const mediaStreamDevices = await enumerateDevices.bind(this)();

  let audioSourceId = audioId;
  let videoSourceId = videoId;

  if (!audioSourceId && store.state["mediaStream"].currentAudioSource) {
    audioSourceId = store.state["mediaStream"].currentAudioSource;
  } else if (!audioSourceId && mediaStreamDevices.audio.length > 0) {
    audioSourceId = mediaStreamDevices.audio[0].deviceId;
  }

  if (!videoSourceId && store.state["mediaStream"].currentVideoSource) {
    videoSourceId = store.state["mediaStream"].currentVideoSource;
  } else if (!videoSourceId && mediaStreamDevices.video.length > 0) {
    videoSourceId = mediaStreamDevices.video[0].deviceId;
  }

  const mediaStream = await getMediaStream({ audioSourceId, videoSourceId });

  // This video element is required to keep the camera alive for the ImageCapture API
  // (this._imageCapture, ./index.js)
  this.videoStream = document.createElement("video");
  this.videoStream.autoplay = true;
  this.videoStream.muted = true;

  this.videoStream.srcObject = mediaStream;
  this.videoStream.onloadedmetadata = () => {
    this.videoStream.play();
  };

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

  store.commit("mediaStream/SET_CURRENT_AUDIO_SOURCE", {
    audioId: audioSourceId
  });
  store.commit("mediaStream/SET_CURRENT_VIDEO_SOURCE", {
    videoId: videoSourceId
  });

  return mediaStream;
}

export { enumerateDevices, setupMedia };
