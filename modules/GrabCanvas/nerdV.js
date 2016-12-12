class LED { // jshint ignore:line

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

}

class nerdV { // jshint ignore:line

	constructor(LEDSocketAddress, DMXSocketAddress) {
		this.setupSocket(LEDSocketAddress, DMXSocketAddress);

		this.reset();
		this.devicePixelRatio = 1;
		this.fog = 0;
	}

	setupSocket(lsa, dsa) {
		this.LEDsocket = new WebSocket(lsa);
		this.LEDsocket.onerror = error => {
			console.error('nerdV: LED WebSocket: Error:', error);
		};
		this.LEDsocket.onopen = () => {
			console.info('nerdV: LED WebSocket: Opened');
		};

		this.DMXsocket = new WebSocket(dsa);
		this.DMXsocket.onerror = error => {
			console.error('nerdV: DMX WebSocket: Error:', error);
		};
		this.DMXsocket.onopen = () => {
			console.info('nerdV: DMX WebSocket: Opened');
		};
	}

	reset() {
		this.LEDs = [];
	}

	addLED(LED) {
		this.LEDs.push(LED);
	}

	setDimensions(width, height) {
		this.width = width;
		this.height = height;
	}

	setFog(fogValue) {
		console.log('setFog', fogValue);
		if(fogValue) this.fog = 255;
		else this.fog = 0; 
	}

	drawFrame(canvas, ctx, pixelBuffer) {

		//console.log(pixelBuffer);

		// if (this.pixelLocationsRed === null) {
		// 	// No pixels defined yet
		// 	console.warn('nerdV: drawFrame: No pixels defined');
		// 	return;
		// }

		// Dest position in our packet. Start right after the header.
		let dest = 0;

		let packet = new Array(dest + this.LEDs.length * 3);

		// if (this.LEDsocket.readyState !== 1 /* OPEN */ ) {
		// 	// The server connection isn't open. Nothing to do.
		// 	console.warn('nerdV: drawFrame: Unable to send frame - no WebSocket connection');
		// 	return;
		// }

		// if (this.LEDsocket.bufferedAmount > packet.length) {
		// 	// The network is lagging, and we still haven't sent the previous frame.
		// 	// Don't flood the network, it will just make us laggy.
		// 	// If fcserver is running on the same computer, it should always be able
		// 	// to keep up with the frames we send, so we shouldn't reach this point.
		// 	console.warn('nerdV: drawFrame: Unable to send frame - network lag?');
		// 	return;
		// }

		// Sample and send the center pixel of each LED
		for (let led = 0; led < this.LEDs.length; led++) {

			// Calculate the source position in imageData.
			// First, we find a vector relative to the LED bounding box corner.
			// Then we need to calculate the offset into the imageData array.
			// We need to do this with integer math (|0 coerces to integer quickly).
			// Also, note that imageData uses 4 bytes per pixel instead of 3.

			let x = this.LEDs[led].x /*- this.LEDs[0].x*/;
			let y = this.LEDs[led].y /*- this.LEDs[0].y*/;

			var src = 4 * (Math.floor(x) + Math.floor(y) * this.width); //jshint ignore:line

			// Copy three bytes to our OPC packet, for Red, Green, and Blue
			packet[dest++] = pixelBuffer[src++];
			packet[dest++] = pixelBuffer[src++];
			packet[dest++] = pixelBuffer[src++];
		}

		let blockSize = 2;

		let avCount = 0;
		let i = -4;
		let rgb = [0, 0, 0];

		let data = pixelBuffer;

		let length = data.length;

		while ( (i += blockSize * 4) < length ) {
			++avCount;
			rgb[0] += data[i];
			rgb[1] += data[i+1];
			rgb[2] += data[i+2];
		}
		
		// ~~ used to floor values
		rgb[0] = ~~(rgb[0]/avCount); //jshint ignore:line
		rgb[1] = ~~(rgb[1]/avCount); //jshint ignore:line
		rgb[2] = ~~(rgb[2]/avCount); //jshint ignore:line

		let DMXArray = [
			rgb[0],
			rgb[1],
			rgb[2],
			rgb[0],
			rgb[1],
			rgb[2],
			this.fog
		];

		if(this.LEDsocket.readyState === 1) this.LEDsocket.send(JSON.stringify(packet));
		if(this.DMXsocket.readyState === 1) this.DMXsocket.send(JSON.stringify(DMXArray));
	}

}