import store from '@/../store';
import EventEmitter2 from 'eventemitter2';

class WindowController extends EventEmitter2 {
  constructor() {
    super();

    return new Promise((resolve) => {
      if(!window.nw) {
        this.window = window.open(
          '',
          '_blank',
          'width=250, height=250, location=no, menubar=no, left=0'
        );
        if(this.window.document.readyState === 'complete') {
          this.configureWindow(resolve);
        } else {
          this.window.onload = () => {
            this.configureWindow(resolve);
          };
        }
      } else {
        window.nw.Window.open('output.html', (newWindow) => {
          this.window = newWindow.window;
          if(this.window.document.readyState === 'complete') {
            this.configureWindow(resolve);
          } else {
            this.window.onload = () => {
              this.configureWindow(resolve);
            };
          }
        });
      }
    });
  }


  configureWindow(callback) {
    const windowRef = this.window;
    windowRef.document.title = 'modV Output';
    windowRef.document.body.style.margin = '0px';
    windowRef.document.body.style.backgroundColor = 'black';

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.style.position = 'fixed';

    this.canvas.style.top = 0;
    this.canvas.style.bottom = 0;
    this.canvas.style.left = 0;
    this.canvas.style.right = 0;

    this.window.document.body.appendChild(this.canvas);

    this.resize = (width, height, dpr = 1, emit = true) => {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      if(emit) this.emit('resize', width, height);
    };

    windowRef.addEventListener('resize', () => {
      let dpr = windowRef.devicePixelRatio;

      if(!store.getters['size/useRetina']) {
        dpr = 1;
      }

      this.resize(windowRef.innerWidth, windowRef.innerHeight, dpr);
    });
    windowRef.addEventListener('beforeunload', () => 'You sure about that, you drunken mess?');
    windowRef.addEventListener('unload', () => {
      store.dispatch('windows/destroyWindow', { windowRef: this.window });
    });

    if(callback) callback(this);
  }
}

export default WindowController;