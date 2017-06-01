const scanMediaStreamSources = require('./scan-media-stream-sources');

module.exports = function(modV) {
	modV.prototype.rescanMediaStreamSources = function(callback) {

		let modV = this;
		scanMediaStreamSources().then(foundSources => {
			modV.mediaStreamSources = foundSources;
			modV.enumerateSourceSelects();
			if(typeof callback === 'function') callback(foundSources);
		});
	};
};