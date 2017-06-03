import { Module2D } from '../Modules';

class Webcam extends Module2D {
  constructor() {
    super({
      info: {
        name: 'Webcam',
        author: '2xAA',
        version: 0.1
      }
    });
  }

  draw(canvas, ctx, vid) { //eslint-disable-line
    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
  }
}

export default Webcam;