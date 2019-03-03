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
    this.url = args.url || 'ws://localhost:3000/modV'

    // Width / Height of canvas
    this.width = args.width || 0
    this.height = args.height || 0

    // Number of selected areas
    this.selectionX = args.selectionX || 1
    this.selectionY = args.selectionY || 1

    // The raw canvas data
    this.data = ''

    // WebSocket connection
    this.reconnectAfter = 4000
    this.connection = undefined
    this.timeout = 0
    this.shouldReconnect = true
  }

  /**
   * Create a WebSocket to luminave
   */
  setupSocket() {
    // Close an old connection
    this.closeConnection()

    // Create a new connection
    this.connection = new WebSocket(this.url)

    // Listen for errors (e.g. could not connect)
    this.connection.addEventListener('error', event => {
      console.error('lumiaveConnector: WebSocket: Error:', event); //eslint-disable-line

      // Reconnect is allowed
      if (this.shouldReconnect) {
        // Reconnect after a specific amount of time
        this.timeout = setTimeout(() => {
          this.setupSocket()
        }, this.reconnectAfter)
      }
    })

    // Connection is opened
    this.connection.addEventListener('open', () => {
      console.info('lumiaveConnector: WebSocket: Opened'); //eslint-disable-line
    })
  }

  /**
   * Close the WebSocket connection and stop reconnecting
   */
  closeConnection() {
    clearTimeout(this.timeout)

    if (this.connection !== undefined) {
      this.connection.close()
    }

    this.connection = undefined
  }

  /**
   * Stop reconnecting to WebSocket
   */
  stopReconnect() {
    this.shouldReconnect = false
    clearTimeout(this.timeout)
  }

  /**
   * Enable reconnecting to WebSocket
   */
  startReconnect() {
    this.shouldReconnect = true
  }

  /**
   * Send data to WebSocket if connection is established
   * @param {Object} data
   */
  send(data) {
    // Connection is established
    if (this.connection !== undefined && this.connection.readyState === 1) {
      // Send JSON message to luminave
      this.connection.send(JSON.stringify(data))
    }
  }

  /**
   * Extract the selected areas from the provided canvas data
   * and send them over WebSocket to luminave.
   *
   * @param{Uint8ClampedArray} data - Raw pixel data from canvas
   */
  drawFrame(data) {
    // Data from canvas
    this.data = new Uint8Array(data)

    // Get the average color of the whole output
    const average = this.getAverage(0, 0, this.width, this.height)

    // Get the average colors for each area based on selectionX + selectionY
    const colors = this.getAverageColors()

    const { selectionX, selectionY } = this

    // Create the message for luminave
    const dmxData = {
      _type: 'modV',

      // Average color of all colors
      average,

      // Specific colors grabbed from canvas
      colors,

      selectionX,
      selectionY
    }

    this.send(dmxData)
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
    return [this.data[start], this.data[start + 1], this.data[start + 2]]
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
    const average = new Array(3).fill(0)
    let color = new Array(3).fill(0)
    const size = width * height

    for (let row = 0; row < width; row++) { //eslint-disable-line
      // For every column pixels
      for (let column = 0; column < height; column++) { //eslint-disable-line
        color = this.getColor(x + row, y + column)

        // Summarize the colors
        average[0] += color[0]
        average[1] += color[1]
        average[2] += color[2]
      }
    }

    // Calculate the average value
    average[0] = ~~(average[0] / size); //eslint-disable-line
    average[1] = ~~(average[1] / size); //eslint-disable-line
    average[2] = ~~(average[2] / size); //eslint-disable-line

    return average
  }

  /**
   * Get the average colors for all areas.
   *
   * @return{number[]} red, green, blue, red, green, blue...
   */
  getAverageColors() {
    // Size of each area
    const areaSize = Math.floor(
      this.width / this.selectionX + this.height / this.selectionY
    )
    const areaWidth = Math.floor(areaSize / 2)
    const areaHeight = Math.floor(areaSize / 2)

    // The packet that gets send over WebSocket to luminave
    const colors = []

    // selectionX = how many areas we grab on the x axis
    for (let x = 0; x < this.selectionX; x++) { //eslint-disable-line

      // selectionY = how many areas we grab on the y axis
      for (let y = 0; y < this.selectionY; y++) { //eslint-disable-line

        // Coordinates of the area
        const pointX = x * Math.floor(this.width / this.selectionX)
        const pointY = y * Math.floor(this.height / this.selectionY)

        // Add the average color of the area to the colors
        colors.push(...this.getAverage(pointX, pointY, areaWidth, areaHeight))
      }
    }

    return colors
  }
}
