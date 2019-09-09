import Vue from "vue";
import anime from "animejs";
import store from "../";
const uuidv4 = require("uuid/v4");

if (typeof window === "undefined") {
  // shims for anime in a worker
  self.NodeList = function() {};
  self.HTMLCollection = function() {};
  self.SVGElement = function() {};
  self.window = { Promise };
}

const frames = {};
const progress = {};

const state = {
  tweens: {},
  easings: Object.keys(anime.easings).map(easing => ({
    value: easing,
    label: easing
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^\w/, c => c.toUpperCase())
  }))
};

const getters = {
  progress: () => progress,
  frames: () => frames
};

async function buildFrames({
  id,
  loop,
  data,
  duration,
  direction,
  easing,
  bpmDivision,
  useBpm
}) {
  const bpm = store.state.beats.bpm || 120;
  const newDuration =
    (useBpm ? ((60 * 60) / bpm) * bpmDivision : duration) || 1000;

  let seek = 0;

  if (state.tweens[id]) {
    seek = ((duration / 100) * progress[id]) / 100;
  }

  return new Promise(resolve => {
    const objOut = {};
    const mapped = {};

    let newData = data;

    if (loop) {
      newData = data.concat([data[0]]);
    }

    const frameDuration = duration / newData.length;

    for (let i = 0, len = newData.length; i < len; i++) {
      const datum = newData[i];

      let index = 0;
      for (let j = 0, len = datum.length; j < len; j++) {
        const value = datum[j];

        if (!(index in objOut)) {
          objOut[index] = value;
          mapped[index] = [];
        }

        mapped[index].push({
          value,
          duration:
            i === 0 || i === newData.length - 1
              ? frameDuration / 2
              : frameDuration
        });
        index++;
      }
    }

    const animation = anime({
      targets: objOut,
      ...mapped,
      duration: newDuration,
      easing: easing || "linear",
      direction,
      autoplay: false,
      update(anim) {
        progress[id] = anim.progress;
      }
    });

    const animationCache = [];
    let frame = 0;
    const framesRequired = Math.round(newDuration / 60) || 1;

    while (frame < framesRequired) {
      animation.seek((frame / framesRequired) * animation.duration);
      animationCache.push(Object.assign({}, objOut));
      frame++;
    }

    frames[id] = Math.floor(animationCache.length * seek);

    resolve(animationCache);
  });
}

const actions = {
  async createTween(
    { commit },
    {
      id = uuidv4(),
      data,
      duration = 1000,
      direction = "normal",
      easing = "linear",
      loop = true,
      useBpm = true,
      bpmDivision = 16
    }
  ) {
    const animationCache = await buildFrames({
      id,
      loop,
      data,
      duration,
      direction,
      easing,
      useBpm,
      bpmDivision
    });

    const tween = {
      id,
      frames: animationCache,
      data,
      loop,
      easing,
      duration,
      direction,
      useBpm,
      bpmDivision
    };

    commit("ADD_TWEEN", tween);

    return tween;
  },

  async updateBpm({ commit }, { bpm }) {
    const tweenKeys = Object.keys(state.tweens);
    const tweenKeysLength = tweenKeys.length;

    for (let i = 0; i < tweenKeysLength; ++i) {
      const tween = state.tweens[tweenKeys[i]];

      if (tween.useBpm) {
        commit("UPDATE_TWEEN_VALUE", {
          id: tween.id,
          key: "duration",
          value: ((60 * 60) / bpm) * tween.bpmDivision
        });

        const frames = await buildFrames(tween);

        commit("UPDATE_TWEEN_VALUE", {
          id: tween.id,
          key: "frames",
          value: frames
        });
      }
    }
  }
};

const mutations = {
  ADD_TWEEN(state, tween) {
    Vue.set(state.tweens, tween.id, tween);
    frames[tween.id] = 0;
  },

  UPDATE_TWEEN_VALUE(state, { id, key, value }) {
    state.tweens[id][key] = value;
  }
};

function advanceFrame(id) {
  if (frames[id] < state.tweens[id].frames.length - 1) {
    ++frames[id];
  } else {
    frames[id] = 0;
  }
}

export { frames, advanceFrame };

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
