import store from "./worker/store";

class MediaDeviceManager {
  constructor() {
    this._store = store;
    this.audioSources = [];
    this.videoSources = [];

    // Listen for device changes
    navigator.mediaDevices.ondevicechange = () => this.enumerateDevices();
  }

  /**
   * Enumerates available media devices and updates the store.
   * @returns {Promise<{audio: Array, video: Array}>}
   */
  async enumerateDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const sources = {
      audio: [],
      video: [],
    };

    for (const device of devices) {
      if (device.kind === "audioinput") {
        sources.audio.push(device);
      } else if (device.kind === "videoinput") {
        sources.video.push(device);
      }
    }

    this.audioSources = sources.audio;
    this.videoSources = sources.video;

    // Update Vuex store
    this._store.commit("mediaStream/CLEAR_AUDIO_SOURCES");
    this._store.commit("mediaStream/CLEAR_VIDEO_SOURCES");

    for (const source of this.audioSources) {
      this._store.commit("mediaStream/ADD_AUDIO_SOURCE", { source });
    }

    for (const source of this.videoSources) {
      this._store.commit("mediaStream/ADD_VIDEO_SOURCE", { source });
    }

    return sources;
  }

  /**
   * Selects an audio device by its ID.
   * @param {string} deviceId
   */
  selectAudioDevice(deviceId) {
    this._store.commit("mediaStream/SET_CURRENT_AUDIO_SOURCE", {
      audioId: deviceId,
    });
  }

  /**
   * Selects a video device by its ID.
   * @param {string} deviceId
   */
  selectVideoDevice(deviceId) {
    this._store.commit("mediaStream/SET_CURRENT_VIDEO_SOURCE", {
      videoId: deviceId,
    });
  }

  /**
   * Gets the current audio source ID from the store.
   * @returns {string|null}
   */
  get currentAudioSourceId() {
    return this._store.state.mediaStream.currentAudioSource;
  }

  /**
   * Gets the current video source ID from the store.
   * @returns {string|null}
   */
  get currentVideoSourceId() {
    return this._store.state.mediaStream.currentVideoSource;
  }
}

export default MediaDeviceManager;
