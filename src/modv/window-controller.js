import store from '@/../store';

function WindowController() {
  /**
   * Set up document, style, canvas and resize event in this.window
   * @param  {Function} callback - Function to call at the end of the configuration
   * @return {undefined}
   */
  let windowRef;

  this.configureWindow = (callback) => {
    windowRef = this.window;
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

    this.resize = () => {
      this.canvas.width = windowRef.innerWidth;
      this.canvas.height = windowRef.innerHeight;
      this.canvas.style.width = `${windowRef.innerWidth}px`;
      this.canvas.style.height = `${windowRef.innerHeight}px`;
      this.resizeCb(this, windowRef.devicePixelRatio);
    };

    windowRef.addEventListener('resize', this.resize);
    windowRef.addEventListener('beforeunload', () => 'You sure about that, you drunken mess?');
    windowRef.addEventListener('unload', () => {
      store.dispatch('windows/destroyWindow', { windowRef: this.window });
    });

    if(callback) callback(this);
  };

  this.resizeCb = function resizeCb() {

  };

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

export default WindowController;