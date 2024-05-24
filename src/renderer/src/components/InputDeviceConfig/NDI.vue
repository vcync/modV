<template>
  <div
    v-infoView="{ title: iVTitle, body: iVBody, id: 'NDI Input Config' }"
    v-searchTerms="{
      terms: ['ndi', 'newtek', 'network', 'video'],
      title: 'NDI Config',
      type: 'Panel',
    }"
  >
    <grid columns="4" class="device-config">
      <c span="4">NDI Output Settings</c>

      <c span="2">Enable Output</c>
      <c span="2"><Checkbox v-model="ndiOutputEnabled" class="light" /></c>

      <c span="2">Output Name</c>
      <c span="2"
        ><TextInput
          v-model="ndiOutputName"
          class="light"
          :disabled="ndiOutputEnabled"
          :title="
            ndiOutputEnabled
              ? 'You must disable the output to rename it'
              : undefined
          "
      /></c>

      <c span="2">Follow modV Output Resolution</c>
      <c span="2"><Checkbox v-model="followModVOutputSize" class="light" /></c>

      <c span="2">Resolution</c>
      <c span="2">
        <Number
          :disabled="followModVOutputSize"
          :model-value="followModVOutputSize ? outputWidth : ndiOutputWidth"
          @update:model="widthInput"
        />×<Number
          :disabled="followModVOutputSize"
          :model-value="followModVOutputSize ? outputHeight : ndiOutputHeight"
          @update:model="heightInput"
        />
      </c>
    </grid>
    <hr />
    <grid columns="4" class="device-config">
      <c span="3">Available NDI Sources</c>
      <c span="1">
        <Button class="light" :disabled="discovering" @click="discover">
          {{
            discovering ? `Discovering… (${timeRemaining})` : "Discover Sources"
          }}
        </Button>
      </c>
      <c
        v-for="(source, index) in ndiSources"
        :key="index"
        span="1.."
        class="ndi-row"
      >
        <grid columns="4">
          <c span="3">{{ source.name }}</c>
          <c>
            <Button class="light" @click="recieve(source)">
              Recieve source
            </Button>
          </c>
        </grid>
      </c>
    </grid>

    <hr />

    <grid columns="4" class="device-config">
      <c span="1..">Available NDI Receivers</c>

      <c
        v-for="receiver in ndiReceivers"
        :key="receiver.id"
        span="1.."
        class="ndi-row"
      >
        <grid columns="4">
          <c span="2">{{ receiver.receiver.source.name }}</c>
          <c>
            <Button class="light" @click="toggleReceiver(receiver)">
              {{ receiver.enabled ? "Disable" : "Enable" }}
            </Button>
          </c>
          <c>
            <Button class="light" @click="removeReceiver(receiver)">
              Remove receiver
            </Button>
          </c>
        </grid>
      </c>
    </grid>
  </div>
</template>

<script>
import Checkbox from "../inputs/Checkbox.vue";

export default {
  components: {
    Checkbox,
  },

  data() {
    return {
      iVTitle: "NDI Config",
      iVBody:
        "Configure your NDI settings here. Click Discover Sources to search for NDI sources available on your network. Click Enable to create an NDI reciever so modV can consume the NDI source. Once a receiver has been created, click Remove Receiver to stop modV consuming the NDI source.",

      timeRemaining: 0,
      timer: null,
    };
  },

  computed: {
    discovering() {
      return this.$modV.store.state.ndi.discovering;
    },

    ndiSources() {
      return this.$modV.store.state.ndi.sources;
    },

    ndiReceivers() {
      return this.$modV.store.state.ndi.receivers;
    },

    outputWidth() {
      return this.$modV.store.state.size.width;
    },

    outputHeight() {
      return this.$modV.store.state.size.height;
    },

    ndiOutputEnabled: {
      get() {
        return this.$modV.store.state.ndi.outputEnabled;
      },

      set(value) {
        this.$modV.store.commit("ndi/SET_OUTPUT_ENABLED", value);
      },
    },

    ndiOutputName: {
      get() {
        return this.$modV.store.state.ndi.outputName;
      },
      set(value) {
        this.$modV.store.commit("ndi/SET_OUTPUT_NAME", value);
      },
    },

    ndiOutputWidth() {
      return this.$modV.store.state.ndi.outputWidth;
    },

    ndiOutputHeight() {
      return this.$modV.store.state.ndi.outputHeight;
    },

    followModVOutputSize: {
      get() {
        return this.$modV.store.state.ndi.followModVOutputSize;
      },
      set(value) {
        this.$modV.store.commit("ndi/SET_FOLLOW_MODV_OUTPUT_SIZE", value);
      },
    },
  },

  watch: {
    discovering(value) {
      if (!value) {
        clearInterval(this.timer);
      }
    },
  },

  methods: {
    discover() {
      this.$modV.store.dispatch("ndi/discoverSources");
      this.timeRemaining = this.$modV.store.state.ndi.timeout / 1000;

      this.timer = setInterval(() => {
        this.timeRemaining -= 1;

        if (this.timeRemaining < 1) {
          clearInterval(this.timer);
        }
      }, 1000);
    },

    recieve(source) {
      this.$modV.store.dispatch("ndi/createReceiver", {
        source: JSON.parse(JSON.stringify(source)),
      });
    },

    toggleReceiver(receiver) {
      if (!receiver.enabled) {
        this.$modV.store.dispatch("ndi/enableReceiver", {
          receiverId: receiver.id,
        });
      } else {
        this.$modV.store.dispatch("ndi/disableReceiver", {
          receiverId: receiver.id,
        });
      }
    },

    removeReceiver(receiver) {
      this.$modV.store.dispatch("ndi/removeReceiver", {
        receiverId: receiver.id,
      });
    },

    widthInput(width) {
      this.$modV.store.commit("ndi/SET_OUTPUT_SIZE", {
        width,
      });
    },

    heightInput(height) {
      this.$modV.store.commit("ndi/SET_OUTPUT_SIZE", {
        height,
      });
    },
  },
};
</script>

<style>
.ndi-row:nth-child(odd) {
  background-color: var(--foreground-color-4);
}
.ndi-row:nth-child(even) {
  background-color: var(--foreground-color-3);
}
</style>
