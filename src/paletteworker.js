const EventEmitter2 = require('eventemitter2').EventEmitter2;

class PaletteWorker extends EventEmitter2 {
  constructor() {
    super();

    /** @private {Worker} */
    this._worker = new Worker('palette-worker.js');
    this._worker.addEventListener('message', this.messageHandler.bind(this));
  }

  /** 
   * @protected
   * @param {MessageEvent} evt
   */
  messageHandler(evt) {
    switch (evt.data.message) {
      case undefined:
        return;
      case 'palette-create':
        this.emit(PaletteWorker.EventType.PALETTE_ADDED, {
          id: evt.data.paletteId,
        });
        return;
      case 'palette-update':
        this.emit(PaletteWorker.EventType.PALETTE_UPDATED, evt.data.paletteId, evt.data.currentColor, evt.data.currentStep);
        return;
    }
  }

  /**
   * @param {string} id
   * @todo Add necessary params
   */
  createPalette(id, colors, duration) {
    this._worker.postMessage({
      'message': 'create-palette',
      'paletteId': id,
      'colors': colors,
      'duration': duration
    });
  }

  /**
   * @params {string} id
   * @params {Object} options
   * @todo Type of options
   */
  setPalette(id, options) {
    this._worker.postMessage({
      'message': 'set-palette',
      'paletteId': id,
      'options': options
    });
  }

  /** @param {string} id */
  removePalette(id) {
    this._worker.postMessage({
      'message': 'remove-palette',
      'paletteId': id
    });
  }
}

/** @enum {string} */
PaletteWorker.EventType = {
  PALETTE_ADDED: 'palette_added',
  PALETTE_UPDATED: 'palette_updated',
};

module.exports = PaletteWorker;
