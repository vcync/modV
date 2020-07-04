import Vue from "vue";
import anime from "animejs";
import store from "../";
import uuidv4 from "uuid/v4";

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
  easings: Object.keys(anime.penner).map(easing => ({
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
  useBpm,
  durationAsTotalTime,
  steps
}) {
  let newDuration = 1000;

  if (useBpm) {
    const bpm = store.state.beats.bpm || 120;
    const calculatedBpm = ((60 * 60) / bpm) * bpmDivision;

    newDuration = durationAsTotalTime
      ? calculatedBpm
      : calculatedBpm / data.length;
  } else {
    newDuration = durationAsTotalTime ? duration : duration / data.length;
  }

  let seek = 0;

  if (state.tweens[id]) {
    seek = frames[id] / state.tweens[id].frames.length;
  }

  return new Promise(resolve => {
    const objOut = {};
    const mapped = {};

    const newData = data;

    for (let i = 0, len = newData.length; i < len; i++) {
      const datum = newData[i];

      let index = 0;
      for (let j = 0, lenj = datum.length; j < lenj; j++) {
        const value = datum[j];

        if (!(index in objOut)) {
          objOut[index] = value;
          mapped[index] = [];
        }

        mapped[index].push(value);
        index++;
      }
    }

    const animation = anime({
      targets: objOut,
      ...mapped,
      duration: newDuration,
      easing: steps ? `steps(${steps})` : easing || "linear",
      direction,
      autoplay: false,
      loop,
      update(anim) {
        progress[id] = anim.progress;
      }
    });

    const animationCache = [];
    let frame = 0;
    const framesRequired = Math.round(newDuration / 60) || 1;

    let frameRecordingCompleted = false;
    let frameRecordingDirection = 1;

    if (loop) {
      while (!frameRecordingCompleted) {
        animation.seek((frame / framesRequired) * newDuration);
        animationCache.push(Object.assign({}, objOut));

        if (frame === framesRequired) {
          frameRecordingDirection = -1;
        }

        frame += frameRecordingDirection;

        if (frame === 0) {
          frameRecordingCompleted = true;
        }
      }
    } else {
      while (frame < framesRequired) {
        animation.seek((frame / framesRequired) * newDuration);
        animationCache.push(Object.assign({}, objOut));
        frame++;
      }
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
      direction = "alternate",
      easing = "linear",
      loop = true,
      useBpm = true,
      bpmDivision = 16,
      durationAsTotalTime = false,
      isGallery,
      steps = 0
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
      bpmDivision,
      durationAsTotalTime,
      steps
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
      bpmDivision,
      durationAsTotalTime,
      isGallery,
      steps
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
        const calculatedBpm = ((60 * 60) / bpm) * tween.bpmDivision;

        commit("UPDATE_TWEEN_VALUE", {
          id: tween.id,
          key: "duration",
          value: tween.durationAsTotalTime
            ? calculatedBpm
            : calculatedBpm * tween.data.length
        });

        const frames = await buildFrames(tween);

        commit("UPDATE_TWEEN_VALUE", {
          id: tween.id,
          key: "frames",
          value: frames
        });
      }
    }
  },

  createPresetData() {
    return Object.values(state.tweens).filter(tween => !tween.isGallery);
  },

  async loadPresetData(context, tweens) {
    const tweenValues = Object.values(tweens);
    for (let i = 0, len = tweenValues.length; i < len; i++) {
      const tween = tweenValues[i];

      await store.dispatch("dataTypes/createType", {
        type: "tween",
        args: tween
      });
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
