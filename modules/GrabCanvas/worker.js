//let socket = new WebSocket("ws://192.168.178.141:1337/NERDDISCO-NerdV");
//let socket = new WebSocket("ws://192.168.178.141:1337");

importScripts('./SweetCandy.js'); // jshint ignore:line
let Candy = new SweetCandy('ws://192.168.0.9:7890'); // jshint ignore:line

onmessage = function(e) { //jshint ignore:line
    let message = e.data;

	switch(message.type) {

		case 'setup':
			let width = message.payload.width;
			let height = message.payload.height;
			let halfWidth = Math.floor(width/2);
			let halfHeight = Math.floor(height/2);

            let DPR = message.payload.devicePixelRatio;
            Candy.devicePixelRatio = DPR;
            Candy.reset();
            Candy.setDimensions(width, height);
			
			for (var y = 0; y < 8; y++) {
				for (var x = 0; x < 8; x++) {
					var spacing = height / 12;
					var pointX = Math.floor(halfWidth/4) + (spacing * (x - 3.5));
					var pointY = Math.floor(halfHeight/4) + (spacing * (y - 3.5));

					Candy.addLED(new LED(pointX, pointY)); //jshint ignore:line
				}
			}

		break;

        case 'data':
            process(message.payload);
        break;
	}
};

function process(pixels) {
    // Convert Uint8Array to Array
    let pixelsArray = Array.from(pixels);
    Candy.drawFrame(null, null, pixelsArray);
}

// let socket = new WebSocket("ws://localhost:3132");

// socket.onerror = function(error) {
// 	console.error(error);
// };

// socket.onopen = function() {
// 	console.info('GrabCanvas connected to NERD DISCO');
// };

// socket.onmessage = function(message) {
// 	console.log('GrabCanvas message', message);
// };

// let blockSize = 2;

// let strips = 8;
// let stripSize = 30;

// onmessage = function(e) { //jshint ignore:line
// 	let avCount = 0;
// 	let i = -4;
// 	let rgb = [0, 0, 0];

// 	let canvasWidth = e.data[0];
// 	let canvasHeight = e.data[1];
// 	let data = e.data[2];

// 	let length = data.length;

// 	while ( (i += blockSize * 4) < length ) {
// 		++avCount;
// 		rgb[0] += data[i];
// 		rgb[1] += data[i+1];
// 		rgb[2] += data[i+2];
// 	}
	
// 	// ~~ used to floor values
// 	rgb[0] = ~~(rgb[0]/avCount); //jshint ignore:line
// 	rgb[1] = ~~(rgb[1]/avCount); //jshint ignore:line
// 	rgb[2] = ~~(rgb[2]/avCount); //jshint ignore:line

// 	let DMXArray = '[';

// 	for(let i=0; i < (strips * stripSize) * 3; i+=3) {
// 			if(i !== 0) DMXArray += ',';

// 			DMXArray += rgb[0] + ',';
// 			DMXArray += rgb[1] + ',';
// 			DMXArray += rgb[2];
// 	}

// 	DMXArray += ']';