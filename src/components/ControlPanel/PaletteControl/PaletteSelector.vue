<template>
  <dropdown
    :data="selectData"
    :width='129'
    :cbChanged="dropdownChanged"
    :class="{'palette-selector': true}"
  ></dropdown>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'paletteSelector',
    props: [
      'value',
      'profile'
    ],
    data() {
      return {
        currentPalette: null
      };
    },
    computed: {
      ...mapGetters('profiles', [
        'allProfiles'
      ]),
      selectData() {
        const data = [];
        const allProfiles = this.allProfiles;

        const profile = allProfiles[this.profile];
        if(!Object.prototype.hasOwnProperty.call(allProfiles, profile)) return [];

        Object.keys(profile.palettes).forEach((paletteName) => {
          data.push({
            label: paletteName,
            value: paletteName
          });
        });

        data.sort((a, b) => {
          if(a.label < b.label) return -1;
          if(a.label > b.label) return 1;
          return 0;
        });

        return data;
      }
    },
    methods: {
      dropdownChanged(e) {
        this.currentPalette = e[0].value;
        this.$emit('input', this.currentPalette);
      }
    }
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