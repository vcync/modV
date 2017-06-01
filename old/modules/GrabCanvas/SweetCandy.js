class LED { // jshint ignore:line

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

}

class SweetCandy { // jshint ignore:line

	constructor(WebSocketAddress) {
		this.setupSocket(WebSocketAddress);

		this.reset();
		this.devicePixelRatio = 1;
	}

	setupSocket(wsa) {
		this.socket = new WebSocket(wsa);
		this.socket.onerror = error => {
			console.error('SweetCandy: WebSocket: Error:', error);
		};
		this.socket.onopen = () => {
			console.info('SweetCandy: WebSocket: Opened');
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

	drawFrame(canvas, ctx, pixelBuffer) {

		//console.log(pixelBuffer);

		// if (this.pixelLocationsRed === null) {
		// 	// No pixels defined yet
		// 	console.warn('SweetCandy: drawFrame: No pixels defined');
		// 	return;
		// }

		// Dest position in our packet. Start right after the header.
		let dest = 4;

		let packet = new Uint8ClampedArray(dest + this.LEDs.length * 3);

		if (this.socket.readyState !== 1 /* OPEN */ ) {
			// The server connection isn't open. Nothing to do.
			console.warn('SweetCandy: drawFrame: Unable to send frame - no WebSocket connection');
			return;
		}

		if (this.socket.bufferedAmount > packet.length) {
			// The network is lagging, and we still haven't sent the previous frame.
			// Don't flood the network, it will just make us laggy.
			// If fcserver is running on the same computer, it should always be able
			// to keep up with the frames we send, so we shouldn't reach this point.
			console.warn('SweetCandy: drawFrame: Unable to send frame - network lag?');
			return;
		}

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

		this.socket.send(packet.buffer);
	}

}