const mappingCanvas = new OffscreenCanvas(1, 1);
mappingCanvas.title = "mappingCanvas";

let timeout = 0;
let connection = undefined;
let outputContext = null;
let reconnect = false;

const mappingContext = mappingCanvas.getContext("2d", {
  // Boolean that indicates if the canvas contains an alpha channel.
  // If set to false, the browser now knows that the backdrop is always opaque,
  // which can speed up drawing of transparent content and images.
  // (lights don't have an alpha channel, so let's drop it)
  alpha: false,
  desynchronized: true,
  imageSmoothingEnabled: false
});

export default {
  name: "Grab Canvas",
  props: {
    mappingWidth: {
      type: "int",
      default: 7,
      min: 1,
      max: 1024,
      step: 1,
      abs: true
    },

    mappingHeight: {
      type: "int",
      default: 7,
      min: 1,
      max: 1024,
      step: 1,
      abs: true
    },

    url: {
      type: "text",
      default: "ws://localhost:3006/modV"
    },

    reconnectAfter: {
      type: "int",
      default: 4000,
      min: 1000,
      max: 60000,
      step: 1,
      abs: true
    },

    shouldReconnect: {
      type: "bool",
      default: true
    }
  },

  async init({ store, props }) {
    if (!outputContext) {
      outputContext = await store.dispatch("outputs/getAuxillaryOutput", {
        name: "Fixture Canvas",
        group: "Plugins",
        canvas: mappingCanvas,
        context: mappingContext,
        reactToResize: false
      });
    }

    mappingCanvas.width = props.mappingWidth;
    mappingCanvas.height = props.mappingHeight;

    reconnect = props.shouldReconnect;

    this.setupSocket(props);
  },

  shutdown() {
    this.stopReconnect();
    this.closeConnection();
  },

  /**
   * Create a WebSocket for example to luminave
   */
  setupSocket(props) {
    const { url, reconnectAfter } = props;

    // Close an old connection
    this.closeConnection();

    // Create a new connection
    connection = new WebSocket(url);

    // Listen for errors (e.g. could not connect)
    connection.addEventListener("error", event => {
      console.error("grab-canvas: WebSocket: Error:", event);

      // Reconnect is allowed
      if (reconnect) {
        // Reconnect after a specific amount of time
        timeout = setTimeout(() => {
          this.setupSocket(props);
        }, reconnectAfter);
      }
    });

    // Connection is opened
    connection.addEventListener("open", () => {
      console.info("grab-canvas: WebSocket: Opened");
    });

    connection.addEventListener("close", () => {
      console.info("grab-canvas: WebSocket: Closed");
    });
  },

  /**
   * Close the WebSocket connection and stop reconnecting
   */
  closeConnection() {
    clearTimeout(timeout);

    if (connection !== undefined) {
      connection.close();
    }

    connection = undefined;
  },

  /**
   * Stop reconnecting to WebSocket
   */
  stopReconnect() {
    reconnect = false;
    clearTimeout(timeout);
  },

  postProcessFrame({ canvas, props }) {
    mappingContext.clearRect(0, 0, canvas.width, canvas.height);
    mappingContext.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      props.mappingWidth,
      props.mappingHeight
    );

    const imageData = mappingContext.getImageData(
      0,
      0,
      props.mappingWidth,
      props.mappingHeight
    );
    const { data } = imageData;
    const arrayData = Array.from(data);
    const rgbArray = arrayData.filter((value, index) => (index + 1) % 4 !== 0);

    this.send(rgbArray);
  },

  /**
   * Send data to WebSocket if connection is established
   * @param {Object} data
   */
  send(data) {
    // Connection is established
    if (connection !== undefined && connection.readyState === 1) {
      const message = {
        _type: "modV",
        colors: data
      };

      const messageString = JSON.stringify(message, null, 2);

      // Send JSON message
      connection.send(messageString);
    }
  }
};
