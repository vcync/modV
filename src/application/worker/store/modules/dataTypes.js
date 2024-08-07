import store from "../";
import { frames, advanceFrame } from "./tweens";

const state = {
  text: {
    get: value => value
  },
  int: {
    get: value => value
  },
  bool: {
    get: value => value
  },
  event: {
    get: value => value
  },
  vec2: {
    get: value => value,
    inputs: () => ({ 0: 0, 1: 0 })
  },
  vec3: {
    get: value => value,
    inputs: () => ({ 0: 0, 1: 0, 2: 0 })
  },
  vec4: {
    get: value => value,
    inputs: () => ({ 0: 0, 1: 0, 2: 0, 3: 0 })
  },
  float: {
    get: value => value
  },
  color: {
    get: value => value,
    inputs: () => ({ r: 0, g: 0, b: 0, a: 0 })
  },
  texture: {
    async create(textureDefinition = {}, isGallery, useExistingData = false) {
      const { type, options } = textureDefinition;
      textureDefinition.location = textureDefinition.location ?? "";
      // textureDefinition.id = textureDefinition.id ?? "";

      if (type === "image") {
        const { path } = options;
        let id;
        try {
          ({ id } = await store.dispatch("images/createImageFromPath", {
            path
          }));
        } catch (e) {
          console.error(e);
        }

        textureDefinition.location = "images/image";
        textureDefinition.id = id;
      }

      if (type === "video" && (useExistingData || !textureDefinition.id)) {
        let id;
        try {
          ({ id } = await store.dispatch(
            "videos/createVideoFromPath",
            textureDefinition
          ));
        } catch (e) {
          console.error(e);
        }

        textureDefinition.location = "videos/video";
        textureDefinition.id = id;
      }

      if (type === "canvas" || type === "group") {
        const { id } = options;
        textureDefinition.location = "outputs/auxillaryCanvas";
        textureDefinition.id = id;
      }

      textureDefinition.isGallery = isGallery;

      return Object.defineProperty(textureDefinition, "value", {
        enumerable: true,
        get() {
          return store.state.dataTypes.texture.get(textureDefinition);
        }
      });
    },
    async destroy(textureDefinition) {
      const { type, id } = textureDefinition;

      if (type === "video") {
        await store.dispatch("videos/removeVideoById", {
          id
        });
      }
    },
    get: textureDefinition => {
      if (!textureDefinition.location.length) {
        return false;
      }

      return store.getters[textureDefinition.location](textureDefinition.id);
    }
  },
  enum: {
    get: value => value
  },

  tween: {
    async create(args, isGallery) {
      const tween = await store.dispatch("tweens/createTween", {
        ...args,
        isGallery
      });
      return Object.defineProperty(tween, "value", {
        enumerable: true,
        get() {
          return store.state.dataTypes.tween.get(tween);
        }
      });
    },

    get: value => {
      const tween = store.state.tweens.tweens[value.id];
      const frame = tween.frames[frames[value.id]];
      advanceFrame(value.id);
      return frame;
    }
  }
};

const getters = {
  types: state => Object.keys(state)
};

const actions = {
  createType({ state }, { type, args }) {
    return state[type].create(args);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions
};
