import store from "../worker/store";

export function applyExpression({ value, inputId }) {
  const expressionAssignment = store.getters["expressions/getByInputId"](
    inputId
  );

  let dataOut = value;

  if (expressionAssignment) {
    const scope = {
      value: dataOut,
      time: Date.now()
    };

    dataOut = expressionAssignment.func.evaluate(scope);
  }

  return dataOut;
}
