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
    "revision": "670626e0b278073929d167e59e9334d9"
  },
  {
    "url": "api/contextMenu.html",
    "revision": "f4c80e873f822c42908042de3d6b5cf3"
  },
  {
    "url": "api/control.html",
    "revision": "3e81240d05d4dc8f4c197d5c683274c9"
  },
  {
    "url": "api/doc.html",
    "revision": "5fe2cd2364068de71fd128a2bc0dd53d"
  },
  {
    "url": "api/index.html",
    "revision": "2ae79e649a9f2625ce4034255da7e6ca"
  },
  {
    "url": "api/mediaManager.html",
    "revision": "a9f38530f14eec1effd09bb2d69d2895"
  },
  {
    "url": "api/mediaManagerClient.html",
    "revision": "b45edad800ee630bf19d83f613cfa80c"
  },
  {
    "url": "api/module.html",
    "revision": "e578f306268a76e9c8de9e5f4c95ad22"
  },
  {
    "url": "api/palette.html",
    "revision": "f5bbdf264087735533b01477a2261505"
  },
  {
    "url": "api/plugin.html",
    "revision": "26698eac93d6a6c865838aabeb6315ff"
  },
  {
    "url": "api/renderer.html",
    "revision": "e176db4fecf7743cb0fcfe47aa9fbd43"
  },
  {
    "url": "assets/css/0.styles.ee0ee223.css",
    "revision": "5920163cc01b3b18f004675891acbd69"
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
    "url": "assets/js/19.8c3a5bad.js",
    "revision": "41be51c38c94837dd5cf9825ff890fa3"
  },
  {
    "url": "assets/js/2.ad83e3b9.js",
    "revision": "b13e10004fdda1435df4f12e3e7a0d63"
  },
  {
    "url": "assets/js/20.fff80101.js",
    "revision": "d47a3cc0776f9336ac569a33fee235b0"
  },
  {
    "url": "assets/js/21.73e75da5.js",
    "revision": "66292e92971c2bcfe05f3fcf8a61b1ec"
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
    "url": "assets/js/app.dc11572f.js",
    "revision": "8b216c9490efe8571c35d003d6bcc2b3"
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
    "revision": "77018b98faf8545b4cc53130ca540074"
  },
  {
    "url": "guide/coreConcepts.html",
    "revision": "f4c24c9b7ae575ed04515ec046828188"
  },
  {
    "url": "guide/index.html",
    "revision": "25736f74558f24611532b306081204a1"
  },
  {
    "url": "guide/mediaManager.html",
    "revision": "2f0760b51cb81654453c778ed8a2df35"
  },
  {
    "url": "guide/writingA2DModule.html",
    "revision": "20125a1eb6c13b9509ef60de1220dbed"
  },
  {
    "url": "guide/writingAnIsfModule.html",
    "revision": "38eb7c7e82df260011d6a7894f422586"
  },
  {
    "url": "guide/writingAShaderModule.html",
    "revision": "2b1ce78b4e0b4d2bf406c18d3b1ed2a3"
  },
  {
    "url": "index.html",
    "revision": "39ef30db6316889698869f44ed824d1b"
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
