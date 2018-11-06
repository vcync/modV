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
    "revision": "eebb3d74368a94c5afcf79c0e47aa13d"
  },
  {
    "url": "api/contextMenu.html",
    "revision": "8e47bf9134ffe8a1915fd3d4942a615b"
  },
  {
    "url": "api/control.html",
    "revision": "126299fa7746053a15f118ecfd1f7d74"
  },
  {
    "url": "api/doc.html",
    "revision": "e2cf7e8f0283d77209bcc1109d286658"
  },
  {
    "url": "api/index.html",
    "revision": "85d946ed87b4b7936f7d3f3b2bfd18ad"
  },
  {
    "url": "api/mediaManager.html",
    "revision": "4ddbac7ba677593798cb93df232ba002"
  },
  {
    "url": "api/mediaManagerClient.html",
    "revision": "de5d794e92853bd978cb40294e73e479"
  },
  {
    "url": "api/module.html",
    "revision": "aebb6ef2086aba24405baa95a4a36462"
  },
  {
    "url": "api/palette.html",
    "revision": "c1e7c0e6e24d9cc6f2399e504f14b634"
  },
  {
    "url": "api/plugin.html",
    "revision": "f3367f5d76167f0e88169a7d9935002f"
  },
  {
    "url": "api/renderer.html",
    "revision": "e0013a43ab4f9fd6b2f6a209d58d8f0c"
  },
  {
    "url": "assets/css/1.styles.af4e439d.css",
    "revision": "f2535ad2ab6d69e87f567ce2614f8102"
  },
  {
    "url": "assets/css/2.styles.e38f743e.css",
    "revision": "df7c35ec8029dbbde0735a45f875eaf7"
  },
  {
    "url": "assets/css/3.styles.04af8fe2.css",
    "revision": "214c8a7bd26ef0e67bd6cf95d65d5fa0"
  },
  {
    "url": "assets/css/styles.6376aab2.css",
    "revision": "cdbcfbd9a0654e6beec824fcc18d54a3"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/1.af4e439d.js",
    "revision": "fe63170bd6e4e50b7c7828e39ccb1864"
  },
  {
    "url": "assets/js/10.10fef56f.js",
    "revision": "8bbf8664885f9b01208bd577a03de694"
  },
  {
    "url": "assets/js/11.ec9610da.js",
    "revision": "20955b8d1b330adadcfdbfa3d1942391"
  },
  {
    "url": "assets/js/12.bf702f2f.js",
    "revision": "5152d1d964c78da620854297833b9e1d"
  },
  {
    "url": "assets/js/13.0a03fd7b.js",
    "revision": "14ab2938fa326ea98202d41d46d37cc8"
  },
  {
    "url": "assets/js/14.cbdde035.js",
    "revision": "7e7cf8d0ac9c326ccb229cde874fddea"
  },
  {
    "url": "assets/js/15.742ea5ba.js",
    "revision": "ecf0a01bf5b9ff9675d5e3509767b43c"
  },
  {
    "url": "assets/js/16.d1f2c04b.js",
    "revision": "0df74b8340b7363e17f8b5c76f19945a"
  },
  {
    "url": "assets/js/17.84c5af58.js",
    "revision": "cc18d3246bf10f3ef47b7b37c39ee4fc"
  },
  {
    "url": "assets/js/18.53ea5d69.js",
    "revision": "b55147295f77d0f2bf1619d3f771605b"
  },
  {
    "url": "assets/js/19.caad2c02.js",
    "revision": "889953cac1c13f2807016ef81bc30770"
  },
  {
    "url": "assets/js/2.e38f743e.js",
    "revision": "5862efe46de22aee3529c2da98e23da5"
  },
  {
    "url": "assets/js/20.252bcaa5.js",
    "revision": "d01350abc90cf7709c7b55e6c4e17ba4"
  },
  {
    "url": "assets/js/21.20a6f314.js",
    "revision": "ae6055179868b048b1ae085e0906907f"
  },
  {
    "url": "assets/js/3.04af8fe2.js",
    "revision": "04c36d23b729ab012f9c03b2c261ce67"
  },
  {
    "url": "assets/js/4.98530543.js",
    "revision": "8b2e9b5537003251e62062ac9cdb65ef"
  },
  {
    "url": "assets/js/5.7ffa22d6.js",
    "revision": "51554c237f5fc12c84790ae6b5f89b86"
  },
  {
    "url": "assets/js/6.d6a389a8.js",
    "revision": "db94a8bfe65f010a77803816e54867d7"
  },
  {
    "url": "assets/js/7.c7f0cad5.js",
    "revision": "257f8c05b54b381e1fa6e03af333a270"
  },
  {
    "url": "assets/js/8.ccb53f5e.js",
    "revision": "a14e659616e303794468af1aae7ac58f"
  },
  {
    "url": "assets/js/9.fade9bad.js",
    "revision": "451b095aca7fd213f74315b4466dd331"
  },
  {
    "url": "assets/js/app.6376aab2.js",
    "revision": "36537956b016c10a7e5040069243fbac"
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
    "revision": "389f591924dd5c4e5abaec67029e5985"
  },
  {
    "url": "guide/coreConcepts.html",
    "revision": "47fb910873c2afe4f7777549da4bc1bf"
  },
  {
    "url": "guide/index.html",
    "revision": "ea2d6da6b260ed7ed84cbd7c9c09455e"
  },
  {
    "url": "guide/mediaManager.html",
    "revision": "b49f2d7f743b0f3135ee0d476cd8e4a2"
  },
  {
    "url": "guide/writingA2DModule.html",
    "revision": "5806593ee430bc99906e85f352da7f9c"
  },
  {
    "url": "guide/writingAnIsfModule.html",
    "revision": "40d94dd6a2f70a38c1338f875c0eee75"
  },
  {
    "url": "guide/writingAShaderModule.html",
    "revision": "19335dc8a8f3c45894648f35cb37cffb"
  },
  {
    "url": "index.html",
    "revision": "a81e6c1f1cb668fb16b55f3669fdaaf6"
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
