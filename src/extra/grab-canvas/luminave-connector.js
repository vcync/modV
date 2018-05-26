export default class LuminaveConnector {
  /**
   * - Create a WebSocket to luminave to transmit colors
   * - Extract the colors from the modV output canvas (as specified in grab-canvas/index.js)
   * - Calculate the average color for the whole output and for specified areas
   *
   * @param{string} url - WebSocket-URI
   * @param{number} width - Width of the smallCanvas
   * @param{number} height - Height of the smallCanvas
   * @param{number} selectionX - Amount of areas we select on the x-axis
   * @param{number} selectionY - Amount of areas we select on the y-axis
   *
   * @example
   * Selecting colors:
   *
   *
     selectionX = 4
     selectionY = 4
     -----------------
     a1   b1   c1   d1
     a2   b2   c2   d2
     a3   b3   c3   d3
     a4   b4   c4   d4
     -----------------
     => [a1, a2, a3, a4, b1, b2, b3, b4, c1, c2, c3, c4, d1, d2, d3, d4]

     selectionX = 2
     selectionY = 2
     -------
     a1   b1
     a2   b2
     -------
     => [a1, a2, b1, b2]
   */
  constructor(args = {}) {
    this.url = args.url || 'ws://localhost:3000/modV';

    // Create WebSocket connection
    this.setupSocket(this.url);

    // Width / Height of canvas
    this.width = args.width || 0;
    this.height = args.height || 0;

    // Number of selected areas
    this.selectionX = args.selectionX || 1;
    this.selectionY = args.selectionY || 1;

    // The raw canvas data
    this.data = '';
  }

  /**
   * Create a WebSocket to luminave
   */
  setupSocket() {
    // Open the connection
    this.connection = new WebSocket(this.url);

    // Handle: Errors
    this.connection.onerror = (error) => {
      console.error('lumiaveConnector: WebSocket: Error:', error); //eslint-disable-line
    };

    // Handle: Connection was opened
    this.connection.onopen = () => {
      console.info('lumiaveConnector: WebSocket: Opened'); //eslint-disable-line
    };
  }

  /**
   * Extract the selected areas from the provided canvas data
   * and send them over WebSocket to luminave.
   *
   * @param{Uint8ClampedArray} data - Raw pixel data from canvas
   */
  drawFrame(data) {
    // Data from canvas
    this.data = data;

    // Get the average color of the whole output
    const average = this.getAverage(0, 0, this.width, this.height);

    // Get the average colors for each area based on selectionX + selectionY
    const colors = this.getAverageColors();

    // Create the message for luminave
    const dmxData = {
      _type: 'modV',

      // Average color of all colors
      average,

      // Specific colors grabbed from canvas
      colors,
    };

    // Connection is established
    if (this.connection.readyState === 1) {
      // Send JSON message to luminave
      this.connection.send(JSON.stringify(dmxData));
    }
  }

  /**
   * Get the color a the specified coordinates x and y
   * from the data Uint8ClampedArray.
   *
   * @param{number} x - The x position of the color
   * @param{number} y - The y position of the color
   *
   * @return{number[]} red, green, blue at the specified position
   */
  getColor(x, y) {
    const start = y * (this.width * 4) + x * 4; //eslint-disable-line

    // [red, green, blue]
    return [this.data[start], this.data[start + 1], this.data[start + 2]];
  }

  /**
   * Get the average color of the specified "area"
   *
   * @param{number} x - The x position of the area (top)
   * @param{number} y - The y position of the area (left)
   * @param{number} width - The width of the area
   * @param{number} height - The height of the area
   *
   * @return{number[]} red, green, blue for the area
   */
  getAverage(x, y, width, height) {
    const average = new Array(3).fill(0);
    let color = new Array(3).fill(0);
    const size = width * height;

    for (let row = 0; row < width; row++) { //eslint-disable-line
      // For every column pixels
      for (let column = 0; column < height; column++) { //eslint-disable-line
        color = this.getColor(x + row, y + column);

        // Summarize the colors
        average[0] += color[0];
        average[1] += color[1];
        average[2] += color[2];
      }
    }

    // Calculate the average value
    average[0] = ~~(average[0] / size); //eslint-disable-line
    average[1] = ~~(average[1] / size); //eslint-disable-line
    average[2] = ~~(average[2] / size); //eslint-disable-line

    return average;
  }

  /**
   * Get the average colors for all areas.
   *
   * @return{number[]} red, green, blue, red, green, blue...
   */
  getAverageColors() {
    // Amount of areas
    const areaAmount = this.selectionX * this.selectionY;

    // Size of each area
    const areaSize = (this.width / areaAmount) + (this.height / areaAmount);

    // The packet that gets send over WebSocket to luminave
    const colors = [];

    // selectionX = how many areas we grab on the x axis
    for (let x = 0; x < this.selectionX; x++) { //eslint-disable-line

      // selectionY = how many areas we grab on the y axis
      for (let y = 0; y < this.selectionY; y++) { //eslint-disable-line

        // Coordinates of the area
        const pointX = (x * Math.floor(this.width / this.selectionX));
        const pointY = (y * Math.floor(this.height / this.selectionY));

        // Add the average color of the area to the colors
        colors.push(...this.getAverage(pointX, pointY, areaSize / 2, areaSize / 2));
      }
    }

    return colors;
  }

}
