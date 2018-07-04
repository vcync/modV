import store from '@/../store';
import shadertoyStore from './store';
import galleryTabComponent from './Gallery';

const shaderToy = {
  name: 'Shadertoy',
  galleryTabComponent,

  /**
   * Only called when added as a Vue plugin,
   * this must be registered with vue before modV
   * to use vuex or vue
   */
  install(Vue) {
    Vue.component(galleryTabComponent.name, galleryTabComponent);

    store.registerModule('shaderToy', shadertoyStore);
  },
};

export default shaderToy;
