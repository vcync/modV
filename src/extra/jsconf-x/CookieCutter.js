export default class CanvasSplitter {
  constructor(inputCanvas, autoStart) {
    this.inputCanvas = inputCanvas;

    this.window = window.open(
      "",
      "_blank",
      "width=250, height=250, location=no, menubar=no, left=0"
    );

    this._setupWindow();

    this.raf = null;
    this.running = false;

    if (autoStart) {
      this.start();
    }
  }

  _setupWindow() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");

    this.canvas.width = 1920;
    this.canvas.height = 1080;

    this.squareContext = document.createElement("canvas").getContext("2d");

    this.squareContext.canvas.width = 1359;
    this.squareContext.canvas.height = 1359;

    this.window.document.body.appendChild(this.canvas);

    this.window.document.title = "X Output";
    this.window.document.body.style.margin = "0px";
    this.window.document.body.style.backgroundColor = "black";
    this.window.document.body.style.position = "relative";

    this.canvas.style.backgroundColor = "transparent";
    this.canvas.style.left = "0";
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";

    this.canvas.addEventListener("dblclick", () => {
      if (!this.canvas.ownerDocument.webkitFullscreenElement) {
        this.canvas.webkitRequestFullscreen();
      } else {
        this.canvas.ownerDocument.webkitExitFullscreen();
      }
    });

    let mouseTimer;

    function movedMouse() {
      if (mouseTimer) mouseTimer = null;
      this.canvas.ownerDocument.body.style.cursor = "none";
    }

    this.canvas.addEventListener("mousemove", () => {
      if (mouseTimer) clearTimeout(mouseTimer);
      this.canvas.ownerDocument.body.style.cursor = "default";
      mouseTimer = setTimeout(movedMouse.bind(this), 200);
    });

    window.addEventListener("unload", () => {
      this.window.close();
    });

    this.window.addEventListener("unload", () => {
      this.stop();
    });
  }

  start() {
    this.running = true;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.running = false;
    this.raf = null;
  }

  loop() {
    if (this.running) {
      this.raf = requestAnimationFrame(this.loop);
    }

    const { canvas, inputCanvas, context, squareContext } = this;
    const { canvas: squareCanvas } = squareContext;
    const { width: sqWidth, height: sqHeight } = squareCanvas;
    const { width, height } = canvas;
    const { width: inputWidth, height: inputHeight } = inputCanvas;

    squareContext.clearRect(0, 0, sqWidth, sqHeight);
    squareContext.save();
    squareContext.translate(sqWidth / 2, sqHeight / 2);
    // rotate xº
    const angle = 45;
    squareContext.rotate((angle * Math.PI) / 180);
    squareContext.drawImage(
      inputCanvas,
      -(inputWidth / 2),
      -(inputHeight / 2),
      inputWidth,
      inputHeight
    );
    squareContext.restore();

    squareContext.clearRect(0, 0, 603, 607);
    squareContext.clearRect(754, 0, 605, 607);
    squareContext.clearRect(0, 759, 603, 607);
    squareContext.clearRect(754, 759, 605, 607);

    context.clearRect(0, 0, width, height);
    context.drawImage(squareCanvas, 0, 0, 1359, 759, 92, 60, 1728, 960);
    context.drawImage(squareCanvas, 603, 759, 151, 601, 1440, 30, 192, 768);
  }
}
