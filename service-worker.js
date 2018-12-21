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
    "revision": "97ab9156564d4968e61e0996cd7790fe"
  },
  {
    "url": "api/contextMenu.html",
    "revision": "7f46308bdfa3f8884059ff9d73868918"
  },
  {
    "url": "api/control.html",
    "revision": "71f820ac387099596483d72a6db2d1b8"
  },
  {
    "url": "api/doc.html",
    "revision": "07eb05af4864a654af7adcad6541db4a"
  },
  {
    "url": "api/index.html",
    "revision": "27ebd471e9e2c7d8c8e9885293751158"
  },
  {
    "url": "api/mediaManager.html",
    "revision": "7230a7177ee7b427f8ecc16f6c9cc6ee"
  },
  {
    "url": "api/mediaManagerClient.html",
    "revision": "3aa6fa682ed0c9d19baa0f415cf561c5"
  },
  {
    "url": "api/module.html",
    "revision": "c7ece3a02e3be7a4e292b1131356493a"
  },
  {
    "url": "api/palette.html",
    "revision": "1f31ea9491cf8284e147dc3868b8cf85"
  },
  {
    "url": "api/plugin.html",
    "revision": "94c84e879614ac9aa10dea7da4267d6c"
  },
  {
    "url": "api/renderer.html",
    "revision": "e9bb414b9d780673df40c59106e677d7"
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
    "url": "assets/js/10.41dfea09.js",
    "revision": "f8fac217c30d91db55c2658087db30ac"
  },
  {
    "url": "assets/js/11.75c07540.js",
    "revision": "b224584785ba618830d875d70df1addd"
  },
  {
    "url": "assets/js/12.4ef118cd.js",
    "revision": "0bbcb7e5a0cf808b922cc96c4c6080d6"
  },
  {
    "url": "assets/js/13.a3611a11.js",
    "revision": "0eadc8e860d2d2bfbcc4ed9bb949a54f"
  },
  {
    "url": "assets/js/14.6f61dd4a.js",
    "revision": "f2734207e487cafefd75657d73126bcf"
  },
  {
    "url": "assets/js/15.284c0dd4.js",
    "revision": "82df1f0751af45d7e8ed5473c69038ac"
  },
  {
    "url": "assets/js/16.4c1b4543.js",
    "revision": "55506e9846aa8dbdc1609c25d392aca1"
  },
  {
    "url": "assets/js/17.37d004d9.js",
    "revision": "6e7d739edc925a7c994ebbbd98463970"
  },
  {
    "url": "assets/js/18.26d7488d.js",
    "revision": "1ac2087c1c71113d78f0af08db27ad0c"
  },
  {
    "url": "assets/js/19.add3362c.js",
    "revision": "41be51c38c94837dd5cf9825ff890fa3"
  },
  {
    "url": "assets/js/2.635fc80b.js",
    "revision": "b13e10004fdda1435df4f12e3e7a0d63"
  },
  {
    "url": "assets/js/20.119c9940.js",
    "revision": "d47a3cc0776f9336ac569a33fee235b0"
  },
  {
    "url": "assets/js/21.eaee8474.js",
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
    "url": "assets/js/4.667b8d26.js",
    "revision": "c29d6e67c7f64c3f3ff97060276dd8db"
  },
  {
    "url": "assets/js/5.db9bef96.js",
    "revision": "8f63918ecec3ad8eba9194b138c0c30a"
  },
  {
    "url": "assets/js/6.aa5f334f.js",
    "revision": "9c94c0e0b11d3bd4da919745a08eb127"
  },
  {
    "url": "assets/js/7.a38defc3.js",
    "revision": "18584e6d77c5b16777e8e3b15570837f"
  },
  {
    "url": "assets/js/8.0ec384dd.js",
    "revision": "90122c88e95470ac220f16f7539e6053"
  },
  {
    "url": "assets/js/9.cdbde6c1.js",
    "revision": "3c2894820526e7cff75497d47b9319a4"
  },
  {
    "url": "assets/js/app.13595787.js",
    "revision": "1231cd2aa15315ec8f6c140e3ec72fe0"
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
    "revision": "2b4f4891f1b2e1a27a96bc54beb042d3"
  },
  {
    "url": "guide/coreConcepts.html",
    "revision": "f38fc2e0339e762e236c59bc18c34e4a"
  },
  {
    "url": "guide/index.html",
    "revision": "d276af9d1c642ffa9ec8c7e32e3fd348"
  },
  {
    "url": "guide/mediaManager.html",
    "revision": "0641569ce0047fe555007dc4ea9c97d4"
  },
  {
    "url": "guide/writingA2DModule.html",
    "revision": "a0c5e8e258d7136ee09fd9d934e40e25"
  },
  {
    "url": "guide/writingAnIsfModule.html",
    "revision": "340fe35dd406b505f71806e53a64f179"
  },
  {
    "url": "guide/writingAShaderModule.html",
    "revision": "3f04ba8933aa7679bf906add6e01d4ba"
  },
  {
    "url": "index.html",
    "revision": "f74bf9a2494fb168ae8bfe43183ae4fb"
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
