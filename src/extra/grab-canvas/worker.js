/* eslint-env worker */

import LuminaveConnector from './luminave-connector'

// Connect to the luminave-modV integration
// @see https://github.com/NERDDISCO/luminave#integrations
const luminaveConnector = new LuminaveConnector()

/**
 * When the worker receives a message, it triggers different functions
 */
onmessage = e => {
  const message = e.data

  switch (message.type) {
    // Update the settings of LuminaveConnector
    default: {
      break
    }

    case 'setupCanvas': {
      const { width, height, selectionX, selectionY } = message.payload

      luminaveConnector.width = width
      luminaveConnector.height = height
      luminaveConnector.selectionX = selectionX
      luminaveConnector.selectionY = selectionY
      break
    }

    // Create a WebSocket onnection
    case 'setupConnection': {
      const { url, active } = message.payload

      luminaveConnector.url = url

      // The plugin is active
      if (active) {
        // Stop an old reconnect
        luminaveConnector.stopReconnect()
        // Allow reconnects
        luminaveConnector.startReconnect()
        // Create the connection
        luminaveConnector.setupSocket()
      } else {
        // Stop an old reconnect because the plugin is not active
        luminaveConnector.stopReconnect()
      }

      break
    }

    // Start a connection that will also reconnect
    case 'startConnection': {
      luminaveConnector.startReconnect()
      luminaveConnector.setupSocket()
      break
    }

    // Stop a connection and don't allow reconnect
    case 'closeConnection': {
      luminaveConnector.stopReconnect()
      luminaveConnector.closeConnection()
      break
    }

    // Send the raw pixel data from the modV output canvas to LuminaveConnector
    case 'data': {
      luminaveConnector.drawFrame(message.payload)
      break
    }
  }
}
