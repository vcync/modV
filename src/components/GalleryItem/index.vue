<template>
  <div
    class="pure-u-6-24 gallery-item"
    @mouseout="mouseout"
    @mouseover="mouseover"
    @dblclick="doubleclick"
    @dragstart="dragstart"
    :data-module-name="name"
  >
    <canvas class="preview" ref="canvas"></canvas>
    <div class="title-wrapper">
      <span class="module-title">{{ name }}</span>
      <span class="ibvf"></span>
    </div>
    <i class="fa fa-info-circle fa-lg" aria-hidden="true"></i>
    <div class="information">
      <div class="module">Module: {{ name }}</div>
      <div v-if="credit" class="author">Credit: {{ credit }}</div>
      <div v-if="version" class="version">Version: {{ version }}</div>
      <div v-if="isIsf" class="isf-version">ISF Version: {{ isfVersion }}</div>
      <div v-if="description" class="desciption">{{ description }}</div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import { modV, ModuleISF } from '@/modv';

  export default {
    name: 'galleryItem',
    data() {
      return {
        canvas: false,
        context: false,
        Module: false,
        raf: false,
        appendToName: '-gallery',
        isIsf: false,
      };
    },
    props: [
      'moduleIn',
      'moduleName',
    ],
    mounted() {
      this.canvas = this.$refs.canvas;
      this.context = this.canvas.getContext('2d');

      this.createActiveModule({
        moduleName: this.moduleName,
        appendToName: this.appendToName,
        skipInit: true,
      }).then((Module) => {
        this.Module = Module;
        if (Module instanceof ModuleISF) {
          this.isIsf = true;
        }

        if ('init' in Module) {
          Module.init({ width: this.canvas.width, height: this.canvas.height });
        }
      }).catch((e) => {
        console.log(`An error occoured whilst initialising a gallery module - ${this.Module.info.name}`);
        console.error(e);
      });
    },
    methods: {
      ...mapActions('layers', [
        'addModuleToLayer',
      ]),
      ...mapActions('modVModules', [
        'createActiveModule',
      ]),
      draw(delta) {
        this.raf = requestAnimationFrame(this.draw);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const features = this.$modV.meyda.get(this.$modV.audioFeatures);

        if (this.Module.info.previewWithOutput) {
          this.context.drawImage(
            modV.outputCanvas,
            0,
            0,
            this.canvas.width,
            this.canvas.height,
          );
        }

        this.Module.draw({
          canvas: this.canvas,
          context: this.context,
          video: this.$modV.videoStream,
          features,
          delta,
        });
      },
      mouseover() {
        if (this.raf) return;
        this.raf = requestAnimationFrame(this.draw);
        // webgl.resize(this.canvas.width, this.canvas.height);
      },
      mouseout() {
        cancelAnimationFrame(this.raf);
        this.raf = false;
      },
      doubleclick() {
        this.createActiveModule({
          moduleName: this.moduleName,
          skipInit: false,
        }).then((Module) => {
          this.addModuleToLayer({
            module: Module,
            layerIndex: this.focusedLayerIndex,
          });
        });
      },
      dragstart(e) {
        e.dataTransfer.setData('module-name', this.Module.info.name);
      },
    },
    computed: {
      ...mapGetters('layers', [
        'focusedLayerIndex',
      ]),
      name() {
        const Module = this.Module;
        if (!Module) return '';
        if (!('info' in Module)) return '';
        if (!('name' in Module.info)) return '';
        return Module.info.name;
      },
      credit() {
        if (!this.Module) return '';
        return this.Module.info.author;
      },
      version() {
        if (!this.Module) return '';
        return this.Module.info.version;
      },
      isfVersion() {
        if (!this.Module) return '';
        if (!this.isIsf) return 'N/A';
        let outputString = `${this.Module.info.isfVersion}`;
        if (this.Module.info.isfVersion === 1) outputString += ' (auto upgraded to 2)';
        return outputString;
      },
      description() {
        if (!this.Module) return '';
        return this.Module.info.description;
      },
    },
  };
</script>

<style lang='scss' scoped>
  .gallery-item {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    justify-self: center;
    align-self: flex-start;
    width: 100%;
    padding-bottom: 56.249999993%;
    cursor: move;

    .title-wrapper {
      background-color: rgba(0,0,0,0.5);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      text-align: center;
      pointer-events: none;
      transition: all 300ms;
      font-size: 0;
      margin: 5pt;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2pt;

      .module-title {
        color: #fff;
        vertical-align: middle;
        transition: all 300ms;
        font-size: 18px;
        word-break: break-all;
      }
    }

    i.fa-info-circle {
      color: rgba(255, 255, 255, 0);
      position: absolute;
      top: 15px;
      right: 15px;
      transition: color 300ms;
      z-index: 1;
    }

    .information {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      text-align: left;
      pointer-events: none;
      transition: all 300ms;
      margin: 5pt;
      // display: flex;
      // justify-content: flex-start;
      // align-items: flex-start;
      padding: 10pt;
      opacity: 0;
      transition: opacity 300ms;
      color: #fff;
      background-color: rgba(0,0,0,0.5);
      overflow-y: hidden;

      div {
        margin-bottom: 5pt;
      }
    }

    &:hover {
      .title-wrapper {
        background-color: rgba(0,0,0,0);
      }

      .module-title {
        color: rgba(255,255,255,0);
      }

      i.fa-info-circle {
        color: rgba(255, 255, 255, 255);

        &:hover {
          & ~ .information {
            opacity: 1;
          }
        }
      }
    }

    canvas {
      box-shadow: 0px 0px 6px 0px rgba(0,0,0,.8);
      background-color: #000;
      width: calc(100% - 10pt);
      height: calc(100% - 10pt);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 5pt;
    }

    &.sortable-ghost {
      padding: 0;
      height: 135px;

      .module-title {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 25.6px;
        word-break: break-all;
      }

      .title-wrapper {
        background-color: rgba(0,0,0,0);
        margin: 0pt;
      }

      canvas {
        margin: 0;
        width: 100%;
      }
    }
  }
</style>
