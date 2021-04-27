import store from "./store";

export default {
  store: {
    state: store.state,
    getters: store.getters

    // async commit(...args) {
    // return await that.$asyncWorker.postMessage({
    //     __async: true,
    //     type: "commit",
    //     identifier: args[0],
    //     payload: args[1]
    //   },
    //   args[2]
    // );
    // },

    // async dispatch(...args) {
    // return await that.$asyncWorker.postMessage({
    //     __async: true,
    //     type: "dispatch",
    //     identifier: args[0],
    //     payload: args[1]
    //   },
    //   args[2]
    // );
    // }
  }
};
