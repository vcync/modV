import store from '@/../store';

export default function textureResolve(sourceDef) {
  const { source, sourceData } = sourceDef;

  switch (source) {
    case 'layer': {
      if (sourceData < 0) return false;
      return store.state.layers.layers[sourceData].canvas;
    }

    case 'image': {
      return false;
    }

    case 'video': {
      return false;
    }

    default: {
      return false;
    }
  }
}
