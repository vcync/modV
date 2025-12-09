// import Meyda from 'meyda';

export default {
  meta: {
    name: "Concentrics",
    author: "2xAA",
    version: "1.0.0",
    audioFeatures: ["zcr", "rms"],
    type: "2d",
  },

  props: {
    rms: {
      type: "bool",
      variable: "",
      label: "Use RMS",
      default: true,
    },

    intensity: {
      type: "float",
      label: "RMS/ZCR Intensity",
      min: 0,
      max: 30,
      default: 1,
    },

    spacing: {
      type: "float",
      label: "Circle Spacing",
      min: 0,
      max: 100,
      default: 5,
    },

    objectDistance: {
      type: "float",
      label: "Object Distance",
      min: 0,
      max: 200,
      default: 40,
    },

    strokeWeight: {
      type: "float",
      label: "Stroke Weight",
      min: 1,
      max: 20,
      default: 1,
      strict: true,
    },
  },

  data: {
    circles: [],
  },

  init({ canvas, data }) {
    const circles = [];
    const x = canvas.width / 2;
    const y = canvas.height / 2;

    circles.push(this.circlesObjectFactory({ x, y }));
    circles.push(this.circlesObjectFactory({ x, y }));

    data.circles = circles;

    return data;
  },

  update({ canvas, data, delta, props }) {
    const { width, height } = canvas;
    const widthHalf = width / 2;
    const heightHalf = height / 2;

    this.updateCircles({
      circles: data.circles[0],
      x: widthHalf + Math.sin(delta / 1000) * props.objectDistance,
      y: heightHalf + Math.cos(delta / 1000) * (props.objectDistance / 2),
    });

    this.updateCircles({
      circles: data.circles[1],
      x: widthHalf + -Math.sin(delta / 1000) * props.objectDistance,
      y: heightHalf + -Math.cos(delta / 1000) * (props.objectDistance / 2),
    });

    return data;
  },

  draw({ context, features, data, props }) {
    const { strokeWeight, spacing, rms, intensity } = props;
    let amp = features.zcr;
    if (rms) {
      amp = features.rms;
    }

    amp *= intensity;
    if (rms) {
      amp *= 50;
    }

    this.drawCircles({
      circles: data.circles[0],
      context,
      amp,
      strokeWeight,
      spacing,
    });

    this.drawCircles({
      circles: data.circles[1],
      context,
      amp,
      strokeWeight,
      spacing,
    });
  },

  circlesObjectFactory({ x, y }) {
    return {
      hue: Math.round(Math.random() * 360),
      x,
      y,
    };
  },

  updateCircles({ circles, x, y }) {
    if (circles.hue > 360) {
      circles.hue = 0;
    } else {
      circles.hue += 0.2;
    }

    circles.x = x;
    circles.y = y;

    return circles;
  },

  drawCircles({ circles, context, amp, strokeWeight, spacing }) {
    context.lineWidth = strokeWeight;
    context.strokeStyle = `hsl(${circles.hue}, 50%, 50%)`;

    for (let i = 0; i < amp; i += 1) {
      if (i === amp - 1) {
        context.strokeStyle = `hsl(${circles.hue}, 50%, ${
          (1 - (amp - Math.round(amp))) * 50
        }%)`;
      }

      context.beginPath();
      context.arc(circles.x, circles.y, i * spacing, 0, 2 * Math.PI);
      context.closePath();
      context.stroke();
    }
  },
};
