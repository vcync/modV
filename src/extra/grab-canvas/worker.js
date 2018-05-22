/* eslint-env worker */

import { nerdV, LED } from './nerdV';

const nerdVI = new nerdV( //eslint-disable-line
  'ws://192.168.0.102:1337', // LED
  'ws://localhost:3000/modV', // DMX
);

const LEDWidth = 2;
const LEDHeight = 2;

function process(pixels) {
  // Convert Uint8Array to Array
  // let pixelsArray = Array.from(pixels);
  nerdVI.drawFrame(null, null, pixels);
}

onmessage = (e) => {
  const message = e.data;

  switch (message.type) {
    default: {
      break;
    }

    case 'setup': {
      const width = message.payload.width;
      const height = message.payload.height;

      const DPR = message.payload.devicePixelRatio;
      nerdVI.devicePixelRatio = DPR;
      nerdVI.reset();
      nerdVI.setDimensions(width, height);

      for (let x = 0; x < LEDWidth; x += 1) {
        for (let y = LEDHeight; y > 0; y -= 1) {
          const pointX = (x * Math.floor(width / LEDWidth)) + Math.floor((width / LEDWidth) / 2);
          const pointY = (y * Math.floor(height / LEDHeight));

          nerdVI.addLED(new LED(pointX, pointY)); // jshint ignore:line
        }
      }

      break;
    }

    case 'data': {
      process(message.payload);
      break;
    }

    case 'fog': {
      nerdVI.setFog(message.payload);
      break;
    }
  }
};
