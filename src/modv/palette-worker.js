const EventEmitter2 = require('eventemitter2').EventEmitter2;

/**
 * PaletteWorker
 */
class PaletteWorker extends EventEmitter2 {
  constructor() {
    super();

    /**
     * @private
     * @type {Worker}
     */
    this._worker = new Worker('palette-worker.js'); //eslint-disable-line
    this._worker.addEventListener('message', this.messageHandler.bind(this)); //eslint-disable-line
  }

  /**
   * @protected
   * @param {MessageEvent} evt
   */
  messageHandler(evt) {
    switch (evt.data.message) {
      default:
        return;
      case 'palette-create':
        this.emit(PaletteWorker.EventType.PALETTE_ADDED, {
          id: evt.data.paletteId,
        });
        break;
      case 'palette-update':
        this.emit(
          PaletteWorker.EventType.PALETTE_UPDATED,
          evt.data.paletteId,
          evt.data.currentColor,
          evt.data.currentStep,
        );
        break;
    }
  }

  /**
   * @param {string} id
   * @todo Add necessary params
   */
  createPalette(id, colors, duration) {
    this._worker.postMessage({ //eslint-disable-line
      message: 'create-palette',
      paletteId: id,
      colors,
      duration,
    });
  }

  /**
   * @params {string} id
   * @params {Object} options
   * @todo Type of options
   */
  setPalette(id, options) {
    this._worker.postMessage({ //eslint-disable-line
      options,
      message: 'set-palette',
      paletteId: id,
    });
  }

  /** @param {string} id */
  removePalette(id) {
    this._worker.postMessage({ //eslint-disable-line
      message: 'remove-palette',
      paletteId: id,
    });
  }
}

/** @enum {string} */
PaletteWorker.EventType = {
  PALETTE_ADDED: 'palette_added',
  PALETTE_UPDATED: 'palette_updated',
};

export default PaletteWorker;
