import store from "../";
import { frames, advanceFrame } from "./tweens";

const state = {
  int: {
    get: value => value
  },
  bool: {
    get: value => value
  },
  vec2: {
    get: value => value
  },
  vec3: {
    get: value => value
  },
  vec4: {
    get: value => value
  },
  float: {
    get: value => value
  },
  color: {
    get: value => value
  },
  texture: {
    get: value => value
  },
  enum: {
    get: value => value
  },

  tween: {
    async create(args) {
      const tween = await store.dispatch("tweens/createTween", args);
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

const actions = {
  createType({ state }, { type, args }) {
    return state[type].create(args);
  }
};

export default {
  namespaced: true,
  state,
  actions
};
