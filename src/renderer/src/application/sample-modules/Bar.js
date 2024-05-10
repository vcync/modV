export default {
  meta: {
    name: "Bar",
    author: "2xAA",
    type: "2d"
  },

  props: {
    rotation: {
      type: "float",
      default: 0,
      min: 0,
      max: 360
    },

    thickness: {
      type: "float",
      default: 20,
      min: 0,
      max: 200
    },

    strobe: {
      type: "int",
      default: 0,
      min: 0,
      max: 240
    },

    color1: {
      type: "color",
      default: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      }
    },

    color2: {
      type: "color",
      default: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      }
    }
  },

  draw({ canvas: { width, height }, context, delta, props }) {
    const { thickness, strobe, color1, color2, rotation } = props;

    context.translate(width / 2, height / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.translate(-width / 2, -height / 2);

    context.lineWidth = thickness;
    context.beginPath();
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    if (Math.round(delta) % strobe < Math.round(strobe / 2)) {
      context.strokeStyle = `rgba(${color1.r * 255},${color1.g *
        255},${color1.b * 255},${color1.a})`;
    } else {
      context.strokeStyle = `rgba(${color2.r * 255},${color2.g *
        255},${color2.b * 255},${color2.a})`;
    }
    context.stroke();
  }
};
