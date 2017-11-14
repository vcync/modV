/**
 * @callback getDocumentCallback
 * @param {?Document} XML or HTML Document
 */

/**
 * @param {string} url
 * @param {getDocumentCallback} callback
 */
function getDocument(url, callback) {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    callback(xhr.responseXML);
  };

  xhr.open('GET', url);
  xhr.responseType = 'document';
  xhr.send();
}

export default getDocument;
