import get from "lodash.get";
import { v4 as uuidv4 } from "uuid";
import math from "mathjs/dist/math.js";
import { SWAP } from "./common/swap";

function getDefaultState() {
  return {
    assignments: {},
  };
}

const state = getDefaultState();
const swap = getDefaultState();

// getters
const getters = {
  getByInputId: (state) => (inputId) => {
    const assignmentValues = Object.values(state.assignments);

    return assignmentValues.find(
      (assignment) => assignment.inputId === inputId,
    );
  },
};

function compileExpression(expression, scopeItems = {}) {
  const scope = { value: 0, time: 0, ...scopeItems };

  let newFunction;
  const node = math.parse(expression, scope);

  newFunction = node.compile();
  newFunction.evaluate(scope);

  return newFunction;
}

// actions
const actions = {
  create(
    { rootState, commit },
    { expression = "value", id, inputId, writeToSwap },
  ) {
    if (!inputId) {
      throw new Error("Input ID required");
    }

    if (expression.trim() === "value") {
      return null;
    }

    const expressionId = id || uuidv4();

    const input = rootState.inputs.inputs[inputId];

    const func = compileExpression(expression, {
      // We currrently have no way of interacting with swap state.
      // This would be something to fix in the future, maybe use an entire store
      // for swap, or write a more specific mechanism to look up values in swap
      // state.
      inputValue: writeToSwap ? 0 : get(rootState, input.getLocation),
    });

    if (!func) {
      throw new Error("Unable to compile Expression");
    }

    const assignment = {
      id: expressionId,
      inputId,
      func,
      expression,
    };

    commit("ADD_EXPRESSION", { assignment, writeToSwap });

    return expressionId;
  },

  update({ rootState, commit }, { id, expression = "value", writeToSwap }) {
    if (!id) {
      throw new Error("Expression ID required");
    }

    const existingExpression = state.assignments[id];

    if (!existingExpression) {
      throw new Error(`Existing expression with ID ${id} not found`);
    }

    if (expression.trim() === "value") {
      commit("REMOVE_EXPRESSION", { id });
      return null;
    }

    const input = rootState.inputs.inputs[existingExpression.inputId];

    const func = compileExpression(expression, {
      inputValue: get(rootState, input.getLocation),
    });

    if (!func) {
      throw new Error("Unable to compile Expression");
    }

    existingExpression.func = func;
    existingExpression.expression = expression;

    commit("ADD_EXPRESSION", { assignment: existingExpression, writeToSwap });
    return existingExpression.id;
  },

  remove({ commit }, args) {
    commit("REMOVE_EXPRESSION", args);
  },

  createPresetData() {
    return state;
  },

  async loadPresetData({ dispatch }, data) {
    const assignments = Object.values(data.assignments);
    for (let i = 0, len = assignments.length; i < len; i++) {
      const assignment = assignments[i];

      await dispatch("create", { ...assignment, writeToSwap: true });
    }
  },
};

// mutations
const mutations = {
  ADD_EXPRESSION(state, { assignment, writeToSwap = false }) {
    const writeTo = writeToSwap ? swap : state;
    writeTo.assignments[assignment.id] = assignment;
  },

  REMOVE_EXPRESSION(state, { id }) {
    delete state.assignments[id];
  },

  SWAP: SWAP(swap, getDefaultState),
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
