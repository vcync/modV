<template>
  <div class='palette-selector-container'>
    <dropdown
      :data="profileNames"
      :width='129'
      :cbChanged="profileChanged"
      :class="{'palette-selector': true}"
    ></dropdown>
    <br>
    <dropdown
      :data="selectData"
      :width='129'
      :cbChanged="dropdownChanged"
      :class="{'palette-selector': true}"
    ></dropdown>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'paletteSelector',
    props: [
      'value'
    ],
    data() {
      return {
        currentProfile: 'default',
        currentPalette: null
      };
    },
    computed: {
      ...mapGetters('profiles', [
        'allProfiles'
      ]),
      profileNames() {
        const data = [];
        const allProfiles = this.allProfiles;

        Object.keys(allProfiles).forEach((profileName) => {
          data.push({
            label: profileName,
            value: profileName,
            selected: this.currentProfile === profileName
          });
        });

        return data;
      },
      selectData() {
        const data = [];
        const allProfiles = this.allProfiles;

        const profile = allProfiles[this.currentProfile];

        Object.keys(profile.palettes).forEach((paletteName) => {
          data.push({
            label: paletteName,
            value: paletteName
          });
        });

        return data;
      }
    },
    methods: {
      dropdownChanged(e) {
        this.currentPalette = e[0].value;
        this.emitInput();
      },
      profileChanged(e) {
        this.currentProfile = e[0].value;
        this.currentPalette = null;
      },
      emitInput() {
        this.$emit('input', {
          profile: this.currentProfile,
          palette: this.currentPalette
        });
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
      height: 28px !important;
      line-height: 28px !important;
    }
  }
</style>