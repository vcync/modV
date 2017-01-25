module.exports = function(modV) {

	/* Setup remote control */
	modV.prototype.remoteSuccess = false;
	modV.prototype.uuid = undefined;
	
	modV.prototype.remoteConnect = function() {
		//if(!this.options.remote.use) return false;

		this.remote = {};

		if(this.options.remote.use) {
			let remote = new WebSocket(this.options.remote.address || 'ws://localhost:3133');

			remote.sendJSON = function(data) {
				this.send(JSON.stringify(data));
			};

			remote.onError = function(e) {
				console.error(e);
			};

			remote.onmessage = e => {
				var data = JSON.parse(e.data);
				console.log('Remote sent', data);
						
				if(!('type' in data)) return false;
						
				switch(data.type) {
					case 'hello':
						remote.sendJSON({
							type: 'declare',
							payload: {
								type: 'client'
							}
						});

						this.remote.sendCurrent();

						break;
				}
			};

			this.remote.socket = remote;
		}

		this.remote.sendCurrent = () => {

			let payload = this.generatePreset(Date.now());
			delete payload.presetInfo;

			payload.registeredModules = [];

			forIn(this.registeredMods, (key, Module) => {
				let controls = [];
				let type = 'unknown';
				if(Module instanceof this.Module2D) 	type = 'Module2D';
				if(Module instanceof this.Module3D)		type = 'Module3D';
				if(Module instanceof this.ModuleShader) type = 'ModuleShader';
				if(Module instanceof this.ModuleScript) type = 'ModuleScript';

				Module.info.controls.forEach(Control => {
					let type = 'unknown';

					if(Control instanceof this.RangeControl) 	type = 'range';
					if(Control instanceof this.CheckboxControl) type = 'checkbox';
					if(Control instanceof this.SelectControl) 	type = 'select';
					if(Control instanceof this.TextControl) 	type = 'text';
					if(Control instanceof this.ColorControl) 	type = 'color';
					if(Control instanceof this.PaletteControl) 	type = 'palette';
					if(Control instanceof this.ImageControl) 	type = 'image';
					if(Control instanceof this.VideoControl) 	type = 'video';
					if(Control instanceof this.CustomControl) 	type = 'custom';

					controls.push({
						type: type,
						settings: Control.getSettings()
					});
				});

				payload.registeredModules.push({
					name: Module.info.name,
					type: type,
					controls: controls
				});
			});

			this.remote.socket.sendJSON({
				type: 'current',
				payload: payload
			});
		};

		this.remote.update = (type, data) => {
			if(!this.options.remote.use) return false;

			try {
				this.remote.socket.sendJSON({
					type: 'update.' + type,
					payload: data
				});
			} catch(e) {
				console.log(e);
			}
		};

	};
};