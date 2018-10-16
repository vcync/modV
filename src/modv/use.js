import store from '@/../store';
import installPlugin from './install-plugin';

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

    default: {
      installPlugin(type || extension);
      break;
    }
  }
}
