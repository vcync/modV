(function(RJSmodule) {
	'use strict';

	/* Setup remote control */
	modV.prototype.remoteSuccess = false;
	modV.prototype.uuid = undefined;
	
	modV.prototype.initSockets = function() {
		var self = this;
		
		if(self.options.remote) {
			try {
				self.ws = new WebSocket(self.options.remote);
				
				self.ws.onerror = function () {
					self.remoteSuccess = true; // Failed connection, so start anyway
		        };
			
				self.ws.onmessage = function(e) {
					var data = JSON.parse(e.data);
					console.log('Message received:', data);
					
					if(!('type' in data)) return false;
					
					var pl = data.payload;
					
					switch(data.type) {
						
						case 'hello':
							console.log(pl.name, 'says hi. Server version number:', pl.version);
							self.remoteSuccess = true;
							self.uuid = pl.id;
							self.ws.send(JSON.stringify({type: 'declare', payload: {type: 'client', id: self.uuid}}));
							break;
							
						case 'registerCB':
							// Sorta debug only - will do something with this later on.
							console.log('Server says', pl.name, 'was registered with order number', pl.index);
							
							if(self.registeredMods[pl.name].info.name === pl.name) {
								if(self.registeredMods[pl.name].info.order === pl.index) {
									console.log('True!');
								} else {
									console.log('False!');
								}
							} else {
								console.log('False!');
							}
							
							break;
						
						default:
							self.receiveMessage({data: data}, true);
					}
				};
				
				self.ws.onclose = function() {
					console.log('Connection closed');
				};
				
				self.ws.onopen = function() {
					console.log('Successful initial connection to', self.options.remote);
				};
			} catch(e) {
				console.error('There was an un-identified Web Socket error', e);
			}
		}
	};

})(module);