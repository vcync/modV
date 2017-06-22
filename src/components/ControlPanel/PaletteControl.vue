<template>
  <div class="range-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <div class="pure-form-message-inline">{{ value }}</div>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    name: 'paletteControl',
    props: [
      'module',
      'control'
    ],
    data() {
      return {
        value: undefined
      };
    },
    computed: {
      moduleName() {
        return this.module.info.name;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
      label() {
        return this.control.label;
      },
      variable() {
        return this.control.variable;
      },
      varType() {
        return this.control.varType;
      },
      defaultValue() {
        return this.control.default;
      }
    },
    methods: {
      ...mapActions('palette', [
        'createPalette'
      ])
    },
    created() {
      this.createPalette(this.inputId).then((Palette) => {
        this.palette = Palette;
      });
    },
    beforeMount() {
      this.value = this.module[this.variable];
      if(typeof this.value === 'undefined') this.value = this.defaultValue;
    },
    watch: {
      module() {
        this.value = this.module[this.variable];
      },
      value() {
        let val;
        if(this.varType === 'int') val = parseInt(this.value, 10);
        else if(this.varType === 'float') val = parseFloat(this.value, 10);
        this.module[this.variable] = val;
      }
    }
  };
</script>

<style scoped lang='scss'>

</style>