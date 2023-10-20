export default {
  meta: {
    name: "TriangleLife",
    type: "2d",
    version: "0.0.0",
    author: "radiodario"
  },

  props: {
    N: {
      label: "Grid Size",
      type: "int",
      min: 2,
      max: 512,
      default: 128
    },
    stroke: {
      label: "Draw Stroke",
      type: "bool",
      default: false
    },
    fill: {
      label: "Draw Fill",
      type: "bool",
      default: true
    },
    speed: {
      label: "Colour Speed",
      type: "int",
      min: 1,
      max: 1000,
      default: 500
    },
    fg_alpha: {
      label: "FG Alpha",
      type: "int",
      min: 0,
      max: 100,
      default: 100
    },
    bg_alpha: {
      label: "BG Alpha",
      type: "int",
      min: 0,
      max: 100,
      default: 100
    },
    seeds: {
      label: "Seeds",
      type: "int",
      min: 1,
      max: 25000,
      default: 350
    },
    updateInterval: {
      label: "Simulation Steps per Sec",
      type: "int",
      min: 1,
      max: 120, // lol
      default: 60
    },
    drawInterval: {
      label: "Draw steps per Sec",
      type: "int",
      min: 1,
      max: 120, // lol
      default: 60
    },
    waveform: {
      type: "enum",
      label: "Colour Waveform",
      default: "sin",
      enum: [
        { label: "Sine", value: "sin" },
        { label: "Cosine", vaue: "cos" },
        { label: "Triangle", value: "triangle" },
        { label: "saw", vaue: "saw" }
      ]
    },
    monochrome: {
      label: "Monochrome",
      type: "bool",
      default: true
    },
    monochromeHue: {
      label: "Monochrome Hue",
      type: "int",
      default: 180,
      min: 0,
      max: 360
    },
    cycleHue: {
      label: "Cycle Hue",
      type: "bool",
      default: false
    },
    rule: {
      type: "enum",
      label: "Life Rule",
      enum: [
        "2/1",
        "2/2",
        "0,1/3,3",
        "1,2/4,6",
        "*2/3",
        "*2,3/3,3",
        "*2,3/4,5",
        "*2,3/4,6",
        "*3,4/4,5",
        "*3,4/4,6",
        "**4,5/4,6",
        "*4,6/4,4"
      ].map(r => ({ label: r, value: r })),
      default: "2/1"
    }
  },

  data: {
    edge: 0,
    field: [],
    colorCounter: 0,
    counterAngle: 0,
    counterIncrease: 0,
    lastUpdate: 0,
    lastDraw: 0
  },

  init({ data, props }) {
    data.rule = this.parseRule(props.rule);
    data.field = this.initializeField(props);
    const N = props.N;
    for (var i = 0; i < props.seeds; i++) {
      var idx = Math.floor(Math.random() * N * N);
      data.field[idx] = 1;
    }
    return data;
  },

  initializeField(props) {
    var field = [];
    var allCells = props.N * props.N;
    for (var i = 0; i < allCells; i++) {
      field[i] = 0;
    }
    return field;
  },

  draw({ data, props, context, width, height }) {
    context.fillStyle = "rgba(0, 0, 0, " + props.bg_alpha / 100 + ")";
    context.fillRect(0, 0, width, height);

    var N = props.N;
    var x,
      y,
      i,
      l,
      baseY,
      lEdge = data.edge * Math.cos(Math.PI / 6);

    var translate = {
      x: 0, //(width - N * edge / 2 ) / 2,
      y: 0 //(height - N * edge * SQRT2 / 2) / 2
    };

    if (props.cycleHue) {
      props.monochromeHue =
        (props.monochromeHue + 360 / (1001 - props.speed)) % 360;
    }

    for (i = 0, l = data.field.length; i < l; i++) {
      if (data.field[i] <= 0) {
        continue;
      }

      x = i % N;
      y = (i / N) | 0;

      baseY = y * lEdge;
      this.drawTriangle(context, x, y, lEdge, baseY, translate, data);
      this.setColors(context, x, y, props, data);
    }
  },

  drawTriangle(context, x, y, lEdge, baseY, translate, { edge }) {
    context.beginPath();

    var type = (y % 2 << 1) + (x % 2);

    switch (type) {
      case 0:
        context.moveTo(((x + 0) * edge) / 2 + translate.x, baseY + translate.y);
        context.lineTo(((x + 2) * edge) / 2 + translate.x, baseY + translate.y);
        context.lineTo(
          ((x + 1) * edge) / 2 + translate.x,
          baseY + lEdge + translate.y
        );
        break;
      case 1:
        context.moveTo(((x + 1) * edge) / 2 + translate.x, baseY + translate.y);
        context.lineTo(
          ((x + 2) * edge) / 2 + translate.x,
          baseY + lEdge + translate.y
        );
        context.lineTo(
          ((x + 0) * edge) / 2 + translate.x,
          baseY + lEdge + translate.y
        );
        break;
      case 2:
        context.moveTo(((x + 1) * edge) / 2 + translate.x, baseY + translate.y);
        context.lineTo(
          ((x + 2) * edge) / 2 + translate.x,
          baseY + translate.y + lEdge
        );
        context.lineTo(
          ((x + 0) * edge) / 2 + translate.x,
          baseY + translate.y + lEdge
        );
        break;
      case 3:
        context.moveTo(((x + 0) * edge) / 2 + translate.x, baseY + translate.y);
        context.lineTo(((x + 2) * edge) / 2 + translate.x, baseY + translate.y);
        context.lineTo(
          ((x + 1) * edge) / 2 + translate.x,
          baseY + translate.y + lEdge
        );
        break;
    }

    context.closePath();
  },
  setColors(context, x, y, props, data) {
    // var val = Field[x + (N * y)];
    const speed = 1001 - props.speed;
    let color;
    if (props.monochrome) {
      color = hslToRgb(props.monochromeHue / 360, 1, 0.5, props.fg_alpha / 100);
    } else {
      data.counterIncrease = Math.PI / speed;
      data.counterAngle += data.counterIncrease;
      switch (props.waveform) {
        case "sin":
          data.colorCounter = 1 + Math.sin(data.counterAngle) / 2;
          break;
        case "cos":
          data.colorCounter = 1 + Math.cos(data.counterAngle) / 2;
          break;
        case "triangle":
          data.colorCounter = Math.abs((data.counterAngle % 2) - 1);
          break;
        case "saw":
          data.colorCounter = Math.abs(data.counterAngle % 1);
          break;
      }

      color = hslToRgb(data.colorCounter, 1, 0.5, props.fg_alpha / 100);
    }

    if (props.fill) {
      context.fillStyle = color;
      context.fill();
    }
    if (props.stroke) {
      context.strokeStyle = color;
      context.stroke();
    }
  },

  update({ data, props }) {
    let ln = 0; // live neighbor count
    let i, l, val;
    const nextField = this.initializeField(props);

    for (i = 0, l = data.field.length; i < l; i++) {
      ln = this.computeLiveNeighbours(i, props, data);
      val = data.field[i];
      nextField[i] = this.computeNextStateOfCell(val, ln, data.rule);
    }

    data.field = nextField;
    return data;
  },

  neighbours: {
    O: [
      [-1, -2],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [-1, 2],
      [0, -2],
      [0, -1],
      [0, 1],
      [0, 2],
      [1, -1],
      [1, 0],
      [1, 1]
    ],
    E: [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [0, -1],
      [0, 1],
      [0, 2],
      [1, -2],
      [1, -1],
      [1, 0],
      [1, 1],
      [1, 2]
    ]
  },

  computeLiveNeighbours(idx, props, data) {
    const N = props.N;
    const x = idx % N;
    const y = (idx / N) | 0;
    let LN = 0;

    /*
    Each cell has 12 touching neighbors. There are two
    types of cells, E and O cells.
    */
    const type = (x + y) % 2;
    let i, l, nList;

    // Even Cell
    if (type === 1) {
      nList = this.neighbours.E;
    }
    // Odd Cell
    else {
      nList = this.neighbours.O;
    }
    for (i = 0, l = nList.length; i < l; i++) {
      var nb = this.neighbourAt(x, y, nList[i], props, data);
      LN += nb;
    }

    return LN;
  },

  neighbourAt(x, y, neighbour, props, data) {
    const N = props.N;
    let dx = x + neighbour[1];
    let dy = y + neighbour[0];
    // wrap around
    if (dx >= N) {
      dx = dx % N;
    }
    if (dx < 0) {
      dx = N + dx;
    }
    if (dy >= N) {
      dy = dy % N;
    }
    if (dy < 0) {
      dy = N + dy;
    }

    return data.field[dx + dy * N] || 0;
  },

  computeNextStateOfCell(val, LN, rule) {
    if (val > 0) {
      if (LN >= rule.env.l && LN <= rule.env.h) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (LN >= rule.fer.l && LN <= rule.fer.h) {
        return 1;
      } else {
        return 0;
      }
    }
  },

  parseRule(ruleString) {
    const ruleExp = /(\d+|\d+,\d+)\/(\d+|\d+,\d+)$/i;

    const results = ruleExp.exec(ruleString);
    const rule = {
      env: {
        l: 0,
        h: 0
      },
      fer: {
        l: 0,
        h: 0
      }
    };

    // environment
    var env = results[1];
    if (env.length >= 3) {
      var envp = env.split(",");
      rule.env.l = +envp[0];
      rule.env.h = +envp[1];
    } else {
      rule.env.l = +env;
      rule.env.h = +env;
    }

    // fertility
    var fer = results[2];
    if (fer.length >= 3) {
      var ferp = fer.split(",");
      rule.fer.l = +ferp[0];
      rule.fer.h = +ferp[1];
    } else {
      rule.fer.l = +fer;
      rule.fer.h = +fer;
    }
    return rule;
  }
};

function hslToRgb(h, s, l, a) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  if (arguments.length == 3) {
    return (
      "rgb(" +
      Math.floor(r * 255) +
      "," +
      Math.floor(g * 255) +
      "," +
      Math.floor(b * 255) +
      ")"
    );
  }
  if (arguments.length == 4) {
    return (
      "rgba(" +
      Math.floor(r * 255) +
      "," +
      Math.floor(g * 255) +
      "," +
      Math.floor(b * 255) +
      ", " +
      a +
      ")"
    );
  }
}

function hue2rgb(p, q, t) {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }
  if (t < 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}
