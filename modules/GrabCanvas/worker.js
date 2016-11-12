let socket = new WebSocket("ws://192.168.178.141:1337/NERDDISCO-NerdV");

socket.onerror = function(error) {
	console.error(error);
};

socket.onopen = function() {
	console.info('GrabCanvas connected to NERD DISCO');
};

socket.onmessage = function(message) {
	console.log('GrabCanvas message', message);
};

let blockSize = 2;

onmessage = function(e) { //jshint ignore:line
	let count = 0;
	let i = -4;
	let rgb = [0, 0, 0];

	let data = e.data;
	let length = data.data.length;

	console.log(data);

	while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb[0] += data.data[i];
        rgb[1] += data.data[i+1];
        rgb[2] += data.data[i+2];
    }
    
    // ~~ used to floor values
    rgb[0] = ~~(rgb[0]/count); //jshint ignore:line
    rgb[1] = ~~(rgb[1]/count); //jshint ignore:line
    rgb[2] = ~~(rgb[2]/count); //jshint ignore:line

    console.log(rgb);

    socket.send(JSON.stringify(rgb));
};