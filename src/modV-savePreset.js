modV.prototype.savePreset = function(name, profile) {
		
		let preset = this.generatePreset(name);
		
		this.presets[name] = preset;
		localStorage.setItem('presets', JSON.stringify(this.presets));
		console.info('Wrote preset with name:', name, 'in profile', profile, preset);

		if(this.mediaManagerAvailable) {
			this.mediaManager.send(JSON.stringify({
				request: 'save-preset',
				profile: profile,
				payload: preset,
				name: name
			}));
		}
	};