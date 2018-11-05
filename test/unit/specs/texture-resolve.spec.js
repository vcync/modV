import Layer from '@/modv/Layer';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

describe('textureResolve()', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        layers: {
          layers: [
            new Layer(),
          ],
        },
      },
    });
  });

  it('should output Layer Object with default parameters', () => {
    const layer = Layer();

    expect(layer)
      .to.eql(LayerDefaults);
  });

  it('should overwrite default parameters', () => {
    const layer = Layer({
      enabled: false,
    });

    expect(layer.enabled)
      .to.equal(false);
  });
});
