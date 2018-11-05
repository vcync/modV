import { Layer, defaults as LayerDefaults } from '@/modv/Layer';

describe('Layer()', () => {
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
