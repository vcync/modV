/**
 * @param {string} url
 * @param {Element} targetElement Element in which script is inserted
 * @param {Module} module
 * @return {Promise}
 */
function loadJS(url, targetElement = document.body, module) {
  return new Promise(resolve => {
    const scriptTag = document.createElement("script");

    scriptTag.onload = () => {
      resolve(module);
    };
    scriptTag.onreadystatechange = () => {
      resolve(module);
    };

    scriptTag.src = url;
    targetElement.appendChild(scriptTag);
  });
}

export default loadJS;
