module.exports = function(ws) {
	return function(json) {
		ws.send(JSON.stringify(json));
	};
};