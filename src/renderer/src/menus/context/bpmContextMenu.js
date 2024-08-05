import store from "../../application/worker/store";

export const BPMContextMenu = () => {
  const currentSource = store.state.beats.bpmSource;

  return store.state.beats.bpmSources.map((source) => ({
    label: source,
    checked: source === currentSource,
    type: "radio",
    click() {
      store.commit("beats/SET_BPM_SOURCE", { source });
    },
  }));
};
