import store from '@/store';
import installPlugin from './install-plugin';

/**
 * Adds an extension to modV
 *
 * @param {String} type      The type of extension being added
 * @param {Object} extension The extension to add
 *
 */
export default function use(type, extension) {
  switch (type) {
    case 'plugin': {
      installPlugin(extension);
      break;
    }

    case 'control': {
      store.dispatch('plugins/controls/addControl', extension);
      break;
    }

    case 'statusBar': {
      store.commit('plugins/statusbar/addItem', extension);
      break;
    }

    case 'renderer': {
      store.commit('renderers/addRenderer', extension);
      break;
    }

    default: {
      installPlugin(type || extension);
      break;
    }
  }
}
