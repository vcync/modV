(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.factoryReset = function() {
		for(var mod in modV.registeredMods) {
			var m = modV.registeredMods[mod];
			
			m.info.disabled = true;
			m.info.blend = 'normal';

			modV.controllerWindow.postMessage({
				type: 'ui-enabled',
				modName: m.info.name,
				payload: false
			}, modV.options.controlDomain);

			// If we have a WebSocket server
			if(modV.options.remote) {
				modV.ws.send(JSON.stringify({
					type: 'ui-enabled',
					modName: m.info.name,
					payload: false,
				}));
			}

			m.defaults.forEach(function(control, idx) {
				var val = control.currValue;

				if(control.type === 'image' || control.type === 'multiimage' || control.type === 'video') return;
				
				if('append' in control) {
					val = val.replace(control.append, '');
				}

				var id = m.name + '-' + control.variable;

				modV.controllerWindow.postMessage({
					type: 'ui',
					varType: control.type,
					modName: m.info.name,
					name: control.label,
					payload: val
				}, modV.options.controlDomain);

				// If we have a WebSocket server
				if(modV.options.remote) {
					modV.ws.send(JSON.stringify({
						type: 'ui',
						varType: control.type,
						modName: m.info.name,
						name: control.variable,
						payload: val,
						index: idx
					}));
				}

				if('append' in control) {
					val = val + control.append;
				}

				modV.registeredMods[mod][control.variable] = val;

			});

		}

		// Clear the screen
		modV.context.clearRect(0, 0, modV.canvas.width, modV.canvas.height);
	};

})(module);