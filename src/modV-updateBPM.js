module.exports = function(modV) {

	modV.prototype.updateBPM = function(bpm) {
		this.bpm = Math.round(bpm);
		document.getElementById('BPMDisplayGlobal').textContent = this.bpm;
	};
};