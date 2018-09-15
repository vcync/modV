/**
 * @typedef {Object} Layer
 *
 * @property {String}  name                Name of the Layer
 *
 * @property {Number}  position            Position of the Layer
 *
 * @property {Array}   moduleOrder         The draw order of the Modules contained within the Layer
 *
 * @property {Boolean} enabled             Indicates whether the Layer should be drawn
 *
 * @property {Number}  alpha               The level of opacity, between 0 and 1, the Layer should
 *                                         be muxed at
 *
 * @property {Boolean} inherit             Indicates whether the Layer should inherit from another
 *                                         Layer at redraw
 *
 * @property {Number}  inheritFrom         The target Layer to inherit from, -1 being the previous
 *                                         Layer in modV#layers, 0-n being the index of
 *                                         another Layer within modV#layers
 *
 * @property {Boolean} pipeline            Indicates whether the Layer should render using pipeline
 *                                         at redraw
 *
 * @property {Boolean} clearing            Indicates whether the Layer should clear before redraw
 *
 * @property {String}  compositeOperation  The {@link Blendmode} the Layer muxes with
 *
 * @property {Boolean} drawToOutput        Indicates whether the Layer should draw to the output
 *                                         canvas
 *
 * @example
 * const Layer = {
 *   name: 'Layer',
 *
 *   position: 0,
 *
 *   moduleOrder: [
 *     'Module Name',
 *     'Another Module Name',
 *     'Waveform',
 *   ],
 *
 *   enabled: true,
 *
 *   alpha: 1,
 *
 *   inherit: true,
 *
 *   inheritFrom: -1,
 *
 *   pipeline: false,
 *
 *   clearing: false,
 *
 *   compositeOperation: 'normal',
 * };
 */

/**
 * Generates a Layer Object
 * @param {Object} options.layer Overrides for the default Layer parameters
 *
 * @returns {Layer}
 */
export default function Layer(layer) {
  const defaults = {
    name: 'Layer',

    position: 0,

    moduleOrder: [],

    enabled: true,

    alpha: 1,

    inherit: true,

    inheritFrom: -1,

    pipeline: false,

    clearing: false,

    compositeOperation: 'normal',

    drawToOutput: true,

    canvas: document.createElement('canvas'),

    resize({ width, height, dpr = window.devicePixelRatio }) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
    },
  };

  defaults.context = defaults.canvas.getContext('2d');

  return Object.assign(defaults, layer);
}
