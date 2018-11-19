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
    "revision": "9899eb61ee3b5c0882b9caa2df2d6b47"
  },
  {
    "url": "api/contextMenu.html",
    "revision": "145ef1705d13aa3eafa3b956989d49ab"
  },
  {
    "url": "api/control.html",
    "revision": "b3e0d7f7178cefb7413508deac3ae58d"
  },
  {
    "url": "api/doc.html",
    "revision": "cee735253395384195fb99a5444db670"
  },
  {
    "url": "api/index.html",
    "revision": "b9a9f7e9b6695f4876b821e0b56898a0"
  },
  {
    "url": "api/mediaManager.html",
    "revision": "f6b6e27283846beebc2a801fc01d03e2"
  },
  {
    "url": "api/mediaManagerClient.html",
    "revision": "7afdfa5f3fa4334fa02240d2e423f2ea"
  },
  {
    "url": "api/module.html",
    "revision": "35b8da909e211b840901d4859167c520"
  },
  {
    "url": "api/palette.html",
    "revision": "43c2a23e9b7185ca4175804f2c9ba517"
  },
  {
    "url": "api/plugin.html",
    "revision": "9da2d8134145bc8b1bde926d6e72a88e"
  },
  {
    "url": "api/renderer.html",
    "revision": "35e74cc913a68b58fc2770cd7ab4333c"
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
    "url": "assets/js/16.5ca982cc.js",
    "revision": "55506e9846aa8dbdc1609c25d392aca1"
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
    "url": "assets/js/app.c76c6a80.js",
    "revision": "f8f3aade14713f3420befa43278b66cf"
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
    "revision": "3bdf3585ede467e12192a7a9ea7d9d26"
  },
  {
    "url": "guide/coreConcepts.html",
    "revision": "3eaf8abf30394b2e352daec4b2966823"
  },
  {
    "url": "guide/index.html",
    "revision": "8255b0bbdde77f6a30d7f2b9994aa3d5"
  },
  {
    "url": "guide/mediaManager.html",
    "revision": "354c3488e20d26dcc67872ec38235d67"
  },
  {
    "url": "guide/writingA2DModule.html",
    "revision": "8b5a8af42cf03b92b9aa25a88b33b8f9"
  },
  {
    "url": "guide/writingAnIsfModule.html",
    "revision": "026dcf54b54d84cde9824c36532a2f31"
  },
  {
    "url": "guide/writingAShaderModule.html",
    "revision": "171af330bd73dc7e6e233ff9b5511603"
  },
  {
    "url": "index.html",
    "revision": "1894584634af88eec8baff4ee2e9da03"
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
