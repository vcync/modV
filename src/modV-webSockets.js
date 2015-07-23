(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	/* Setup remote control */
	modV.prototype.remoteSuccess = false;
	modV.prototype.uuid = undefined;
	
	modV.prototype.initSockets = function() {
		if(modV.options.remote) {
			try {
				modV.ws = new WebSocket(modV.options.remote);
				
				modV.ws.onerror = function () {
					modV.remoteSuccess = true; // Failed connection, so start anyway
		        };
			
				modV.ws.onmessage = function(e) {
					var data = JSON.parse(e.data);
					console.log('Message received:', data);
					
					if(!('type' in data)) return false;
					
					var pl = data.payload;
					
					switch(data.type) {
						
						case 'hello':
							console.log(pl.name, 'says hi. Server version number:', pl.version);
							modV.remoteSuccess = true;
							modV.uuid = pl.id;
							modV.ws.send(JSON.stringify({type: 'declare', payload: {type: 'client', id: modV.uuid}}));
							break;
							
						case 'registerCB':
							// Sorta debug only - will do something with this later on.
							console.log('Server says', pl.name, 'was registered with order number', pl.index);
							
							if(modV.registeredMods[pl.name].info.name === pl.name) {
								if(modV.registeredMods[pl.name].info.order === pl.index) {
									console.log('True!');
								} else {
									console.log('False!');
								}
							} else {
								console.log('False!');
							}
							
							break;
						
						default:
							modV.receiveMessage({data: data}, true);
					}
				};
				
				modV.ws.onclose = function() {
					console.log('Connection closed');
				};
				
				modV.ws.onopen = function() {
					console.log('Successful initial connection to', modV.options.remote);
				};
			} catch(e) {
				console.error('There was an un-identified Web Socket error', e);
			}
		}
	};

})(module);