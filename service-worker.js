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
    "revision": "f639128a9933c4b12b34c35e292079f9"
  },
  {
    "url": "api/contextMenu.html",
    "revision": "4052fa60f9c85e883e50c14b1ad13181"
  },
  {
    "url": "api/control.html",
    "revision": "8de2afa8a0bcbf9b2e51cf4688c4d712"
  },
  {
    "url": "api/doc.html",
    "revision": "9a5bd36e3d4ff12ba93d292c441cdb8a"
  },
  {
    "url": "api/index.html",
    "revision": "e418c2b806f0ba779a265c2ef6d3e366"
  },
  {
    "url": "api/mediaManager.html",
    "revision": "6421fdaa0240247237a0807c299eb7c4"
  },
  {
    "url": "api/mediaManagerClient.html",
    "revision": "e4e14e6cbd8bbde8d88e79236c8f5c2f"
  },
  {
    "url": "api/module.html",
    "revision": "75945b4531c16405cf17b79164a7efa0"
  },
  {
    "url": "api/palette.html",
    "revision": "200b58b4d730c601307e2809af5dc874"
  },
  {
    "url": "api/plugin.html",
    "revision": "63691f6e4fa9f44ee533305426a63608"
  },
  {
    "url": "api/renderer.html",
    "revision": "a6e70ee2b2c76f6852dc0b8802cb4eea"
  },
  {
    "url": "assets/css/0.styles.42642826.css",
    "revision": "37cab78b51aa71a9d75865c0534481b9"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.05d1f128.js",
    "revision": "f8fac217c30d91db55c2658087db30ac"
  },
  {
    "url": "assets/js/11.50bb9dc9.js",
    "revision": "b224584785ba618830d875d70df1addd"
  },
  {
    "url": "assets/js/12.f7be53b0.js",
    "revision": "0bbcb7e5a0cf808b922cc96c4c6080d6"
  },
  {
    "url": "assets/js/13.67155df2.js",
    "revision": "0eadc8e860d2d2bfbcc4ed9bb949a54f"
  },
  {
    "url": "assets/js/14.75441e3d.js",
    "revision": "f2734207e487cafefd75657d73126bcf"
  },
  {
    "url": "assets/js/15.5e73b39f.js",
    "revision": "82df1f0751af45d7e8ed5473c69038ac"
  },
  {
    "url": "assets/js/16.d143f2f5.js",
    "revision": "a925d541f2f528002d8ccf135bd8dd83"
  },
  {
    "url": "assets/js/17.7d845019.js",
    "revision": "6e7d739edc925a7c994ebbbd98463970"
  },
  {
    "url": "assets/js/18.b8660dc9.js",
    "revision": "99ec25da8817789651838af249dd4ba4"
  },
  {
    "url": "assets/js/19.5d570315.js",
    "revision": "2849ce6fc7b5f359c55316f8a2646761"
  },
  {
    "url": "assets/js/2.8c34ec6d.js",
    "revision": "b13e10004fdda1435df4f12e3e7a0d63"
  },
  {
    "url": "assets/js/20.7d785cd9.js",
    "revision": "029fc2d3e05afc215eadce275b3d16a2"
  },
  {
    "url": "assets/js/21.84fb3f4c.js",
    "revision": "9d5ea3a1869774e0e843e068530a406b"
  },
  {
    "url": "assets/js/22.50a7bd55.js",
    "revision": "52a782224613def7a2718dfe4de574ec"
  },
  {
    "url": "assets/js/3.2d6d6314.js",
    "revision": "59af67538e12574b76f9d2fbcb8ce3bc"
  },
  {
    "url": "assets/js/4.37d53312.js",
    "revision": "c29d6e67c7f64c3f3ff97060276dd8db"
  },
  {
    "url": "assets/js/5.1a2ab06a.js",
    "revision": "8f63918ecec3ad8eba9194b138c0c30a"
  },
  {
    "url": "assets/js/6.55584a12.js",
    "revision": "9c94c0e0b11d3bd4da919745a08eb127"
  },
  {
    "url": "assets/js/7.d5a13a4f.js",
    "revision": "18584e6d77c5b16777e8e3b15570837f"
  },
  {
    "url": "assets/js/8.bda81ec1.js",
    "revision": "90122c88e95470ac220f16f7539e6053"
  },
  {
    "url": "assets/js/9.6cbb4b8a.js",
    "revision": "3c2894820526e7cff75497d47b9319a4"
  },
  {
    "url": "assets/js/app.11a7534d.js",
    "revision": "f4af23df4aa723982d0a8d402df3e025"
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
    "revision": "40e05ee01a9e850c6ea70ebafc977730"
  },
  {
    "url": "guide/coreConcepts.html",
    "revision": "f44b308bf24004f493ba157d7742b331"
  },
  {
    "url": "guide/index.html",
    "revision": "5374be5d1bbb2ec9b50ca22ed8d65b64"
  },
  {
    "url": "guide/mediaManager.html",
    "revision": "bdb6f166e4f13d14fba8314d4199e58b"
  },
  {
    "url": "guide/writingA2DModule.html",
    "revision": "f17fb8f2214a50096ba6c4d1c2217c5e"
  },
  {
    "url": "guide/writingAnIsfModule.html",
    "revision": "af6a70486ad25058415926cddc115383"
  },
  {
    "url": "guide/writingAShaderModule.html",
    "revision": "b27d174627798ee6eb8dfc4f1f452946"
  },
  {
    "url": "index.html",
    "revision": "f49142b1a6f30b0a7be5852e4436d3fb"
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
