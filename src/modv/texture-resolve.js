/**
 * @typedef {Object} SourceDef
 *
 * @property {String} source     Type of source
 * @property {any}    sourceData Data pertaining to the source
 *
 */

// import store from '@/store';

/**
 * Resolves a texture from a SourceDef Object
 *
 * @param {SourceDef} sourceDef A SourceDef Object to resolve into a texture
 *
 * @returns {?HTMLImageElement|SVGImageElement|HTMLVideoElement|HTMLCanvasElement|Blob|ImageData|
             ImageBitmap|OffscreenCanvas} Anything compatible with #createImageBitmap()
 */
export default function textureResolve(sourceDef) {
  const { source, sourceData } = sourceDef;

  switch (source) {
    case 'layer': {
      if (sourceData < 0) return null;
      return this.$store.state.layers.layers[sourceData].canvas;
    }

    case 'image': {
      return null;
    }

    case 'video': {
      return null;
    }

    default: {
      return null;
    }
  }
}
