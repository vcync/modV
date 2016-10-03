modV.prototype.savePreset = function(name, profile) {
		var preset = {
			layers: [],
			moduleData: {},
			presetInfo: {
				datetime: Date.now(),
				modVVersion: this.version,
				author: this.options.user
			}
		};
		
		function extractValues(Control, Module, key) {
			preset.moduleData[key].values[Control.variable] = Module[Control.variable];
		}

		this.layers.forEach(Layer => {
			let layerDetails = {
				clearing: Layer.clearing,
				alpha: Layer.alpha,
				enabled: Layer.enabled,
				inherit: Layer.inherit,
				pipeline: Layer.pipeline,
				blending: Layer.blending,
				name: Layer.name,
				moduleOrder: Layer.moduleOrder
			};

			preset.layers.push(layerDetails);
		});

		forIn(this.activeModules, (key, Module) => {
			
			preset.moduleData[key] = {};
			preset.moduleData[key].disabled = Module.info.disabled;
			preset.moduleData[key].blend = Module.info.blend || 'normal';
			preset.moduleData[key].name = Module.info.name;
			preset.moduleData[key].clone = false;
			preset.moduleData[key].originalName = Module.info.originalName;
			preset.moduleData[key].safeName = Module.info.safeName;
			preset.moduleData[key].originalModuleName = Module.info.originalModuleName;
			preset.moduleData[key].solo = Module.info.solo;

			if('originalName' in Module.info) {
				preset.moduleData[key].clone = true;
			}

			preset.moduleData[key].values = {};
			Module.info.controls.forEach((Control) => {
				extractValues(Control, Module, key);
			});
		});
		
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