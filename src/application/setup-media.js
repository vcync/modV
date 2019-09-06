import Meyda from "meyda";

export default async function setupMedia() {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: { exact: false }
    },
    video: { width: 1920, height: 1080 }
  });

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
}
