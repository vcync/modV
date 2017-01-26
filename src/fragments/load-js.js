module.exports = function loadJS(url, location, Module){
	var loaderPromise = new Promise(resolve => {
		var scriptTag = document.createElement('script');
		scriptTag.onload = function() {
			resolve(Module);
		};
		scriptTag.onreadystatechange = function() {
			resolve(Module);
		};

		scriptTag.src = url;

		location.appendChild(scriptTag);
	});

	return loaderPromise;
};