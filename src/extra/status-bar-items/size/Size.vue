<template>
  <div @dblclick="sizeModalOpen = true">
    <span>{{ sizeOut }}</span>

    <b-modal :active.sync="sizeModalOpen">
      <div>
        <b-input
          type="number"
          v-model.number="width"
        />
        𝗑
        <b-input
          type="number"
          v-model.number="height"
        />
        <button class="button" @click="setWindowSize">Set window size</button>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    data() {
      return {
        sizeModalOpen: false,
        width: 0,
        height: 0,
      };
    },
    computed: {
      ...mapGetters('windows', [
        'largestWindowSize',
        'largestWindowReference',
      ]),
      sizeOut() {
        return `${this.largestWindowSize.width}𝗑${this.largestWindowSize.height}px`;
      },
    },
    methods: {
      setWindowSize() {
        this.resizeWindow(this.largestWindowReference(), this.width, this.height);
      },
      resizeWindow(window, width, height) {
        if (window.outerWidth) {
          window.resizeTo(
            width + (window.outerWidth - window.innerWidth),
            height + (window.outerHeight - window.innerHeight),
          );
        } else {
          window.resizeTo(500, 500);
          window.resizeTo(
            width + (500 - document.body.offsetWidth),
            height + (500 - document.body.offsetHeight),
          );
        }
      },
    },
    watch: {
      largestWindowSize(value) {
        this.width = value.width;
        this.height = value.height;
      },
    },
  };
</script>
