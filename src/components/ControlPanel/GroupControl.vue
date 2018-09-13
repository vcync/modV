<template>
  <div class="group-control">
    <b-field label="Group">
      <b-select v-model="currentGroup">
        <option v-for="index in groupLength" :value="index - 1">{{ index }}</option>
      </b-select>
      <button class="button" @click="addGroup">
        <b-icon icon="plus"></b-icon>
      </button>
      <button class="button" @click="removeGroup">
        <b-icon icon="minus"></b-icon>
      </button>
    </b-field>

    <component
      class="pure-control-group"
      v-for="control in controls"
      :is="control.component"
      :module="module"
      :meta="control.meta"
      :key="`${control.meta.$modv_variable}${currentGroup}`"
    ></component>
  </div>
</template>

<script>
  import generateControlData from './generate-control-data';

  import colorControl from './ColorControl';
  import checkboxControl from './CheckboxControl';
  import imageControl from './ImageControl';
  import paletteControl from './PaletteControl';
  import rangeControl from './RangeControl';
  import selectControl from './SelectControl';
  import textControl from './TextControl';
  import twoDPointControl from './TwoDPointControl';

  export default {
    name: 'groupConrol',
    props: [
      'meta',
      'module',
    ],
    data() {
      return {
        currentGroup: 0,
      };
    },
    computed: {
      group() {
        return this.$store
          .state.modVModules.active[this.meta.$modv_moduleName][this.meta.$modv_variable];
      },
      groupProps() {
        return this.group.props;
      },
      groupLength() {
        return this.group.length;
      },
      controls() {
        return generateControlData({
          module: this.module,
          props: this.$store.state.modVModules
            .active[this.meta.$modv_moduleName].props[this.meta.$modv_variable].props,
          exclude: ['group'],
          group: this.currentGroup,
          groupName: this.meta.$modv_variable,
        });
      },
    },
    methods: {
      addGroup() {
        // this.$store.dispatch('modVModules/upateProp', {
        //   prop: 'length',

        // });
      },
      removeGroup() {

      },
    },
    components: {
      colorControl,
      checkboxControl,
      imageControl,
      paletteControl,
      rangeControl,
      selectControl,
      textControl,
      twoDPointControl,
    },
  };
</script>
