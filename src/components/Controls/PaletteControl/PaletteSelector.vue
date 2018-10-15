<template>
  <b-dropdown class="dropdown" v-model="currentPalette">
    <button class="button is-primary is-small" slot="trigger">
      <span>{{ currentPalette | capitalize }}</span>
      <b-icon icon="angle-down"></b-icon>
    </button>

    <b-dropdown-item
      v-for="data, idx in selectData"
      :key="idx"
      :value="data.value"
    >{{ data.label | capitalize }}</b-dropdown-item>
  </b-dropdown>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'paletteSelector',
    props: [
      'value',
      'project',
    ],
    data() {
      return {
        currentPalette: null,
      };
    },
    computed: {
      ...mapGetters('projects', [
        'allProjects',
      ]),
      selectData() {
        const data = [];
        const allProjects = this.allProjects;

        if (!Object.prototype.hasOwnProperty.call(allProjects, this.project)) return [];
        const project = allProjects[this.project];

        Object.keys(project.palettes).forEach((paletteName) => {
          data.push({
            label: paletteName,
            value: paletteName,
          });
        });

        data.sort((a, b) => {
          if (a.label < b.label) return -1;
          if (a.label > b.label) return 1;
          return 0;
        });

        return data;
      },
    },
    watch: {
      currentPalette() {
        this.$emit('input', this.currentPalette);
      },
    },
  };
</script>

<style lang='scss'>
  .palette-selector-container {
    display: inline-block;
  }

  .palette-selector.hsy-dropdown {
      display: inline-block;
      vertical-align: middle;

    & > .selected {
      // height: 28px !important;
      // line-height: 28px !important;

      font-family: inherit;
      /* font-size: 100%; */
      padding: .5em 22px .5em 1em;
      color: #444;
      color: rgba(0,0,0,.8);
      border: 1px solid #999;
      border: 0 rgba(0,0,0,0);
      background-color: #E6E6E6;
      text-decoration: none;
      border-radius: 2px;
    }
  }
</style>
