import store from '@/store'

const PaletteWorkerScript = require('worker-loader!./index.js'); //eslint-disable-line

/**
 * PaletteWorker
 */
class PaletteWorker {
  constructor() {
    /**
     * @private
     * @type {Worker}
     */
    this.worker = new PaletteWorkerScript()
    this.worker.addEventListener('message', this.messageHandler.bind(this))
  }

  /**
   * @protected
   * @param {MessageEvent} evt
   */
  messageHandler(evt) { //eslint-disable-line
    switch (evt.data.message) {
      default:
      case undefined:
        break
      case 'palette-update':
        store.dispatch('palettes/stepUpdate', {
          id: evt.data.paletteId,
          currentStep: evt.data.currentStep,
          currentColor: evt.data.currentColor
        })

        store.dispatch('modVModules/updateProp', {
          name: store.state.palettes.palettes[evt.data.paletteId].moduleName,
          prop: store.state.palettes.palettes[evt.data.paletteId].variable,
          data: evt.data.currentStep
        })

        break
    }
  }

  /**
   * @param {string} id
   * @todo Add necessary params
   */
  createPalette(id, colors, duration) {
    this.worker.postMessage({
      message: 'create-palette',
      paletteId: id,
      colors,
      duration
    })
  }

  /**
   * @params {string} id
   * @params {Object} options
   * @todo Type of options
   */
  setPalette(id, options) {
    this.worker.postMessage({
      message: 'set-palette',
      paletteId: id,
      options
    })
  }

  /** @param {string} id */
  removePalette(id) {
    this.worker.postMessage({
      message: 'remove-palette',
      paletteId: id
    })
  }
}

/** @enum {string} */
PaletteWorker.EventType = {
  PALETTE_UPDATED: 'palette_updated'
}

export default PaletteWorker
