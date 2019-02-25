/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "dcdacaa8302a80bf2f3ae662f4f4100d"
  },
  {
    "url": "api/contextMenu.html",
    "revision": "06a33396f897429fafc1df4060a2643d"
  },
  {
    "url": "api/control.html",
    "revision": "202c5d345b36b0401ec9f36f9f4b2499"
  },
  {
    "url": "api/doc.html",
    "revision": "e024018089ed410ef2323e1aef7771cf"
  },
  {
    "url": "api/index.html",
    "revision": "6479bd0e15bc83c49c0cf95a53f82356"
  },
  {
    "url": "api/mediaManager.html",
    "revision": "50f4b60ed6c2ff4cd46ec451cabfdfc2"
  },
  {
    "url": "api/mediaManagerClient.html",
    "revision": "aaa9a5d2ff9c5e9bc26d5d843d115d9b"
  },
  {
    "url": "api/module.html",
    "revision": "e4c430be1818ce844e42ae5af785b1fe"
  },
  {
    "url": "api/palette.html",
    "revision": "8dc4a6aefde1be4932732e678f0ac1f6"
  },
  {
    "url": "api/plugin.html",
    "revision": "3ee732dbd770d1601b321cd84482f01b"
  },
  {
    "url": "api/renderer.html",
    "revision": "0da28f91a8167297146dd23935c2e414"
  },
  {
    "url": "assets/css/0.styles.f85b709f.css",
    "revision": "71f0e7f98ff239c51a84b78b0c15b7e0"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.efb29ffd.js",
    "revision": "87205e5c12fb218742e94796d15901d8"
  },
  {
    "url": "assets/js/11.34b2ec29.js",
    "revision": "174f386fb2e94d2b2f5045e4b93f0f7a"
  },
  {
    "url": "assets/js/12.fee52e6b.js",
    "revision": "ab84111d9181bea77ddb3e6ded2e93bb"
  },
  {
    "url": "assets/js/13.e14b345e.js",
    "revision": "0818c0b7b64e26024c4a39f28fd246d4"
  },
  {
    "url": "assets/js/14.b9e5ef66.js",
    "revision": "e98b7965d1c2ab7581b4db30943c24cf"
  },
  {
    "url": "assets/js/15.3a2bb091.js",
    "revision": "cfb306d1c04fa89844d85c41ce507d47"
  },
  {
    "url": "assets/js/16.dbcc3ab0.js",
    "revision": "b8792e319c07e3f1f3e64b05d3db4319"
  },
  {
    "url": "assets/js/17.c3bcf15c.js",
    "revision": "9be09c943f67f9472dbc2d6197078c44"
  },
  {
    "url": "assets/js/18.9c501092.js",
    "revision": "0b00d09320886df44e0cd7c973925c1b"
  },
  {
    "url": "assets/js/19.fbaa8af8.js",
    "revision": "2dac1bb4a5c1344122ad9503d2c3f11c"
  },
  {
    "url": "assets/js/2.3789e090.js",
    "revision": "b13e10004fdda1435df4f12e3e7a0d63"
  },
  {
    "url": "assets/js/20.9177df18.js",
    "revision": "89cd28c9775644878752f578a67c6c50"
  },
  {
    "url": "assets/js/21.86caa086.js",
    "revision": "f1744c8e37a483118aa89e54d2f121e6"
  },
  {
    "url": "assets/js/22.2ad72a28.js",
    "revision": "5c58b8e1b4da04ea98f6b2d82d38778b"
  },
  {
    "url": "assets/js/23.2cb80225.js",
    "revision": "ff8a813070cfb1855c84b236d9e7985b"
  },
  {
    "url": "assets/js/3.2d6d6314.js",
    "revision": "59af67538e12574b76f9d2fbcb8ce3bc"
  },
  {
    "url": "assets/js/4.d48bb118.js",
    "revision": "ae18a6c3ad3e3d73b73a062afe7171a4"
  },
  {
    "url": "assets/js/5.94ea9f7f.js",
    "revision": "d3c769420ba373ac84f60a97cd22b21b"
  },
  {
    "url": "assets/js/6.f8701cd3.js",
    "revision": "72a7987751f4f9d6e1c4c443eab09049"
  },
  {
    "url": "assets/js/7.bf6475b6.js",
    "revision": "9ea7f74e7517a2b02caa5e97615cc428"
  },
  {
    "url": "assets/js/8.2502a350.js",
    "revision": "aa0798d2586a7497ec9290cecad18fdd"
  },
  {
    "url": "assets/js/9.7f791651.js",
    "revision": "01d6bd88808aabeb6a697110637c8a96"
  },
  {
    "url": "assets/js/app.f8e3e411.js",
    "revision": "11e805f3f49a9d3ee323a934bcc4a56e"
  },
  {
    "url": "captures/1.jpg",
    "revision": "307c8d6e0e60b6f06256c9ba32f537de"
  },
  {
    "url": "captures/2.jpg",
    "revision": "8a4ee00df212d679699c9f3c02f1f818"
  },
  {
    "url": "captures/3.jpg",
    "revision": "2fc09b81d549428fc87f52fd25ae0804"
  },
  {
    "url": "captures/4.jpg",
    "revision": "b8ebe7eaa11a39f75271d7401abe7078"
  },
  {
    "url": "captures/5.jpg",
    "revision": "a13d70e6c027d67917183ec1863698d9"
  },
  {
    "url": "captures/6.jpg",
    "revision": "858bc2bb85eddea9c108e76da509479b"
  },
  {
    "url": "captures/7.jpg",
    "revision": "038da973e19c6ab9b9408354aba32846"
  },
  {
    "url": "captures/8.jpg",
    "revision": "f0f79a5bbc5365c3bce2a289e28616d1"
  },
  {
    "url": "guide/audioRouting.html",
    "revision": "f0500fc41035cee55544bc3bd847b886"
  },
  {
    "url": "guide/coreConcepts.html",
    "revision": "791ab389008047cfa0c9562a793f55dc"
  },
  {
    "url": "guide/index.html",
    "revision": "e32b2fa5181327b5341d2ff9ea0ff248"
  },
  {
    "url": "guide/mediaManager.html",
    "revision": "237d5412438a4a4b8de0b2ad40cd63a5"
  },
  {
    "url": "guide/usingTheExpressionEditor.html",
    "revision": "a0a1705a95d173fb7c4cac72cfd29d99"
  },
  {
    "url": "guide/writingA2DModule.html",
    "revision": "9b8a2c417f06762834900cc20d6cb7c9"
  },
  {
    "url": "guide/writingAnIsfModule.html",
    "revision": "57294b7e1c43bb967cc9560289ac5596"
  },
  {
    "url": "guide/writingAShaderModule.html",
    "revision": "b5b847bb0120983d623ac6a1da434100"
  },
  {
    "url": "index.html",
    "revision": "ea7d9c06b4cca0590b37e763976ccb03"
  },
  {
    "url": "modv-logo.svg",
    "revision": "bce3b2d3727545a6e1771db7e390e43f"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
