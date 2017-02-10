module.exports = function mediaManager(modV) {

	const ws = new WebSocket("ws://localhost:3132/");
	this.available = false;

	this.update = require('./update')(ws);
	this.sendJSON = require('./send-json')(ws);

	this.saveOption = require('./save-option');

	ws.addEventListener('error', () => {
		console.warn('Media Manager not available - did you start modV in no-manager mode?');
	});
	
	ws.addEventListener('open', () => {
		console.info('Media Manager connected, retriveing media list');
		this.update();
		this.available = true;
	});

	window.addEventListener('beforeunload', () => {
		ws.close();
	});

	ws.addEventListener('message', (m) => {
		var parsed = JSON.parse(m.data);

		console.log('Media Manager says:', parsed);

		if('type' in parsed) {
			switch(parsed.type) {
				case 'update':
					modV.profiles = parsed.payload;
					modV.mediaSelectors.forEach(function(ms) {
						ms.update(modV.profiles);
					});

					var arr = [];
					forIn(modV.profiles, profile => {
						arr.push(profile);
					});


					let presetSelectNode = document.querySelector('#loadPresetSelect');
					if(presetSelectNode) presetSelectNode.innerHTML = '';

					forIn(modV.profiles, (profileName, profile) => {
						forIn(profile.presets, (presetName, preset) => {
							if(presetSelectNode) {
								var optionNode = document.createElement('option');
								optionNode.value = presetName;
								optionNode.textContent = presetName;

								presetSelectNode.appendChild(optionNode);
							}
							
							modV.presets[presetName] = preset;
						});
					});

					modV.palettes.forEach((palette) => {
						palette.updateProfiles(modV.profiles);
					});
				break;
			}
		}
	});
};