<template>
  <div>
    <b-field label="Selection X" class="has-text-light">
      <b-input v-model="x" type="number"></b-input>
    </b-field>
    <b-field label="Selection Y" class="has-text-light">
      <b-input v-model="y" type="number"></b-input>
    </b-field>
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';

  export default {
    name: 'grabCanvasControlPanel',
    computed: {
      ...mapGetters('grabCanvas', [
        'selectionX',
        'selectionY',
      ]),

      x: {
        get() {
          return this.selectionX;
        },

        set(value) {
          this.setSelection({
            selectionX: value,
          });
        },
      },

      y: {
        get() {
          return this.selectionY;
        },

        set(value) {
          this.setSelection({
            selectionY: value,
          });
        },
      },
    },
    methods: {
      ...mapMutations('grabCanvas', [
        'setSelection',
      ]),
    },
  };
</script>

<style lang="scss">
</style>
