import BeatDetektor from "../../lib/BeatDetektor";

export default function() {
  const beatDetektor = new BeatDetektor(85, 169);
  const beatDetektorKick = new BeatDetektor.modules.vis.BassKick();

  this.updateBeatDetektor = (delta, features) => {
    beatDetektor.process(delta / 1000.0, features.complexSpectrum.real);
    beatDetektorKick.process(beatDetektor);
    const kick = beatDetektorKick.isKick();
    const bpm = beatDetektor.win_bpm_int_lo;

    this.store.commit("beats/SET_KICK", { kick });
    if (this.store.state.beats.bpm !== bpm) {
      this.store.commit("beats/SET_BPM", { bpm });
    }
  };
}
