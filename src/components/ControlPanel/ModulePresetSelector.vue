<template>
  <div class="module-preset-selector-control">
    <b-field label="Presets" :addons="false">
      <b-dropdown v-model="preset">
        <button class="button is-primary is-small" slot="trigger">
          <span>{{ preset }}</span>
          <b-icon icon="angle-down"></b-icon>
        </button>

        <b-dropdown-item
          v-for="(presetData, presetName) in presets"
          :key="presetName"
          :value="presetName"
        >{{ presetName }}</b-dropdown-item>
      </b-dropdown>
      <button class="button is-small" @click="load">Load</button>
    </b-field>
  </div>
</template>

<script>
  export default {
    name: 'modulePresetSelector',

    props: {
      presets: {
        type: Object,
        required: true,
      },
      moduleName: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        preset: 'Select',
      };
    },

    methods: {
      load() {
        Object.keys(this.presets[this.preset].props).forEach(async (prop) => {
          const data = this.presets[this.preset].props[prop];

          await this.$store.dispatch('modVModules/resetModule', { name: this.moduleName });

          this.$store.dispatch('modVModules/updateProp', {
            name: this.moduleName,
            prop,
            data,
          });
        });
      },
    },
  };
</script>
