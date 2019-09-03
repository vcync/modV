import anime from "animejs";
const uuidv4 = require("uuid/v4");

if (typeof window === "undefined") {
  // shims for anime in a worker
  self.NodeList = function() {};
  self.HTMLCollection = function() {};
  self.SVGElement = function() {};
  self.window = { Promise };
}

const frames = {};

const state = {
  tweens: {},
  easings: Object.keys(anime.easings)
};

const actions = {
  createTween(
    { commit },
    { data, duration = 1000, easing = "linear", loop = true }
  ) {
    const objOut = {};
    const mapped = {};

    let newData = data;

    if (loop) {
      newData = data.concat([data[0]]);
    }

    for (let i = 0, len = newData.length; i < len; i++) {
      const datum = newData[i];

      let index = 0;
      for (let j = 0, len = datum.length; j < len; j++) {
        const value = datum[j];

        if (!(index in objOut)) {
          objOut[index] = value;
          mapped[index] = [];
        }

        mapped[index].push({ value });
        index++;
      }
    }

    const animation = anime({
      targets: objOut,
      ...mapped,
      duration: duration || 1000,
      easing: easing || "linear",
      autoplay: false
    });

    const animationCache = [];
    let frame = 0;
    const framesRequired = Math.round(animation.duration / 60) || 1;

    while (frame < framesRequired) {
      animation.seek((frame / framesRequired) * animation.duration);
      animationCache.push(Object.assign({}, objOut));
      frame++;
    }

    const tween = {
      id: uuidv4(),
      frames: animationCache,
      data,
      loop,
      easing,
      duration
    };

    commit("ADD_TWEEN", tween);

    return tween;
  }
};

const mutations = {
  ADD_TWEEN(state, tween) {
    state.tweens[tween.id] = tween;
    frames[tween.id] = 0;
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
  actions,
  mutations
};
