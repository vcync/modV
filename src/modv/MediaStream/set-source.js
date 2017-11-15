import Meyda from 'meyda';
import Vue from '@/main';

function userMediaSuccess(stream, ids) {
  return new Promise((resolve) => {
    // Create video stream
    this.videoStream.src = window.URL.createObjectURL(stream);

    // If we have opened a previous AudioContext, destroy it as the number of AudioContexts
    // are limited to 6
    if (this.audioContext) this.audioContext.close();

    // Create new Audio Context
    this.audioContext = new window.AudioContext({
      latencyHint: 'playback',
    });

    // Create new Audio Analyser
    this.analyserNode = this.audioContext.createAnalyser();

    // Create a gain node
    this.gainNode = this.audioContext.createGain();

    // Mute the node
    this.gainNode.gain.value = 0;

    // Create the audio input stream (audio)
    this.audioStream = this.audioContext.createMediaStreamSource(stream);

    // Connect the audio stream to the analyser (this is a passthru) (audio->(analyser))
    this.audioStream.connect(this.analyserNode);

    // Connect the audio stream to the gain node (audio->(analyser)->gain)
    this.audioStream.connect(this.gainNode);

    // Connect the gain node to the output (audio->(analyser)->gain->destination)
    this.gainNode.connect(this.audioContext.destination);

    // Set up Meyda
    this.meyda = new Meyda.createMeydaAnalyzer({ //eslint-disable-line
      audioContext: this.audioContext,
      source: this.audioStream,
      bufferSize: 512,
    });

    // Tell the rest of the script we're all good.
    this.mediaSourcesInited = true;

    resolve(ids);
  });
}

function userMediaError(err, reject) {
  Vue.$dialog.alert({
    title: `WebAudio ${err.name}`,
    message: 'Error gaining access to audio and video inputs - please make sure you\'ve allowed modV access.',
    type: 'is-danger',
    hasIcon: true,
    icon: 'times-circle',
    iconPack: 'fa',
  });
  if (reject) reject();
}

function setMediaSource({ audioSourceId, videoSourceId }) {
  return new Promise((resolve, reject) => {
    const constraints = {};

    if (audioSourceId) {
      constraints.audio = {
        echoCancellation: { exact: false },
        deviceId: audioSourceId,
      };
    }

    if (videoSourceId) {
      constraints.video = {
        echoCancellation: { exact: false },
        deviceId: videoSourceId,
      };
    }

    /* Ask for user media access */
    navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
      userMediaSuccess.bind(this)(mediaStream, { audioSourceId, videoSourceId })
        .then(resolve);
    }).catch((err) => {
      userMediaError(err, reject);
    });
  });
}

export default setMediaSource;
