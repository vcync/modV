/* eslint-env worker */

import LuminaveConnector from './luminave-connector';

// Connect to the luminave-modV integration
// @see https://github.com/NERDDISCO/luminave#integrations
const luminaveConnector = new LuminaveConnector('ws://localhost:3000/modV');

/**
 * When the worker receives a message, it triggers different functions
 */
onmessage = (e) => {
  const message = e.data;

  switch (message.type) {
    // Update the settings of LuminaveConnector
    default: {
      break;
    }

    case 'setup': {
      const { width, height, selectionX, selectionY } = message.payload;

      luminaveConnector.width = width;
      luminaveConnector.height = height;
      luminaveConnector.selectionX = selectionX;
      luminaveConnector.selectionY = selectionY;

      break;
    }

    // Send the raw pixel data from the modV output canvas to LuminaveConnector
    case 'data': {
      luminaveConnector.drawFrame(message.payload);
      break;
    }
  }
};
