<template>
  <div class="container">
    <h1 class="title">Options</h1>
    <div class="columns is-multiline">
      <div class="column is-4">
        <div class="card">
          <p class="card-header-title">
            Input
          </p>
          <div class="card-content">
            <div class="content">
              <div class="field">
                Audio input:
                <b-select v-model="audioSource" placeholder="Select an input">
                  <option
                    v-for="source in audioSources"
                    :key="source.deviceId"
                    :value="source.deviceId"
                    >{{ source.label }}</option
                  >
                </b-select>
              </div>
              <div class="field">
                Video input:
                <b-select v-model="videoSource" placeholder="Select an input">
                  <option
                    v-for="source in videoSources"
                    :key="source.deviceId"
                    :value="source.deviceId"
                    >{{ source.label }}</option
                  >
                </b-select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-4">
        <div class="card">
          <p class="card-header-title">
            Output
          </p>
          <div class="card-content">
            <div class="content">
              <div class="field">
                <b-checkbox v-model="retina"
                  >Use retina resolutions (*{{ devicePixelRatio }})</b-checkbox
                >
              </div>
              <div class="field">
                <b-checkbox v-model="constrainToOneOne"
                  >Constrain output to 1:1 ratio</b-checkbox
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-4">
        <div class="card">
          <p class="card-header-title">
            BPM
          </p>
          <div class="card-content">
            <div class="content">
              <div class="field">
                <b-checkbox v-model="detect">Detect BPM</b-checkbox>
              </div>
              <div class="field">
                <button class="button" :disabled="detect" @click="tempoTap">
                  Tap Tempo ({{ parseInt(bpm, 10) }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-4">
        <div class="card">
          <p class="card-header-title">
            User
          </p>
          <div class="card-content">
            <div class="content">
              <b-field label="Set Username">
                <b-input v-model="nameInput" @keypress.enter="saveName" />
                <p class="control">
                  <button
                    class="button is-primary"
                    @click="saveName(nameInput)"
                  >
                    Save
                  </button>
                </p>
              </b-field>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Tt from 'tap-tempo'

const tapTempo = new Tt()

export default {
  name: 'GlobalControls',
  data() {
    return {
      mediaPathInput: ''
    }
  },
  computed: {
    ...mapGetters('mediaStream', ['audioSources', 'videoSources']),
    ...mapGetters('tempo', ['bpm', 'detect']),
    ...mapGetters('user', ['mediaPath']),

    detect: {
      get() {
        return this.$store.state.tempo.detect
      },
      set(value) {
        this.$store.commit('tempo/setBpmDetect', {
          detect: value
        })
      }
    },

    constrainToOneOne: {
      get() {
        return this.$store.state.user.constrainToOneOne
      },
      set(value) {
        this.$store.dispatch('user/setConstrainToOneOne', value)
      }
    },

    retina: {
      get() {
        return this.$store.state.user.useRetina
      },
      set(value) {
        this.$store.dispatch('user/setUseRetina', { useRetina: value })
      }
    },

    audioSource: {
      get() {
        return this.$store.state.user.currentAudioSource || 'default'
      },
      set(value) {
        this.$store.dispatch('user/setCurrentAudioSource', { sourceId: value })
      }
    },

    videoSource: {
      get() {
        return this.$store.state.user.currentVideoSource || 'default'
      },
      set(value) {
        this.$store.dispatch('user/setCurrentVideoSource', { sourceId: value })
      }
    },

    nameInput: {
      get() {
        return this.$store.state.user.name
      },
      set(value) {
        this.saveName(value)
      }
    },

    devicePixelRatio() {
      return window.devicePixelRatio
    }
  },
  created() {
    tapTempo.on('tempo', bpm => {
      if (this.bpm === Math.round(bpm)) return
      this.setBpm({ bpm: Math.round(bpm) })
    })
  },
  methods: {
    ...mapActions('tempo', ['setBpm']),
    tempoTap() {
      tapTempo.tap()
    },
    saveName(value) {
      this.$store.commit('user/setName', { name: value })
    }
  }
}
</script>

<style scoped>
label,
#BPMDisplayGlobal {
  color: #bdbdbd;
}

label.pure-button {
  width: initial !important;
}

.title {
  color: #fff;
}
</style>
