class SweetCandy { // jshint ignore:line

	constructor(WebSocketAddress) {
		this.setupSocket(WebSocketAddress);

		this.pixelLocationsRed = [];
		this.pixelLocationsGreen = [];
		this.pixelLocationsBlue = [];
		this.ledXpoints = [];
		this.ledYpoints = [];

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
		this.pixelLocationsRed = [];
		this.pixelLocationsGreen = [];
		this.pixelLocationsBlue = [];
		this.ledXpoints = [];
		this.ledYpoints = [];
	}
	
	// Set the location of a single LED
	LED(index, x, y, width) {

		if(this.pixelLocationsRed === null) {

			this.pixelLocationsRed.length 	= index + 1;
			this.pixelLocationsGreen.length = index + 1;
			this.pixelLocationsBlue.length 	= index + 1;
			this.ledXpoints.length = index + 1;
			this.ledYpoints.length = index + 1;

		} else if (index >= this.pixelLocationsRed.length) {

			this.pixelLocationsRed.length 	= index + 1;
			this.pixelLocationsGreen.length = index + 1;
			this.pixelLocationsBlue.length 	= index + 1;
			this.ledXpoints.length = index + 1;
			this.ledYpoints.length = index + 1;

		}

		//Store pixel[] map to color arrays.
		let dPR = this.devicePixelRatio || window.devicePixelRatio;
		let idx = dPR * dPR * 4 * y * width + x * dPR * 4;

		this.pixelLocationsRed[index] 	= (idx);
		this.pixelLocationsGreen[index] = (idx + 1);
		this.pixelLocationsBlue[index] 	= (idx + 2);

		//Store x,y to draw points for pixel locations 
		this.ledXpoints[index] = x;
		this.ledYpoints[index] = y;

	}

	// Set the location of several LEDs arranged in a strip.
	// Angle is in radians, measured clockwise from +X.
	// (x,y) is the center of the strip.
	// width is the width of the Canvas
	LEDStrip(index, count, x, y, spacing, angle, reversed, width) {
		let s = Math.sin(angle);
		let c = Math.cos(angle);
		for (let i = 0; i < count; i++) {

			this.LED(
				reversed ? (index + count - 1 - i) * 1 : (index + i) * 1,
				//floor() These must be integers.  round() causes lag
				Math.floor((x + (i - (count - 1) / 2.0) * spacing * c + 0.5) * 1),
				Math.floor((y + (i - (count - 1) / 2.0) * spacing * s + 0.5) * 1),
				width
			);
		}
	}

	// Set the locations of a ring of LEDs. The center of the ring is at (x, y),
	// with "radius" pixels between the center and each LED. The first LED is at
	// the indicated angle, in radians, measured clockwise from +X.
	// width is the width of the Canvas
	LEDRing(index, count, x, y, radius, angle, width) {
		for (let i = 0; i < count; i++) {
			let a = angle + i * 2 * Math.PI / count;
			this.LED(
				index + i,
				Math.floor((x - radius * Math.cos(a) + 0.5)),
				Math.floor((y - radius * Math.sin(a) + 0.5)),
				width
			);
		}
	}

	// Set the location of several LEDs arranged in a grid. The first strip is
	// at 'angle', measured in radians clockwise from +X.
	// (x,y) is the center of the grid.
	// width is the width of the Canvas
	LEDGrid(index, stripLength, numStrips, x, y, ledSpacing, stripSpacing, angle, zigzag, width) {
		let s = Math.sin(angle + Math.PI/2);
		let c = Math.cos(angle + Math.PI/2);
		for (let i = 0; i < numStrips; i++) {
			this.LEDStrip(
				index + stripLength * i,
				stripLength,
				x + (i - (numStrips - 1) / 2.0) * stripSpacing * c,
				y + (i - (numStrips - 1) / 2.0) * stripSpacing * s,
				ledSpacing,
				angle,
				zigzag && (i % 2) === 1,
				width
			);
		}
	}

	// Set the location of 64 LEDs arranged in a uniform 8x8 grid.
	// (x,y) is the center of the grid.
	// width is the width of the Canvas
	LEDGrid8x8(index, x, y, spacing, angle, zigzag, width) {
		this.LEDGrid(index, 8, 8, x, y, spacing, spacing, angle, zigzag, width);
	}

	drawFrame(canvas, ctx, pixelBuffer, drawPixels) {

		//console.log(pixelBuffer);

		if (this.pixelLocationsRed === null) {
			// No pixels defined yet
			console.warn('SweetCandy: drawFrame: No pixels defined');
			return;
		}

		let leds = this.pixelLocationsRed.length;
		let packet = new Uint8ClampedArray((leds * 3)+4);
		//let packet = new Array(4 + leds * 3);

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

		// Dest position in our packet. Start right after the header.
		let dest = 4;
		//loadPixels();

		// Sample and send the center pixel of each LED
		for (let led = 0; led < leds; led++) {
			let i = led;

			let rLoc = Math.floor(this.pixelLocationsRed[i]);
			let gLoc = Math.floor(this.pixelLocationsGreen[i]);
			let bLoc = Math.floor(this.pixelLocationsBlue[i]);

			packet[dest++] = pixelBuffer[rLoc];
			packet[dest++] = pixelBuffer[gLoc];
			packet[dest++] = pixelBuffer[bLoc];
		}

		console.log(packet);
		this.socket.send(packet.buffer);

		//draw pixel locations on screen if enabled
		if (drawPixels === true) {
			ctx.save();
			ctx.fillStyle = 'white';
			for (let i = 0; i < leds; i++) {
				//stroke(127);
				//offset x+1 and y+1 so we don't send the dots to the fc Server
				//point(this.ledXpoints[i]+1, ledYpoints[i]+1);
				ctx.fillRect(1, 1, this.ledXpoints[i]+1, this.ledYpoints[i]+1);
			}
			ctx.restore();
		}

	}

}