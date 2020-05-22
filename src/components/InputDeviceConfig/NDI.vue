<template>
  <div>
    <grid columns="4" class="device-config">
      <c span="3">Available NDI Sources</c>
      <c span="1"
        ><button @click="discover" :disabled="discovering">
          {{ discovering ? "Discovering…" : "Discover Sources" }}
        </button></c
      >
      <c
        span="1.."
        class="ndi-row"
        v-for="(source, index) in ndiSources"
        :key="index"
      >
        <grid columns="4">
          <c span="3">{{ source.name }}</c>
          <c><button @click="recieve(source)">Recieve source</button></c>
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
            ><button @click="toggleReceiver(receiver)">
              {{ receiver.enabled ? "Disable" : "Enable" }}
            </button></c
          >
          <c
            ><button @click="removeReceiver(receiver)">
              Remove receiver
            </button></c
          >
        </grid>
      </c>
    </grid>
  </div>
</template>

<script>
export default {
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
