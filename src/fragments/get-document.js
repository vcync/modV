module.exports = function getDocument(url, callback) {
	var xhr = new XMLHttpRequest();

	xhr.onload = function() {
		callback(xhr.responseXML);
	};

	xhr.open("GET", url);
	xhr.responseType = "document";
	xhr.send();
};