module.exports = function(ws) {
	return function() {
		ws.send(JSON.stringify({request: 'update'}));
	};
};