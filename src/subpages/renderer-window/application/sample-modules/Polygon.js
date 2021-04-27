export default {
  meta: {
    type: "2d",
    name: "Polygon",
    author: "2xAA",
    audioFeatures: ["rms", "zcr"],
    version: "0.2.0"
  },

  props: {
    intensity: {
      type: "int",
      label: "RMS/ZCR Intensity",
      min: 0,
      max: 30,
      step: 1,
      default: 15
    },

    shapeSize: {
      type: "int",
      label: "Shape Size",
      min: 0,
      max: 300,
      step: 1,
      default: 60
    },

    strokeWeight: {
      type: "int",
      label: "Stroke Weight",
      min: 1,
      max: 20,
      step: 1,
      default: 1,
      strict: true
    },

    fill: {
      type: "bool",
      label: "Fill",
      default: false
    },

    rotateToggle: {
      type: "bool",
      label: "Rotate",
      default: false
    },

    rotateSpeed: {
      type: "float",
      label: "Rotate Speed",
      min: 0.1,
      max: 10.0,
      step: 0.1,
      default: 5.0
    },

    color: {
      type: "tween",
      component: "PaletteControl",
      default: {
        data: [
          [199, 64, 163],
          [97, 214, 199],
          [222, 60, 75],
          [101, 151, 220],
          [213, 158, 151],
          [100, 132, 129],
          [154, 94, 218],
          [194, 211, 205],
          [201, 107, 152],
          [119, 98, 169],
          [214, 175, 208],
          [218, 57, 123],
          [196, 96, 98],
          [218, 74, 219],
          [138, 100, 121],
          [96, 118, 225],
          [132, 195, 223],
          [82, 127, 162],
          [209, 121, 211],
          [181, 152, 220]
        ],
        duration: 500,
        easing: "linear"
      }
    }
  },

  data: {
    rotation: 0
  },

  update({ data, props }) {
    data.rotation += props.rotateSpeed;

    if (data.rotation > 360) {
      data.rotation = 0;
    }

    return data;
  },

  draw({ canvas, context, features, data, props }) {
    const {
      color: { value: color },
      rotateToggle,
      soundType,
      intensity,
      shapeSize,
      fill,
      strokeWeight
    } = props;
    let analysed;
    let rotate = 0;

    if (rotateToggle) {
      rotate = data.rotation;
    }

    if (soundType) {
      analysed = (features.zcr / 10) * intensity;
    } else {
      analysed = features.rms * 10 * intensity;
    }

    context.strokeStyle = `rgb(${Math.round(color[0])},${Math.round(
      color[1]
    )},${Math.round(color[2])})`;
    context.fillStyle = `rgb(${Math.round(color[0])},${Math.round(
      color[1]
    )},${Math.round(color[2])})`;
    context.lineWidth = strokeWeight;

    context.beginPath();
    this.polygon(
      context,
      Math.round(canvas.width / 2),
      Math.round(canvas.height / 2),
      analysed + shapeSize,
      3 + Math.round(analysed / 10),
      rotate * 0.0174533
    );
    context.closePath();
    context.stroke();
    if (fill) {
      context.fill();
    }
  },

  polygon(ctx, x, y, radius, sides, startAngle, anticlockwise) {
    if (sides < 3) {
      return;
    }

    let a = (Math.PI * 2) / sides;
    a = anticlockwise ? -a : a;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(startAngle);
    ctx.moveTo(radius, 0);

    for (let i = 1; i < sides; i += 1) {
      ctx.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
    }

    ctx.closePath();
    ctx.restore();
  }
};
