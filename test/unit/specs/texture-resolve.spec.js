import { Layer } from '@/modv/Layer';
import textureResolve from '@/modv/texture-resolve';
import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('textureResolve()', () => {
  it('should resolve a "Layer" type sourceDef to be a Canvas', () => {
    const tempComponent = {
      render(h) {
        return h();
      },

      created() {
        this.layerTexure = textureResolve.bind(this)({
          source: 'layer',
          sourceData: 0,
        });
      },
    };

    const wrapper = shallowMount(tempComponent, {
      mocks: {
        $store: {
          state: {
            layers: {
              layers: [
                new Layer(),
              ],
            },
          },
        },
      },
      localVue,
    });

    expect(wrapper.vm.layerTexure.tagName)
      .to.equal('CANVAS');
  });
});
