import get from "lodash.get";
import store from "../worker/store";

export function applyExpression({ value, inputId }) {
  const expressionAssignment =
    store.getters["expressions/getByInputId"](inputId);

  const input = store.state.inputs.inputs[inputId];

  let dataOut = value;

  if (expressionAssignment) {
    const scope = {
      value: dataOut,
      time: Date.now(),
      inputValue: get(store.state, input.getLocation),
      osc: store.state.osc.data,
    };

    dataOut = expressionAssignment.func(scope);
  }

  return dataOut;
}
