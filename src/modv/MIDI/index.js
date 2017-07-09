import EventEmitter2 from 'eventemitter2';

class MIDIAssigner extends EventEmitter2 {
  constructor(settings) {
    super();

    this.access = null;
    this.inputs = null;
    this.assignments = new Map();
    this.learning = false;
    this.toLearn = '';

    this.get = (key) => {
      this.assignments.get(key);
    };

    if(settings.get) this.get = settings.get;

    this.set = (key, value) => {
      this.assignments.set(key, value);
    };

    if(settings.set) this.set = settings.set;
  }

  start() {
    // request MIDI access
    if(navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({
        sysex: false
      }).then((access) => {
        this.access = access;
        this.inputs = access.inputs;

        this.handleDevices(access.inputs);

        access.addEventListener('statechange', (e) => {
          console.log(e);
          this.handleDevices(e.currentTarget.inputs);
        });
      }, (error) => {
        console.error('MIDI access was refused. Please check your MIDI permissions', error);
      });
    } else {
      console.error('No MIDI support in your browser.');
    }
  }

  handleDevices(inputs) {
    // loop over all available inputs and listen for any MIDI input
    for(let input of inputs.values()) { // eslint-disable-line
      // each time there is a midi message call the onMIDIMessage function
      input.addEventListener('midimessage', this.handleInput.bind(this));
    }
  }

  handleInput(message) {
    const data = message.data;
    const midiChannel = parseInt(data[1], 10);

    if(this.learning) {
      this.set(midiChannel, { variable: this.toLearn, value: null });
      this.learning = false;
      this.toLearn = '';
    }

    const assignment = this.get(midiChannel);
    if(assignment) this.emit('midiAssignmentInput', midiChannel, assignment, message);
  }

  learn(variableName) {
    this.learning = true;
    this.toLearn = variableName;
  }
}

export default MIDIAssigner;

// const m = new MIDI({
//   // You can override the built-in getters and setters with your own functions to store assignments
//   get(key) {
//     console.log(`Search for ${key}`);
//     return { variable: 'overridden', value: null };
//   },
//   set(key, value) {
//     console.log(`Set ${key} with ${value}`);
//   }
// });
// m.start();

// m.learn('foo');