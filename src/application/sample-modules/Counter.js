export default {
  meta: {
    name: "Counter",
    type: "2d"
  },

  props: {
    input1: {
      default: 0.5,
      min: 0,
      max: 1,
      type: "float"
    }
  },

  data: {
    counter: 0
  },

  multiply(value, multiplier) {
    return value * multiplier;
  },

  update({ data, props }) {
    data.counter += this.multiply(props.input1, 2);
    return data;
  },

  draw({ data, context, canvas: { width, height } }) {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "black";
    context.fillText(data.counter, width / 2, height / 2);
  }
};
