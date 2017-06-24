<template>
  <div class="pure-u-1-1 global-controls right-controls">
    <div class="control-group bpm-group">
      <label for="detectBPMGlobal">Detect BPM</label>
      <input id="detectBPMGlobal" type="checkbox" class="enable" checked="true" v-model='detectBpm'><br>
      <label>BPM Tapper</label>
      <input id="BPMtapperGlobal" type="button" value="Tap BPM" class="enable pure-button" @click='tempoTap'>
      <span id="BPMDisplayGlobal">{{ parseInt(bpm, 10) }}</span>
    </div>
    <div class="control-group audioSource-group">
      <label for="audioSourceGlobal">Set audio input</label>
      <select id="audioSourceGlobal" v-model='audioSource'>
        <option
          v-for='source in audioSources'
          :value='source.deviceId'
        >{{ source.label }}</option>
      </select>
    </div>
    <div class="control-group monitor-group">
      <label for="monitorAudioGlobal">Monitor audio input</label>
      <input id="monitorAudioGlobal" type="checkbox" class="enable">
    </div>
    <div class="control-group videoSource-group">
      <label for="videoSourceGlobal">Set video input</label>
      <select id="videoSourceGlobal" v-model='videoSource'>
        <option
          v-for='source in videoSources'
          :value='source.deviceId'
        >{{ source.label }}</option>
      </select>
    </div>
    <div class="control-group factory-group">
      <label for="factoryResetGlobal">Factory Reset</label>
      <input id="factoryResetGlobal" type="button" value="Factory Reset" class="enable pure-button">
    </div>

    <div class="control-group set-username-group">
      <label>Set Name</label>
      <input type="text" id="setUsername" v-model='nameInput' @keypress.enter='saveName'>
      <input id="setUsernameGlobal" type="button" value="Save Name" class="enable pure-button" @click='saveName'>
    </div>

    <div class="control-group set-mediapath">
      <label>Set Media Folder</label>
      <input
        style="display:none"
        type="file"
        id="selectMediaFolderGlobal"
        webkitdirectory="true"
        directory="true"
        nwdirectory="true"
        @change='mediaPathChanged'
      >
      <label for="selectMediaFolderGlobal" class="pure-button">Select Media Folder</label>
    </div>
    <div class="control-group retina-group">
      <label for="retinaGlobal">Use retina resolutions</label>
      <input id="retinaGlobal" type="checkbox" class="enable" v-model='useRetinaInput'>
    </div>

    <div class="control-group newOutputWindow-group">
      <label for="newOutputWindowGlobal">New output window</label>
      <input id="newOutputWindowGlobal" type="button" value="Open" class="enable pure-button" @click='createWindow'>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import Tt from 'tap-tempo';

  const tapTempo = new Tt();

  export default {
    name: 'globalControls',
    data() {
      return {
        audioSource: 'default',
        videoSource: 'default',
        detectBpm: true,
        mediaPathInput: '',
        nameInput: '',
        useRetinaInput: true
      };
    },
    computed: {
      ...mapGetters('mediaStream', [
        'audioSources',
        'videoSources',
      ]),
      ...mapGetters('tempo', [
        'bpm',
        'detect'
      ]),
      ...mapGetters('user', [
        'mediaPath',
        'name',
        'useRetina',
        'currentAudioSource',
        'currentVideoSource'
      ]),
    },
    methods: {
      ...mapMutations('tempo', [
        'setBpm',
        'setBpmDetect'
      ]),
      ...mapMutations('user', [
        'setMediaPath',
        'setName'
      ]),
      ...mapActions('user', [
        'setUseRetina',
        'setCurrentAudioSource',
        'setCurrentVideoSource'
      ]),
      ...mapActions('windows', [
        'createWindow'
      ]),
      tempoTap() {
        tapTempo.tap();
      },
      saveName() {
        this.setName({ name: this.nameInput });
      },
      mediaPathChanged(e) {
        this.mediaPathInput = e.target.value;
      }
    },
    watch: {
      currentAudioSource() {
        this.audioSource = this.currentAudioSource;
      },
      currentVideoSource() {
        this.videoSource = this.currentVideoSource;
      },
      audioSource() {
        if(this.audioSource === this.currentAudioSource) return;
        this.setCurrentAudioSource({ sourceId: this.audioSource });
      },
      videoSource() {
        if(this.videoSource === this.currentVideoSource) return;
        this.setCurrentVideoSource({ sourceId: this.videoSource });
      },
      detect() {
        this.detectBpm = this.detect;
      },
      detectBpm() {
        this.setBpmDetect({ detect: this.detectBpm });
      },
      mediaFolderInput() {
        this.setMediaPath({ path: this.mediaFolderInput });
      },
      useRetinaInput() {
        this.setUseRetina({ useRetina: this.useRetinaInput });
      }
    },
    created() {
      tapTempo.on('tempo', (bpm) => {
        if(this.bpm === Math.round(bpm)) return;
        this.setBpm({ bpm: Math.round(bpm) });
      });

      this.nameInput = this.name;
      this.useRetinaInput = this.useRetina;
      this.audioSource = this.currentAudioSource || 'default';
      this.videoSource = this.currentVideoSource || 'default';
    }
  };
</script>

<style scoped>
  label.pure-button {
    width: initial !important;
  }
</style>