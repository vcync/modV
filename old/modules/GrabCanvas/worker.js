importScripts('./nerdV.js'); // jshint ignore:line

let nerdVI = new nerdV( // jshint ignore:line
	'ws://192.168.0.102:1337', // LED
	'ws://localhost:1337' // DMX
);

let LEDWidth = 8;
let LEDHeight = 30;

onmessage = function(e) { //jshint ignore:line
    let message = e.data;

	switch(message.type) {

		case 'setup':
			let width = message.payload.width;
			let height = message.payload.height;

            let DPR = message.payload.devicePixelRatio;
            nerdVI.devicePixelRatio = DPR;
            nerdVI.reset();
            nerdVI.setDimensions(width, height);

			for (var x = 0; x < LEDWidth; x++) {
				for (var y = LEDHeight; y > 0; y--) {
					var pointX = (x * Math.floor(width/LEDWidth)) + Math.floor((width/LEDWidth) / 2);
					var pointY = (y * Math.floor(height/LEDHeight));

					nerdVI.addLED(new LED(pointX, pointY)); //jshint ignore:line
				}
			}

		break;

        case 'data':
            process(message.payload);
        break;

        case 'fog':
        	nerdVI.setFog(message.payload);
        break;
	}
};

function process(pixels) {
    // Convert Uint8Array to Array
    //let pixelsArray = Array.from(pixels);
    nerdVI.drawFrame(null, null, pixels);
}