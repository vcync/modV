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

		let data, type, profile,name;

		if('type' in parsed) {
			switch(parsed.type) {
				case 'update':
					modV.profiles = parsed.payload;
				break;

				case 'file-update-add':
					data = parsed.data;
					type = data.type;
					profile = data.profile;
					name = data.name;

					if(type === 'palette') {
						modV.profiles[profile].palettes[name] = data.contents;
					} else if(type === 'preset') {
						modV.profiles[profile].presets[name] = data.contents;
					} else if(type === 'image') {
						modV.profiles[profile].images[name] = data.path;
					} else if(type === 'video') {
						modV.profiles[profile].videos[name] = data.path;
					}

				break;

				case 'file-update-delete':
					data = parsed.data;
					type = data.type;
					profile = data.profile;
					name = data.name;

					if(type === 'palette') {
						delete modV.profiles[profile].palettes[name];
					} else if(type === 'preset') {
						delete modV.profiles[profile].presets[name];
					} else if(type === 'image') {
						delete modV.profiles[profile].images[name];
					} else if(type === 'video') {
						delete modV.profiles[profile].videos[name];
					}

				break;
			}

			modV.mediaSelectors.forEach(function(ms) {
				ms.update(modV.profiles);
			});

			modV.profileSelectors.forEach(function(ps) {
				ps.update(modV.profiles);
			});

			let presetSelectNode = document.querySelector('#loadPresetSelect');
			if(!presetSelectNode) return;

			presetSelectNode.innerHTML = '';

			let options = [];

			forIn(modV.profiles, (profileName, profile) => {
				forIn(profile.presets, (presetName, preset) => {
					if(presetSelectNode) {
						var optionNode = document.createElement('option');
						optionNode.value = presetName;
						optionNode.textContent = presetName;

						options.push(optionNode);
					}

					modV.presets[presetName] = preset;
				});
			});

			options.sort((a, b) => {
				return a.textContent.localeCompare(b.textContent);
			});

			options.forEach(node => {
				presetSelectNode.appendChild(node);
			});
		}
	});
};