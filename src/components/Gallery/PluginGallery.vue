<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div class="column is-12">
      <div class="columns is-multiline">

        <div class="column is-12" v-for="(plugin, pluginName) in plugins">
          <div>
            <b-switch
              :value="plugin.enabled"
              @input="switchPlugin($event, { pluginName })"
              class="has-text-light"
            >
              {{ pluginName }}
            </b-switch>
            <div v-if="'controlPanelComponent' in plugin.plugin">
              <component
                :is="plugin.plugin.controlPanelComponent.name"
              ></component>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapGetters } from 'vuex';

  export default {
    name: 'pluginGallery',
    data() {
      return {
        loading: null,
      };
    },
    props: {
      phrase: {
        type: String,
        required: true,
        default: '',
      },
    },
    computed: {
      ...mapGetters('plugins', [
        'plugins',
      ]),
    },
    methods: {
      ...mapMutations('plugins', [
        'setEnabled',
      ]),
      search(textIn, termIn) {
        const text = textIn.toLowerCase().trim();
        const term = termIn.toLowerCase().trim();
        if (termIn.length < 1) return true;

        return text.indexOf(term) > -1;
      },
      switchPlugin(e, { pluginName }) {
        this.setEnabled({ enabled: e, pluginName });
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

  .column.preset-container {
    margin: 0 5pt;
    padding: 5pt !important;

    .column {
      align-items: center;
      display: flex;
    }

    transition: all 120ms;

    & > .columns:hover {
      background-color: whitesmoke;

      &.cannot-load {
        background-color: #797979;
      }

      .has-text-light,
      .button {
        color: #383838 !important;
      }

      .button {
        border-color: #383838 !important;
      }
    }
  }
</style>
