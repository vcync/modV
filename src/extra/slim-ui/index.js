import controlPanelComponent from './ControlPanel';

/**
 * Slim version of the UI
 */
const slimUi = {
  name: 'Slim UI',
  controlPanelComponent,

  /**
   * Only called when added to modV.
   */
  install() {
    this.activate();
  },

  on() {
    this.activate();
  },

  off() {
    this.deactivate();
  },

  activate() {
    document.body.classList.add('slimui');
  },

  deactivate() {
    document.body.classList.remove('slimui');
  },
};

export default slimUi;
