<template>
  <div
    v-infoView="{ title: iVTitle, body: iVBody, id: 'NDI Input Config' }"
    v-searchTerms="{
      terms: ['ndi', 'newtek', 'network', 'video'],
      title: 'NDI Config',
      type: 'Panel'
    }"
  >
    <grid columns="4" class="device-config">
      <c span="3">Available NDI Sources</c>
      <c span="1"
        ><Button class="light" @click="discover" :disabled="discovering">
          {{
            discovering ? `Discovering… (${timeRemaining})` : "Discover Sources"
          }}
        </Button></c
      >
      <c
        span="1.."
        class="ndi-row"
        v-for="(source, index) in ndiSources"
        :key="index"
      >
        <grid columns="4">
          <c span="3">{{ source.name }}</c>
          <c
            ><Button class="light" @click="recieve(source)"
              >Recieve source</Button
            ></c
          >
        </grid>
      </c>
    </grid>

    <hr />

    <grid columns="4" class="device-config">
      <c span="1..">Available NDI Receivers</c>

      <c
        span="1.."
        class="ndi-row"
        v-for="receiver in ndiReceivers"
        :key="receiver.id"
      >
        <grid columns="4">
          <c span="2">{{ receiver.receiver.source.name }}</c>
          <c
            ><Button class="light" @click="toggleReceiver(receiver)">
              {{ receiver.enabled ? "Disable" : "Enable" }}
            </Button></c
          >
          <c
            ><Button class="light" @click="removeReceiver(receiver)">
              Remove receiver
            </Button></c
          >
        </grid>
      </c>
    </grid>
  </div>
</template>

<script>
export default {
  data() {
    return {
      iVTitle: "NDI Input Config",
      iVBody:
        "Configure your NDI inputs here. Click Discover Sources to search for NDI sources available on your network. Click Enable to create an NDI reciever so modV can consume the NDI source. Once a receiver has been created, click Remove Receiver to stop modV consuming the NDI source.",

      timeRemaining: 0,
      timer: null
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
    }
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
      this.$modV.store.dispatch("ndi/createReceiver", { source });
    },

    toggleReceiver(receiver) {
      if (!receiver.enabled) {
        this.$modV.store.dispatch("ndi/enableReceiver", {
          receiverId: receiver.id
        });
      } else {
        this.$modV.store.dispatch("ndi/disableReceiver", {
          receiverId: receiver.id
        });
      }
    },

    removeReceiver(receiver) {
      this.$modV.store.dispatch("ndi/removeReceiver", {
        receiverId: receiver.id
      });
    }
  }
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
