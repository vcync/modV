import ctw from "canvas-text-wrapper";

const CanvasTextWrapper = ctw.CanvasTextWrapper;

export default {
  meta: {
    name: "Text",
    type: "2d"
  },

  props: {
    text: {
      type: "text",
      default: "",
      set() {
        this.drawText();
      }
    },

    size: {
      type: "int",
      min: 0,
      max: 1000,
      default: 16,
      set() {
        this.drawText();
      }
    },

    positionX: {
      type: "float",
      default: 0.5,
      max: 1,
      min: 0,
      strict: true
    },

    positionY: {
      type: "float",
      default: 0.5,
      max: 1,
      min: 0,
      strict: true
    },

    strokeSize: {
      type: "float",
      default: 1,
      max: 50,
      min: 0,
      abs: true,
      set() {
        this.drawText();
      }
    },

    font: {
      type: "text",
      default: "Proxima Nova",
      set() {
        this.drawText();
      }
    },

    weight: {
      type: "text",
      default: "bold",
      set() {
        this.drawText();
      }
    },

    fill: {
      type: "bool",
      default: true,
      set() {
        this.drawText();
      }
    },

    fillColor: {
      type: "color",
      default: "#000000",
      set() {
        this.drawText();
      }
    },

    stroke: {
      type: "bool",
      default: false,
      set() {
        this.drawText();
      }
    },

    strokeColor: {
      type: "color",
      default: "#ffffff",
      set() {
        this.drawText();
      }
    }
  },

  data: {
    _size: 16
  },

  init({ canvas: { width, height } }) {
    this.canvas = new OffscreenCanvas(width, height);
    this.context = this.canvas.getContext("2d");
    this.drawText();
  },

  resize({ canvas: { width, height } }) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.drawText();
  },

  draw({ context }) {
    context.drawImage(this.canvas, 0, 0);
  },

  drawText() {
    const {
      size,
      canvas,
      canvas: { width, height },
      context,
      text,
      strokeSize,
      font,
      weight,
      stroke,
      strokeColor,
      fillColor,
      fill
    } = this;

    if (fill) {
      context.fillStyle = fillColor;
    } else {
      context.fillStyle = "rgba(0,0,0,0)";
    }
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeSize;
    context.clearRect(0, 0, width, height);

    CanvasTextWrapper(canvas, text, {
      font: `${weight} ${size}px ${font}`,
      verticalAlign: "middle",
      textAlign: "center",
      strokeText: stroke
    });
  }
};
