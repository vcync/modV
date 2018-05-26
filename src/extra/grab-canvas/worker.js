/* eslint-env worker */

import LuminaveConnector from './luminave-connector';

// Connect to the luminave-modV integration
// @see https://github.com/NERDDISCO/luminave#integrations
const luminaveConnector = new LuminaveConnector('ws://localhost:3000/modV');

onmessage = (e) => {
  const message = e.data;

  switch (message.type) {
    case 'setup': {
      const { width, height, selectionX, selectionY } = message.payload;

      luminaveConnector.width = width;
      luminaveConnector.height = height;
      luminaveConnector.selectionX = selectionX;
      luminaveConnector.selectionY = selectionY;

      break;
    }

    case 'data': {
      luminaveConnector.drawFrame(message.payload);
      break;
    }

    default:
  }
};
