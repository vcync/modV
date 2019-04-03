<template>
  <div></div>
</template>

<script>
/**
 * The styles defined here are there to overwrite styles in the main application.
 * This is not the best idea, but something that can be done without hacking anything
 * into modV. A better way would be to add the styles directly in index.js.
 */
export default {
  name: 'SlimUiControlPanel',
  methods: {}
}
</script>

<style lang="scss">
.slimui {
  // In the list of modules:
  .module-list {
    .options {
      // Remove opacity & blending
      .opacity-group,
      .blending-group {
        display: none;
      }

      // Remove the "enabled" label
      .enable-group {
        .field-label {
          display: none;
        }
        .field-body {
          display: inline-flex;
        }
      }

      // Prevent the label to overlap reorder
      .control-group {
        > label {
          min-width: 0;
        }
      }
    }

    // For every module in a layer:
    .active-item {
      // Decrease the size of the module title
      .active-item-title {
        font-size: 1em;
        float: left;
        width: 100%;
      }

      // Decrease the size of the module container
      .active-module-wrapper {
        height: 40px;
      }

      // Decrease the size of the reorder icon
      .fa-reorder {
        font-size: 1em;
      }
    }
  }
}
</style>
