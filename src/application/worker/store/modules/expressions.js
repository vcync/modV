import get from "lodash.get";
import { v4 as uuidv4 } from "uuid";
const math = require("mathjs");

const state = {
  assignments: {}
};

// getters
const getters = {
  getByInputId: state => inputId => {
    const assignmentValues = Object.values(state.assignments);

    return assignmentValues.find(assignment => assignment.inputId === inputId);
  }
};

function compileExpression(expression, scopeItems = {}) {
  const scope = { value: 0, time: 0, ...scopeItems };

  let newFunction;
  try {
    const node = math.parse(expression, scope);

    newFunction = node.compile();
    newFunction.evaluate(scope);
  } catch (e) {
    throw e;
  }

  return newFunction;
}

// actions
const actions = {
  create({ rootState, commit }, { expression = "value", id, inputId }) {
    if (!inputId) {
      throw new Error("Input ID required");
    }

    if (expression.trim() === "value") {
      return null;
    }

    const expressionId = id || uuidv4();

    const input = rootState.inputs.inputs[inputId];

    const func = compileExpression(expression, {
      inputValue: get(rootState, input.getLocation)
    });

    if (!func) {
      throw new Error("Unable to compile Expression");
    }

    const assignment = {
      id: expressionId,
      inputId,
      func,
      expression
    };

    commit("ADD_EXPRESSION", { assignment });

    return expressionId;
  },

  update({ rootState, commit }, { id, expression = "value" }) {
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
      inputValue: get(rootState, input.getLocation)
    });

    if (!func) {
      throw new Error("Unable to compile Expression");
    }

    existingExpression.func = func;
    existingExpression.expression = expression;

    commit("ADD_EXPRESSION", { assignment: existingExpression });
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

      await dispatch("create", assignment);
    }
  }
};

// mutations
const mutations = {
  ADD_EXPRESSION(state, { assignment }) {
    state.assignments[assignment.id] = assignment;
  },

  REMOVE_EXPRESSION(state, { id }) {
    delete state.assignments[id];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
