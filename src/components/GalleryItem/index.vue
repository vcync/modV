<template>
  <div class="pure-u-6-24 gallery-item" @mouseout='mouseout' @mouseover='mouseover' @dblclick='doubleclick' draggable @dragstart='dragstart' :data-module-name='name'>
    <canvas class="preview"></canvas>
    <div class="title-wrapper">
      <span class="title">{{ name }}</span>
      <span class="ibvf"></span>
    </div>
    <i class='fa fa-info-circle fa-lg' aria-hidden='true'></i>
    <div class='information'>
      <div class='author'>Credit: {{ credit }}</div>
      <div class='author'>Version: {{ version }}</div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import { webgl, modV } from '@/modv';

  export default {
    name: 'galleryItem',
    data() {
      return {
        canvas: false,
        context: false,
        Module: false,
        raf: false,
        appendToName: '-gallery'
      };
    },
    props: [
      'ModuleIn',
      'moduleName'
    ],
    mounted() {
      this.canvas = this.$el.querySelector('canvas.preview');
      this.context = this.canvas.getContext('2d');

      this.createActiveModule({
        moduleName: this.moduleName,
        appendToName: this.appendToName,
        skipInit: true
      }).then((Module) => {
        this.Module = Module;
        if('init' in this.Module) this.Module.init({ width: this.canvas.width, height: this.canvas.height });
      }).catch((e) => {
        console.log(`An error occoured whilst initialising a gallery module - ${this.Module.info.name}`);
        console.error(e);
      });
    },
    methods: {
      ...mapActions('layers', [
        'addModuleToLayer'
      ]),
      ...mapActions('modVModules', [
        'createActiveModule'
      ]),
      draw(delta) {
        this.raf = requestAnimationFrame(this.draw);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const features = this.$modV.meyda.get(this.$modV.audioFeatures);

        if(this.Module.info.previewWithOutput) {
          this.context.drawImage(
            modV.outputCanvas,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );
        }

        this.Module.draw({
          canvas: this.canvas,
          context: this.context,
          video: this.$modV.videoStream,
          features,
          delta
        });
      },
      mouseover() {
        if(this.raf) return;
        this.raf = requestAnimationFrame(this.draw);
        webgl.resize(this.canvas.width, this.canvas.height);
      },
      mouseout() {
        cancelAnimationFrame(this.raf);
        this.raf = false;
      },
      doubleclick() {
        this.createActiveModule({
          moduleName: this.moduleName,
          skipInit: false
        }).then((Module) => {
          this.addModuleToLayer({
            module: Module,
            layerIndex: this.focusedLayerIndex
          });
        });
      },
      dragstart(e) {
        e.dataTransfer.setData('module-name', this.Module.info.name);
      }
    },
    computed: {
      ...mapGetters('layers', [
        'focusedLayerIndex'
      ]),
      name() {
        const Module = this.Module;
        if (!Module) return '';
        if (!('info' in Module)) return '';
        if (!('name' in Module.info)) return '';
        return Module.info.name;
      },
      credit() {
        if(!this.Module) return '';
        return this.Module.info.author;
      },
      version() {
        if(!this.Module) return '';
        return this.Module.info.version;
      }
    }
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

      .title {
        color: #fff;
        vertical-align: middle;
        transition: all 300ms;
        font-size: 18px;
        letter-spacing: -1px;
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
      text-align: center;
      pointer-events: none;
      transition: all 300ms;
      margin: 5pt;
      // display: flex;
      // justify-content: flex-start;
      // align-items: flex-start;
      padding: 2pt;
      opacity: 0;
      transition: opacity 300ms;
      color: #fff;
      background-color: rgba(0,0,0,0.5);
    }

    &:hover {
      .title-wrapper {
        background-color: rgba(0,0,0,0);
      }

      .title {
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

      .title {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 25.6px;
        letter-spacing: -2px;
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