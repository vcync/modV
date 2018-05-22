import ModuleError from './module-error';

/**
 * @typedef  {Object} ModuleSettings
 * @property {Object} info                  The information about the Module
 * @property {String} info.name             The name of the Module
 * @property {String} info.author           The author of the Module
 * @property {(String|Number)} info.version The version of the Module
 * @property {Array}  meyda                 [description]
 * @property {Object} saveData              [description]
 */

/**
 * Module
 */
class Module {
  /**
   * @param {ModuleSettings} settings
   */
  constructor(settings) {
    // Set up error reporting
    this.ModuleError = ModuleError;
    this.ModuleError.prototype = Object.create(Error.prototype);
    this.ModuleError.prototype.constructor = ModuleError;

    // Check for settings Object
    if (!settings) throw new this.ModuleError('Module had no settings');
    // Check for info Object
    if (!('info' in settings)) throw new this.ModuleError('Module had no info in settings');
    // Check for info.name
    if (!('name' in settings.info)) throw new this.ModuleError('Module had no name in settings.info');
    // Check for info.author
    if (!('author' in settings.info)) throw new this.ModuleError('Module had no author in settings.info');
    // Check for info.version
    if (!('version' in settings.info)) throw new this.ModuleError('Module had no version in settings.info');

    // Create control Array
    if (!settings.info.controls) settings.info.controls = {};

    /**
     * The information Object from the settings Object passed to {@link Module}
     * @type {Object}
     */
    this.info = settings.info;

    // Always start on layer 0
    /* @todo move info properties into Module variables */
    this.info.layer = 0;

    /**
     * Indicates whether the current output be passed into the
     * Module's draw loop when displayed in the gallery
     * @type {Boolean}
     */
    this.previewWithOutput = false;

    if ('previewWithOutput' in settings) {
      this.previewWithOutput = settings.previewWithOutput;
    }

    /**
     * The settings Object passed to {@link Module}
     * @type {Object}
     * @name Module#settings
     */
    Object.defineProperty(this, 'settings', {
      get() {
        return settings;
      },
    });
  }

  /**
   * Called when the Module is first initiated
   * @param  {HTMLCanvas}               canvas        The Canvas to draw to
   * @param  {CanvasRenderingContext2D} context       The Context of the Canvas
   */
  init(canvas, context) {} //eslint-disable-line

  /**
   * Key/Value pairs to import onto the Module - called internally when
   * loading saveData from {@link ModuleSettings} from a {@link Preset}
   * @param  {(String|Number)} key
   * @param  {any}             value
   */
  // import(key, value) {} //eslint-disable-line

  /**
   * Called when an output window canvas resizes
   * @param  {HTMLCanvas}               canvas        The resized Canvas
   * @param  {CanvasRenderingContext2D} context       The Context of the Canvas
   */
  resize(canvas, context) {} //eslint-disable-line

  /**
   * Add a Control to the Module's Control array within settings.info
   * @param {(Control|Array)} item Can be either a Control Object or an Array of Control Objects
   * @todo For Plugins (1.6/1.7) allow other Objects to be passed and stored in Modules
   */
  add(item) {
    if (item instanceof Array) {
      item.forEach((thing) => {
        this.add(thing);
      });
    } else {
      this.info.controls[item.variable] = item;
      if ('default' in item) {
        this[item.variable] = item.default;
      }
    }
  }

  /**
   * Return the current Layer assigned to the Module
   * @return {Number} Index of the Layer in {@link ModV#layers}
   */
  getLayer() {
    return this.info.layer;
  }

  /**
   * Set the Module Layer position
   * @param {Number} layer Index of the Layer in {@link ModV#layers}
   */
  setLayer(layer) {
    this.info.layer = layer;
  }

  /**
   * Set a Module's variable and update other resources that depend on variable state changes
   * @todo Review this method and data flow within modV. Doesn't seem like the best way to do this
   *
   * @param  {(String|Number)} variable The name of the property to update on the Module
   * @param  {any} value                The value to set
   * @param  {ModV} modV                Reference to an instance of {@link ModV}
   */
  updateVariable(variable, value/* , modV */) {
    this[variable] = value;

    // modV.remote.update('moduleValueChange', {
    //   variable: variable,
    //   value: value,
    //   name: this.info.name
    // });
  }
}

export default Module;
