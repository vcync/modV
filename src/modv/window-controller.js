import store from '@/../store';
import EventEmitter2 from 'eventemitter2';
import { modV, draw } from '@/modv';
import uuidv4 from 'uuid/v4';

class WindowController extends EventEmitter2 {
  constructor(Vue) {
    super();

    this.id = uuidv4();

    return new Promise((resolve) => {
      if (window.nw) {
        if (window.nw.open) {
          window.nw.Window.open('output.html', (newWindow) => {
            this.window = newWindow.window;
            if (this.window.document.readyState === 'complete') {
              this.configureWindow(resolve);
            } else {
              this.window.onload = () => {
                this.configureWindow(resolve);
              };
            }
          });
        } else {
          this.window = window.open(
            '',
            '_blank',
            'width=250, height=250, location=no, menubar=no, left=0',
          );

          if (this.window === null || typeof this.window === 'undefined') {
            Vue.$dialog.alert({
              title: 'Could not create Output Window',
              message: 'modV couldn\'t open an Output Window. Please check you\'ve allowed pop-ups - then reload',
              type: 'is-danger',
              hasIcon: true,
              icon: 'times-circle',
              iconPack: 'fa',
            });
            return;
          }

          if (this.window.document.readyState === 'complete') {
            this.configureWindow(resolve);
          } else {
            this.window.onload = () => {
              this.configureWindow(resolve);
            };
          }
        }
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

    this.canvas.style.top = '50%';
    this.canvas.style.bottom = 0;
    this.canvas.style.left = '50%';
    this.canvas.style.right = 0;
    this.canvas.style.transform = 'translate(-50%, -50%)';
    this.canvas.style.backgroundColor = 'transparent';

    this.canvas.addEventListener('dblclick', () => {
      if (!this.canvas.ownerDocument.webkitFullscreenElement) {
        this.canvas.webkitRequestFullscreen();
      } else {
        this.canvas.ownerDocument.webkitExitFullscreen();
      }
    });

    let mouseTimer;

    function movedMouse() {
      if (mouseTimer) mouseTimer = null;
      this.canvas.ownerDocument.body.style.cursor = 'none';
    }

    this.canvas.addEventListener('mousemove', () => {
      if (mouseTimer) clearTimeout(mouseTimer);
      this.canvas.ownerDocument.body.style.cursor = 'default';
      mouseTimer = setTimeout(movedMouse.bind(this), 200);
    });

    this.window.document.body.appendChild(this.canvas);

    const resizeQueue = [];
    let lastLength = 0;
    // Roughly attach to the main RAF loop for smoother resizing
    modV.on('tick', (δ) => {
      if (resizeQueue.length < 1) return;

      if (resizeQueue.length !== lastLength) {
        lastLength = resizeQueue.length;
        return;
      }

      const index = resizeQueue.length - 1;

      const width = resizeQueue[index].width;
      const height = resizeQueue[index].height;
      const dpr = resizeQueue[index].dpr;
      const emit = resizeQueue[index].emit;

      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      if (emit) this.emit('resize', width, height);

      resizeQueue.splice(0, index + 1);
      draw(δ);
    });

    this.resize = (width, height, dpr = 1, emit = true) => {
      resizeQueue.push({
        width,
        height,
        dpr,
        emit,
      });
    };

    windowRef.addEventListener('resize', () => {
      let dpr = windowRef.devicePixelRatio;

      if (!store.getters['user/useRetina']) {
        dpr = 1;
      }

      this.resize(windowRef.innerWidth, windowRef.innerHeight, dpr);
    });
    windowRef.addEventListener('beforeunload', () => 'You sure about that, you drunken mess?');
    windowRef.addEventListener('unload', () => {
      store.dispatch('windows/destroyWindow', { windowRef: this.window });
    });

    if (callback) callback(this);
  }
}

export default WindowController;
