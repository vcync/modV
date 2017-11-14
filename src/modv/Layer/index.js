/* globals Sortable, STError */

import EventEmitter2 from 'eventemitter2';
import { forIn, replaceAll, swapElements } from '../utils';

/**
 * Layer
 * @extends EventEmitter2
 */
class Layer extends EventEmitter2 {
  constructor(nameIn, canvas, context, clearingIn, modV) {
    super();

    /**
     * The Layer's Canvas
     * @type {HTMLCanvas}
     */
    this.canvas = canvas || document.createElement('canvas');

    /**
     * The Context for the Layer's Canvas
     * @type {CanvasRenderingContext2D}
     */
    this.context = context || this.canvas.getContext('2d');

    /**
     * Name of the Layer
     * @type {String}
     */
    this.name = nameIn || 'New Layer';

    /**
     * Modules contained within the Layer
     * @type {Object}
     */
    this.modules = {};

    /**
     * The draw order of the Modules contained within the Layer
     * @type {Array}
     */
    this.moduleOrder = [];

    /**
     * Reference to a modV instance (for convinience)
     * @type {ModV}
     */
    this.modV = modV;

    /**
     * Indicates whether the Layer should clear before redraw
     * @type {Boolean}
     * @name Layer#clearing
     */
    this.clearing = clearingIn || false;

    /**
     * The level of opacity between 0 and 1 the Layer should be muxed at
     * @type {Number}
     * @name Layer#alpha
     */
    this.alpha = 1;

    /**
     * Indicates whether the Layer should be drawn
     * @type {Boolean}
     * @name Layer#enabled
     */
    this.enabled = true;

    /**
     * Indicates whether the Layer should inherit from another Layer at redraw
     * @type {Boolean}
     * @name Layer#inherit
     */
    this.inherit = true;

    /**
     * The target Layer to inherit from, -1 being the previous Layer in modV#layers,
     * 0-n being the index of another Layer within modV#layers
     * @type {Number}
     * @name Layer#inheritFrom
     */
    this.inheritFrom = -1;

    /**
     * Indicates whether the Layer should render using pipeline at redraw
     * @type {Boolean}
     * @name Layer#pipeline
     */
    this.pipeline = false;

    /**
     * Indicates whether the Layer should mux to the output canvas on the output window
     * @type {Boolean}
     * @name Layer#drawToOutput
     */
    this.drawToOutput = true;

    /**
     * Indicates whether the Layer is Locked
     * @type {Boolean}
     * @name Layer#locked
     */
    this.locked = false;

    this.collapsed = false;

    /**
     * The {@link Blendmode} the Layer muxes with
     * @type {String}
     * @name Layer#blending
     */
    this.blending = 'normal';
  }

  /**
   * Add a Module to the Layer
   * @param {String} moduleName
   * @param {Number} order  The position within {@link Layer#moduleOrder} the Module
   *                        should be inserted at
   *
   * @return {Number}       The position within {@link Layer#moduleOrder} the Module was inserted at
   */
  addModule(moduleName, orderIn) {
    let order = orderIn;
    // const modV = this.modV;
    this.modules[moduleName] = moduleName;

    if (typeof order !== 'undefined') {
      this.setOrder(moduleName, order, true);
    } else {
      order = this.moduleOrder.push(moduleName) - 1;
    }

    /* // Send to remote
    modV.remote.update('addModule', {
      name,
      order,
      layer: Module.getLayer()
    }); */

    this.emit('moduleAdd',
      moduleName,
      order,
    );

    return order;
  }

  /**
   * Remove a Module from the Layer
   * @param  {Module}  Module       [description]
   * @param  {Boolean} sentToRemote [description]
   */
  removeModule(Module, sentToRemote) {
    const name = Module.info.name;

    // Remove from order array
    const index = this.moduleOrder.indexOf(name);
    if (index > -1) this.moduleOrder.splice(index, 1);
    else {
      STError('Module was not found in Layer module array');
    }

    // Send to remote
    if (!sentToRemote) {
      this.modV.remote.update('removeModule', {
        name,
        layerIndex: Module.getLayer(),
      });
    }

    this.emit('moduleRemove',
      Module,
      index,
    );

    // Remove from module store
    delete this.modules[name];
  }

  /**
   * Update the Layer's index. Will also call {@link Module#setLayer} of
   * all the Modules contained within the Layer
   * @param  {Number} index
   */
  updateIndex(index) {
    forIn(this.modules, (key, Module) => {
      Module.setLayer(index);
    });
  }

  /**
   * [setOrder description]
   * @param {Module}  Module        [description]
   * @param {Number}  order         [description]
   * @param {Boolean} sentToRemote  [description]
   * @param {Boolean}  moveNodes    [description]
   */
  setOrder(moduleName, order, sentToRemote, moveNodes) {
    const name = moduleName;

    if (this.moduleOrder[order] === 'undefined') this.moduleOrder[order] = name;
    else {
      let index = -1;
      this.moduleOrder.forEach((mod, idx) => {
        if (name === mod) index = idx;
      });

      if (index > -1) this.moduleOrder.splice(index, 1);

      this.moduleOrder.splice(order, 0, name);

      if (moveNodes) {
        const children = this.node.querySelector('.module-list').children;
        children[index].parentNode.insertBefore(children[index], children[order]);
      }
    }

    this.emit('moduleReorder',
      moduleName,
      order,
    );
  }

  /**
   * Reverse the order of the contained Modules
   * @param  {Boolean} moveNodes Move the Element nodes of the Layer Items shown in the active list
   * @return {Array}             The new order of Modules within the Layer
   */
  reverse(moveNodes) {
    // this.moduleOrder.reverse();
    for (let i = 0; i < this.moduleOrder.length; i += 1) {
      const Module = this.modules[this.moduleOrder[i]];

      this.setOrder(Module, this.moduleOrder.length - i, true, moveNodes);
    }

    return this.moduleOrder;
  }

  /**
   * Toggle the Layer, enabled or disabled
   * @return {Boolean} The value of {@link Layer#enabled}
   */
  toggle() {
    this.enabled = !this.enabled;

    this.emit('enabled',
      this.enabled,
    );

    return this.enabled;
  }

  /**
   * Set the Layer's name
   * @param {String} name
   */
  setName(nameIn) {
    const name = nameIn.trim();
    if (name.length === 0) return false;

    this.name = name;

    this.emit('nameChange',
      name,
    );

    return true;
  }

  /**
   * [makeSortable description]
   */
  makeSortable() {
    const gallery = document.getElementsByClassName('gallery')[0];
    const modV = this.modV;

    Sortable.create(this.moduleListNode, {
      group: {
        name: 'modV',
        pull: true,
        put: true,
      },
      handle: '.handle',
      chosenClass: 'chosen',
      onAdd: (evt) => {
        // Dragged HTMLElement
        const itemEl = evt.item;

        if (itemEl.classList.contains('gallery-item')) {
          // Cloned element
          const clone = gallery.querySelector(`.gallery-item[data-module-name="${itemEl.dataset.moduleName}"]`);

          // Get Module
          const oldModule = modV.registeredMods[replaceAll(itemEl.dataset.moduleName, '-', ' ')];

          const Module = modV.createModule(oldModule, this.canvas, this.context);

          // If shift is held when dropped, disable Module's output
          if (evt.originalEvent.shiftKey) {
            Module.info.disabled = true;
          }

          // Move back to gallery
          swapElements(clone, itemEl);

          const activeItemElements = modV.createActiveListItem(Module, (node) => {
            modV.currentActiveDrag = node;
          }, () => {
            modV.currentActiveDrag = null;
          });

          const activeItemNode = activeItemElements.node;

          Module.info.internalControls = {};
          Module.info.internalControls.alpha = activeItemElements.controls.alpha;
          Module.info.internalControls.disabled = activeItemElements.controls.disabled;
          Module.info.internalControls.blend = activeItemElements.controls.blend;

          // Replace clone
          try {
            this.moduleListNode.replaceChild(activeItemNode, clone);
          } catch (e) {
            // fail gracefully, remove clone in gallery
            const clone = evt.clone;
            clone.parentNode.removeChild(clone);

            return;
          }

          // Add to active registry
          modV.activeModules[Module.info.name] = Module;

          // Set Module's layer
          Module.setLayer(modV.layers.indexOf(this));

          // Add to layer
          this.addModule(Module, evt.newIndex);

          // Create controls
          modV.createControls(Module);

          activeItemNode.focus();
        } else if (itemEl.classList.contains('active-item')) {
          const name = replaceAll(itemEl.dataset.moduleName, '-', ' ');
          const Module = modV.activeModules[name];

          const oldIndex = Module.getLayer();
          const newIndex = modV.layers.indexOf(this);

          const Layer = modV.layers[oldIndex];

          // Layer = old layer
          // this.Layer = new layer

          this.modules[name] = Layer.modules[name];

          Module.setLayer(modV.layers.indexOf(this));

          this.setOrder(Module, evt.newIndex, true);

          Layer.removeModule(Module, true);

          modV.remote.update('moduleLayerMove', {
            oldLayerIndex: oldIndex,
            newLayerIndex: newIndex,
            order: evt.newIdex,
          });
        }
      },
      onEnd: (evt) => {
        if (!evt.item.classList.contains('deletable')) {
          const name = replaceAll(evt.item.dataset.moduleName, '-', ' ');
          const Module = modV.activeModules[name];

          // modV.setModOrder(name, evt.newIndex);
          if (evt.item.parentNode.parentNode === this.node) {
            this.setOrder(Module, evt.newIndex);
          }
        }
      },
    });
  }

  resize({ width, height, dpr }) {
    const devicePixRatio = dpr || 1;
    this.canvas.width = width * devicePixRatio;
    this.canvas.height = height * devicePixRatio;
  }
}

export default Layer;
