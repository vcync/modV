<template>
  <div class="palette-gallery columns is-gapless is-multiline">
    <div class="column is-12">
      <span v-for="(profile, profileName) in profiles">
        <h2 class="title">{{ profileName }}</h2>
        <div class="columns is-gapless is-multiline">
          <div class="column is-12 palette-container" v-for="(palette, paletteName) in profile.palettes">
            <p class="has-text-light">{{ paletteName }}</p>
            <div
              class="swatch"
              v-for="rgb in palette"
              :style="makeStyle(rgb)"
            ></div>
          </div>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'paletteGallery',
    components: {

    },
    props: {
      phrase: {
        type: String,
        required: true,
        default: '',
      },
    },
    computed: {
      ...mapGetters('profiles', {
        profiles: 'allProfiles',
      }),
    },
    methods: {
      search(textIn, termIn) {
        const text = textIn.toLowerCase().trim();
        const term = termIn.toLowerCase().trim();
        if (termIn.length < 1) return true;

        return text.indexOf(term) > -1;
      },
      makeStyle(rgb) {
        return {
          backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  .hidden {
    display: none !important;
  }

  h2.title {
    color: #fff;
    cursor: default;
    font-weight: normal;
    margin: 0.82em 5pt 0.2em 5pt;
  }

  .swatch {
    border-radius: 50%;
    display: inline-block;
    height: 10px;
    width: 10px;
    margin: 3px;
  }

  .column.palette-container {
    margin: 0 5pt;
  }
</style>
