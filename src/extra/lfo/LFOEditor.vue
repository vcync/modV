<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">LFO Editor: {{ `${moduleName}.${controlVariable}` }}</p>
    </header>
    <section class="modal-card-body">
      <b>Function Type</b>
      <b-field>
        <b-radio-button v-model="expressionFunction"
          :native-value="waveform"
          v-for="waveform, idx in lfoTypes"
        >
          <img :src="`@/../static/graphics/icons/${waveform}.svg`" class="icon">
          <span>&nbsp;{{ waveform | capitalize }}</span>
        </b-radio-button>
      </b-field>
      <b>Frequency</b><br>
      <b-checkbox v-model="useBpm">Use BPM</b-checkbox>
      <b-field>
        <b-input :disabled="useBpm" type="number" v-model="frequency" step="0.001"></b-input>
      </b-field>
    </section>
    <!-- <footer class="modal-card-foot"></footer> -->
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';
  import lfoTypes from './lfo-types';

  export default {
    name: 'expression',
    props: [],
    data() {
      return {
        lfoTypes: [],
        expressionFunction: 'sine',
        frequency: 0.01,
        useBpm: true,
      };
    },
    created() {
      this.lfoTypes = this.lfoTypes.concat(lfoTypes);
      this.expressionFunction = this.assignment.waveform;
    },
    computed: {
      ...mapGetters('lfo', {
        activeControlData: 'activeControlData',
        getAssignment: 'assignment',
      }),
      moduleName() {
        return this.activeControlData.moduleName;
      },
      controlVariable() {
        return this.activeControlData.controlVariable;
      },
      assignment() {
        const { moduleName, controlVariable } = this;
        return this.getAssignment({ moduleName, controlVariable });
      },
    },
    methods: {
      ...mapMutations('lfo', [
        'setLfoFunction',
        'setLfoFrequency',
        'setUseBpm',
      ]),
    },
    watch: {
      expressionFunction() {
        const { moduleName, controlVariable, expressionFunction } = this;
        this.setLfoFunction({ moduleName, controlVariable, expressionFunction });
      },
      frequency() {
        const { moduleName, controlVariable, frequency } = this;
        this.setLfoFrequency({ moduleName, controlVariable, frequency });
      },
      useBpm() {
        const { moduleName, controlVariable, useBpm } = this;
        this.setUseBpm({ moduleName, controlVariable, useBpm });
      },
    },
  };
</script>

<style lang="scss">
</style>
