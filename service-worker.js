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
    "revision": "79cafbe25b045ca874de3bc3a22630ae"
  },
  {
    "url": "api/contextMenu.html",
    "revision": "858c232c337778c60621cce263d2bb6a"
  },
  {
    "url": "api/control.html",
    "revision": "d57dd53347109ace5fd2a107fd15edb3"
  },
  {
    "url": "api/doc.html",
    "revision": "ed3dfba542fbdc982183e46933dd2627"
  },
  {
    "url": "api/index.html",
    "revision": "dbea97765a9fd455969a5d7058699282"
  },
  {
    "url": "api/mediaManager.html",
    "revision": "08d6f438074b63fcc12a24bcebdfeecb"
  },
  {
    "url": "api/mediaManagerClient.html",
    "revision": "200f7b56d050ba3bedc2e6e64ea91dac"
  },
  {
    "url": "api/module.html",
    "revision": "d40eb8cb587830f6952305a3ac03d44c"
  },
  {
    "url": "api/palette.html",
    "revision": "079a4a75698f4b90cb1fe122e03cbd2f"
  },
  {
    "url": "api/plugin.html",
    "revision": "5798bcd7e1466e3b08a1f5366b145acb"
  },
  {
    "url": "api/renderer.html",
    "revision": "8dac1703cd3a181ee1d002b4a5c27e09"
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
    "url": "assets/js/19.877fa603.js",
    "revision": "df567c09f6a28b3e22baf3f436087e46"
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
    "url": "assets/js/app.9781b1ca.js",
    "revision": "59873dace1dc4e1840b7d3462c0c0151"
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
    "revision": "57713ffc132545cac39ca05569b19dee"
  },
  {
    "url": "guide/coreConcepts.html",
    "revision": "3dcdcc5e4245d5453aa24c61d69af85c"
  },
  {
    "url": "guide/index.html",
    "revision": "fc54dba3bb5f9828e05046f61b1b1261"
  },
  {
    "url": "guide/mediaManager.html",
    "revision": "d9ebae0356da8934482b3ce352353cc9"
  },
  {
    "url": "guide/usingTheExpressionEditor.html",
    "revision": "c8b8dbf87255d77ae3d785c5a4d807ae"
  },
  {
    "url": "guide/writingA2DModule.html",
    "revision": "79e178ef5c4eed0c30855c48764c945d"
  },
  {
    "url": "guide/writingAnIsfModule.html",
    "revision": "b8b4663dada16470434ef9cfbe628797"
  },
  {
    "url": "guide/writingAShaderModule.html",
    "revision": "9c561f41d65b3d90d3bf1954b890e916"
  },
  {
    "url": "index.html",
    "revision": "63e0e559a082327090afce4611432107"
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
