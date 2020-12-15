let store;

const clockHistory = [];
const diffHistory = [];
let nextBpmUpdate = 0;
const TYPE_NOTEON = 144;
const TYPE_CC = 176;

// create a new audioContext to use intead of modV's
// existing context - we get timing jitters otherwise
const audioContext = new window.AudioContext({
  latencyHint: "playback"
});

// hack around chrome's autoplay policy
function resume() {
  audioContext.resume();
  window.removeEventListener("click", resume);
}

window.addEventListener("click", resume);

function handleInput(message) {
  const {
    data: [type, channel, data],
    currentTarget: { id, name, manufacturer }
  } = message;

  const device = store.state.midi.devices[`${id}-${name}-${manufacturer}`];

  if (!device) {
    return;
  }

  const { listenForClock, listenForInput, ccAsNoteOn } = device;

  // clock
  if (type === 248 && listenForClock) {
    const currentTime = audioContext.currentTime * 1000;
    clockHistory.push(currentTime);

    if (clockHistory.length > 1) {
      const then = clockHistory[0];
      const now = clockHistory[1];

      const difference = now - then;

      clockHistory.splice(0, 1);

      diffHistory.push(difference);

      // try to compensate for tempo change
      if (diffHistory.length > 1) {
        // get the different before the one we just pushed
        const lastDifference = diffHistory[diffHistory.length - 2];
        const checkDifference = difference - lastDifference;
        if (checkDifference > 50) {
          console.warn(
            "MIDI: resetting clock detection as difference was too big",
            checkDifference
          );
          diffHistory.splice(0, diffHistory.length);
          clockHistory.splice(0, clockHistory.length);
          return;
        }
      }

      if (diffHistory.length > 94) {
        diffHistory.splice(0, 1);
      }

      if (currentTime > nextBpmUpdate) {
        nextBpmUpdate = currentTime + 500;

        const averageDiff =
          diffHistory.reduce((a, b) => a + b) / diffHistory.length;

        const bpm = Math.round((1000 / averageDiff / 24) * 60);
        store.dispatch("beats/setBpm", { bpm, source: "midi" });
      }
    }
  } else if (listenForInput) {
    let commitValue = true;
    let _data = data;
    let _type = type;

    // Overwrite the default behavior for ControlChange messages
    if (_type === TYPE_CC && ccAsNoteOn) {
      _type = TYPE_NOTEON;
    }

    if (_type === TYPE_NOTEON) {
      // We want to know when the button was pressed
      if (data > 0) {
        if (device.channelData !== undefined && device.channelData[channel]) {
          _data = device.channelData[channel][_type] === 1 ? 0 : 1;
        } else {
          _data = 1;
        }
        // Don't commit the value as this is "NoteOff"
      } else {
        commitValue = false;
      }
    }

    if (_type === TYPE_CC) {
      _data = _data / 127;
    }

    if (commitValue) {
      store.commit("midi/WRITE_DATA", {
        id: `${id}-${name}-${manufacturer}`,
        type: _type,
        channel,
        data: _data
      });
    }

    if (store.state.midi.learning) {
      // Make sure to use the overwritten type
      message.data[0] = _type;

      store.state.midi.learning(message);
    }
  }
}

function handleDevices(inputs) {
  // loop over all available inputs and listen for any MIDI input
  for(let input of inputs.values()) { // eslint-disable-line
    // each time there is a midi message call the onMIDIMessage function
    input.removeEventListener("midimessage", handleInput);
    input.addEventListener("midimessage", handleInput);

    store.commit("midi/ADD_DEVICE", {
      id: input.id,
      name: input.name,
      manufacturer: input.manufacturer
    });
  }
}

async function setupMidi() {
  store = this.store;

  if (navigator.requestMIDIAccess) {
    const access = await navigator.requestMIDIAccess({ sysex: false });

    handleDevices.bind(this)(access.inputs);

    access.addEventListener("statechange", e => {
      handleDevices(e.currentTarget.inputs);
    });
  } else {
    console.warn("MIDI access was unavailable in your browser.");
  }
}

export default setupMidi;
