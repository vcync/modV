import Vue from '@/main';

function generateMidiAssigner(settings) {
  const MIDIAssigner = {
    access: null,
    inputs: null,
    assignments: new Map(),
    learning: false,
    toLearn: '',
    snack: null,

    get(key) {
      this.assignments.get(key);
    },

    set(key, value) {
      this.assignments.set(key, value);
    },

    start() {
      // request MIDI access
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
          sysex: false,
        }).then((access) => {
          this.access = access;
          this.inputs = access.inputs;

          this.handleDevices(access.inputs);

          access.addEventListener('statechange', (e) => {
            this.handleDevices(e.currentTarget.inputs);
          });
        }).catch(() => {
          Vue.$dialog.alert({
            title: 'MIDI Access Refused',
            message: 'MIDI access was refused. Please check your MIDI permissions for modV and refresh the page',
            type: 'is-danger',
            hasIcon: true,
            icon: 'times-circle',
            iconPack: 'fa',
          });
        });
      } else {
        Vue.$dialog.alert({
          title: 'Outdated Browser',
          message: 'Unfortunately your browser does not support WebMIDI, please update to the latest Google Chrome release',
          type: 'is-danger',
          hasIcon: true,
          icon: 'times-circle',
          iconPack: 'fa',
        });
      }
    },

    handleDevices(inputs) {
      // loop over all available inputs and listen for any MIDI input
      for(let input of inputs.values()) { // eslint-disable-line
        // each time there is a midi message call the onMIDIMessage function
        input.removeEventListener('midimessage', this.handleInput.bind(this));
        input.addEventListener('midimessage', this.handleInput.bind(this));
      }
    },

    handleInput(message) {
      const { data, currentTarget: { id } } = message;
      const midiChannel = parseInt(data[1], 10);

      if (this.learning) {
        this.set(midiChannel, { deviceId: id, variable: this.toLearn, value: null });
        Vue.$toast.open({
          message: `Learned MIDI control for ${this.toLearn.replace(',', '.')}`,
          type: 'is-success',
        });
        this.learning = false;
        this.toLearn = '';
        if (this.snack) this.snack.close();
        this.snack = null;
      }

      const assignment = this.get(midiChannel);
      if (assignment && this.messageCallback && assignment.deviceId === id) {
        this.messageCallback({
          midiChannel,
          assignment,
          message,
        });
      }
    },

    learn(variableName) {
      this.learning = true;
      this.toLearn = variableName;

      this.snack = Vue.$snackbar.open({
        duration: 1000 * 60 * 60,
        message: `Waiting for MIDI input to learn ${variableName.replace(',', '.')}`,
        type: 'is-primary',
        position: 'is-bottom-right',
        actionText: 'Cancel',
        onAction: () => {
          this.learning = false;
          Vue.$toast.open({
            message: `MIDI learning cancelled for ${variableName.replace(',', '.')}`,
            type: 'is-info',
          });
        },
      });
    },
  };

  if (settings.get) MIDIAssigner.get = settings.get;
  if (settings.set) MIDIAssigner.set = settings.set;
  if (settings.callback) MIDIAssigner.messageCallback = settings.callback;

  return MIDIAssigner;
}

export default generateMidiAssigner;
