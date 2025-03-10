import set from "lodash.set";
import { v4 as uuidv4 } from "uuid";
const { Server } = require("node-osc");

const state = {
  servers: {
    // "server-uuidv4": {
    //   server: {}, // the server instance,
    //   id: '',
    //   name: '',
    // }
  },

  data: {
    // "server-uuidv4": recieved data
  },
};

const getters = {
  serverList: (state) =>
    Object.entries(state.servers).reduce(([id, { name }], list) => {
      list[id] = name;
      return list;
    }, {}),
};

const actions = {
  async createServer({ commit }, serverOptions) {
    const server = new Server(serverOptions.port, serverOptions.host, () => {
      console.log("OSC Server is listening");
    });

    const id = uuidv4();

    server.on("message", (msg) => {
      // console.log(msg);
      commit("WRITE_DATA", { id, msg });
    });

    const serverContext = {
      id,
      server,
      name: serverOptions.name ?? `${serverOptions.host}:${serverOptions.port}`,
    };

    commit("ADD_SERVER", serverContext);

    return serverContext;
  },

  async removeServer({ commit }, id) {
    const serverContext = state.servers[id];

    serverContext.server.close();

    commit("DELETE_SERVER", id);
  },
};

const mutations = {
  ADD_SERVER(state, serverContext) {
    state.servers[serverContext.id] = serverContext;
  },

  DELETE_RECIEVER(state, id) {
    delete state.servers[id];
  },

  WRITE_DATA(state, { msg }) {
    set(state.data, msg[0].substring(1).replaceAll("/", "."), msg.slice(1));
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
