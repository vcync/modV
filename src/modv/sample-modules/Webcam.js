import { Module2D } from '../Modules';

class Webcam extends Module2D {
  constructor() {
    super({
      info: {
        name: 'Webcam',
        author: '2xAA',
        version: 0.1,
      },
    });
  }

  draw({ canvas, context, video }) { //eslint-disable-line
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
}

export default Webcam;
