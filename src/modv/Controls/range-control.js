/* eslint-disable */

require('script-loader!../../libraries/rangeRanger.js');

const ControlError = require('./control-error');
const Control = require('./control');

module.exports = function (modV) {
  modV.prototype.RangeControl = class RangeControl extends Control {
    constructor(settings) {
      const RangeControlError = new ControlError('RangeControl');

      // Check for settings Object
      if (!settings) throw new RangeControlError('RangeControl had no settings');
      if (!('min' in settings)) throw new RangeControlError('RangeControl had no "min" in settings');
      if (!('max' in settings)) throw new RangeControlError('RangeControl had no "max" in settings');
      if (!('varType' in settings)) throw new RangeControlError('RangeControl had no "varType" in settings');

      // All checks pass, call super
      super(settings);
    }

    makeNode(modV, Module, id, isPreset, internalPresetValue) {
      const settings = this.settings;

      const node = document.createElement('input');
      node.type = 'range';
      node.min = settings.min;
      node.max = settings.max;
      node.classList.add('modv-range-control');
      if ('step' in settings) node.step = settings.step;

      rangeRanger(node, {
        alt: {
          use: true,
          useCombo: true,
          modifier: 4,
          priority: 2,
        },
        shift: {
          use: true,
          useCombo: true,
          modifier: 8,
          priority: 1,
        },
        ctrl: {
          use: false,
          useCombo: false,
        },
        meta: {
          use: false,
          useCombo: false,
        },
        combo: {
          use: true,
          modifier: 16,
        },
      });

      let modKey;

      if ((navigator.appVersion.indexOf('Mac') !== -1)) {
        modKey = 'metaKey';
      } else {
        modKey = 'ctrlKey';
      }

      if (!settings.useInternalValue) {
        node.addEventListener('mousedown', (e) => {
          if (e[modKey]) {
            e.preventDefault();
            node.value = 0;
            Module[this.variable] = settings.default || 0;
          }
        });
      }

      node.addEventListener('input', () => {
        this.value = node.value;
      }, false);

      this.init(id, Module, node, isPreset, internalPresetValue, modV);
      return node;
    }

    get min() {
      return this.settings.min;
    }

    get max() {
      return this.settings.max;
    }
  };
};
