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

    this.window.document.body.appendChild(this.canvas);

    this.window.document.title = "Split Screen Output";
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

    const { canvas, inputCanvas, context } = this;
    const { width, height } = canvas;
    const { width: inputWidth, height: inputHeight } = inputCanvas;

    // const srcAspect = inputWidth / (inputHeight / 2)

    // const dstAspect = width / 2 / height
    // const srcHeight = Math.ceil(inputWidth / dstAspect)
    // const srcOffset = (inputHeight / 2 - srcHeight) / 2

    // console.log({ srcAspect, srcHeight, srcOffset })
    context.clearRect(0, 0, width, height);
    context.drawImage(
      inputCanvas,
      0, // sx
      0, // sy
      inputWidth / 2, // sw
      inputHeight, // sh
      0, // dx
      0, // dy
      width, // dw
      height / 2 // dh
    );

    context.drawImage(
      inputCanvas,
      inputWidth / 2, // sx
      0, // sy
      inputWidth / 2, // sw
      inputHeight, // sh
      0, // dx
      height / 2, // dy
      width, // dw
      height / 2 // dh
    );
  }
}
