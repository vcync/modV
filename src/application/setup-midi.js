let store;

const clockHistory = [];
const diffHistory = [];
let nextBpmUpdate = 0;

// create a new audioContext to use intead of modV's
// existing context - we get timing jitters otherwise
const audioContext = new window.AudioContext({
  latencyHint: "playback"
});

function handleInput(message) {
  const {
    data: [type, channel, data],
    currentTarget: { id, name, manufacturer }
  } = message;

  const device = store.state.midi.devices[`${id}-${name}-${manufacturer}`];

  if (!device) {
    return;
  }

  const { listenForClock, listenForInput } = device;

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
    store.commit("midi/WRITE_DATA", {
      id: `${id}-${name}-${manufacturer}`,
      type,
      channel,
      data: type === 176 ? data / 127 : data
    });
  }

  if (store.state.midi.learning) {
    store.state.midi.learning(message);
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
