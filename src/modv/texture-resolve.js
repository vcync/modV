import store from '@/store';

export default function textureResolve(sourceDef) {
  return new Promise((resolve) => {
    const { source, sourceData } = sourceDef;

    switch (source) {
      case 'layer': {
        if (sourceData < 0) resolve(false);
        resolve({ ...sourceDef, texture: store.state.layers.layers[sourceData].canvas });
        break;
      }

      case 'image': {
        const image = new Image();
        image.onload = () => resolve({ ...sourceDef, texture: image });
        image.crossOrigin = 'anonymous';
        image.src = sourceData;
        break;
      }

      case 'video': {
        resolve(false);
        break;
      }

      default: {
        resolve(false);
        break;
      }
    }
  });
}
