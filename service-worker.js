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
    "revision": "c0a44355c9b4d632ae32acee8232dcb2"
  },
  {
    "url": "api/contextMenu.html",
    "revision": "6ca503044ab3ba37614592c48a3704c0"
  },
  {
    "url": "api/control.html",
    "revision": "d15b9f559b82841df918e18ece503ac8"
  },
  {
    "url": "api/doc.html",
    "revision": "9dd0ce1102dcb70eb49316e0a3597775"
  },
  {
    "url": "api/index.html",
    "revision": "041525966fb612166f0a20d723d3ecc3"
  },
  {
    "url": "api/mediaManager.html",
    "revision": "3901a1f95e762e7e7bdf946401f5eddf"
  },
  {
    "url": "api/mediaManagerClient.html",
    "revision": "c52a9d3629fddce17f55a4d1b9f61015"
  },
  {
    "url": "api/module.html",
    "revision": "0e0d6d8577816e5caafaea1843ee1462"
  },
  {
    "url": "api/palette.html",
    "revision": "9f172bc79928844fb5470125a9611e34"
  },
  {
    "url": "api/plugin.html",
    "revision": "9a822b53b293f57698ebbe0d776eb12d"
  },
  {
    "url": "api/renderer.html",
    "revision": "bacc9d64146fedc18126fa935ae0a0ed"
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
    "url": "assets/js/10.388940ff.js",
    "revision": "f8fac217c30d91db55c2658087db30ac"
  },
  {
    "url": "assets/js/11.0a8b57d6.js",
    "revision": "b224584785ba618830d875d70df1addd"
  },
  {
    "url": "assets/js/12.7a675cd3.js",
    "revision": "0bbcb7e5a0cf808b922cc96c4c6080d6"
  },
  {
    "url": "assets/js/13.21307f36.js",
    "revision": "0eadc8e860d2d2bfbcc4ed9bb949a54f"
  },
  {
    "url": "assets/js/14.42e528d7.js",
    "revision": "f2734207e487cafefd75657d73126bcf"
  },
  {
    "url": "assets/js/15.3b268bc6.js",
    "revision": "82df1f0751af45d7e8ed5473c69038ac"
  },
  {
    "url": "assets/js/16.4021037e.js",
    "revision": "55506e9846aa8dbdc1609c25d392aca1"
  },
  {
    "url": "assets/js/17.c0775caa.js",
    "revision": "6e7d739edc925a7c994ebbbd98463970"
  },
  {
    "url": "assets/js/18.270e2c07.js",
    "revision": "1ac2087c1c71113d78f0af08db27ad0c"
  },
  {
    "url": "assets/js/19.ffa32b29.js",
    "revision": "021c43668f4a6bafd483f9927f1390a8"
  },
  {
    "url": "assets/js/2.3789e090.js",
    "revision": "b13e10004fdda1435df4f12e3e7a0d63"
  },
  {
    "url": "assets/js/20.b228953f.js",
    "revision": "d47a3cc0776f9336ac569a33fee235b0"
  },
  {
    "url": "assets/js/21.447f302a.js",
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
    "url": "assets/js/4.dfa367e4.js",
    "revision": "c29d6e67c7f64c3f3ff97060276dd8db"
  },
  {
    "url": "assets/js/5.4abf7d6c.js",
    "revision": "8f63918ecec3ad8eba9194b138c0c30a"
  },
  {
    "url": "assets/js/6.e441385f.js",
    "revision": "9c94c0e0b11d3bd4da919745a08eb127"
  },
  {
    "url": "assets/js/7.667565c8.js",
    "revision": "18584e6d77c5b16777e8e3b15570837f"
  },
  {
    "url": "assets/js/8.541c929d.js",
    "revision": "90122c88e95470ac220f16f7539e6053"
  },
  {
    "url": "assets/js/9.28ba020b.js",
    "revision": "3c2894820526e7cff75497d47b9319a4"
  },
  {
    "url": "assets/js/app.2861ebd4.js",
    "revision": "33e280a2f0a36c251a6a17e2756194c1"
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
    "revision": "0f23524affe124f17374f77df8eb4b86"
  },
  {
    "url": "guide/coreConcepts.html",
    "revision": "3aa830aacfd6bf3a5bb7ae74bcc716b0"
  },
  {
    "url": "guide/index.html",
    "revision": "616d8e47a00c9bbeac171bbc605c43e6"
  },
  {
    "url": "guide/mediaManager.html",
    "revision": "731f04e3134f5ad7add9fb6b2ff1328d"
  },
  {
    "url": "guide/writingA2DModule.html",
    "revision": "348b6aaff8da1057e5507d968ff0834c"
  },
  {
    "url": "guide/writingAnIsfModule.html",
    "revision": "ee91982fd161fdfce498eae21f8117f3"
  },
  {
    "url": "guide/writingAShaderModule.html",
    "revision": "124347c06ed2ef386553370f667890c1"
  },
  {
    "url": "index.html",
    "revision": "60cf173a9e91ab0cd58bd5220c5317c7"
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
