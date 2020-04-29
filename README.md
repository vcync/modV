# modV
modV is a modular audio visualisation environment written in JavaScript and runs in Google Chrome.

All documentation so far is available in [this repo's Wiki](https://github.com/2xAA/modV/wiki).

[![Flattr this](https://button.flattr.com/flattr-badge-large.png "Flattr this")](https://flattr.com/submit/auto?fid=xvwndw&url=https%3A%2F%2Fgithub.com%2F2xAA%2FmodV)

[2.0](https://github.com/2xAA/modV/tree/2.0/): [![Build Status](https://travis-ci.org/2xAA/modV.svg?branch=2.0)](https://travis-ci.org/2xAA/modV)

## Important version information

modV has three versions.
1.0 is found in the `master` branch.
1.5 is found in the `1.5` branch.
2.0 - the only version with active development, can be found in the `2.0` branch.

modV is still active, but only on the 2.0 branch.
When 2.0 reaches maturity, 1.0 will be archived onto its own branch and 2.0 will become the master branch.
Releases will start upon 2.0's move to the master branch.

There is no support for 1.0. 1.5 will be bugfixed upon request.

## Sample images
[![](https://github.com/2xAA/modV/raw/master/docs/example-images/1.jpg)](https://github.com/2xAA/modV/raw/master/docs/example-images/1.png)
[![](https://github.com/2xAA/modV/raw/master/docs/example-images/2.jpg)](https://github.com/2xAA/modV/raw/master/docs/example-images/2.png)
[![](https://github.com/2xAA/modV/raw/master/docs/example-images/3.jpg)](https://github.com/2xAA/modV/raw/master/docs/example-images/3.png)
[![](https://github.com/2xAA/modV/raw/master/docs/example-images/4.jpg)](https://github.com/2xAA/modV/raw/master/docs/example-images/4.png)
[![](https://github.com/2xAA/modV/raw/master/docs/example-images/5.jpg)](https://github.com/2xAA/modV/raw/master/docs/example-images/5.png)
[![](https://github.com/2xAA/modV/raw/master/docs/example-images/6.jpg)](https://github.com/2xAA/modV/raw/master/docs/example-images/6.png)
[![](https://github.com/2xAA/modV/raw/master/docs/example-images/7.jpg)](https://github.com/2xAA/modV/raw/master/docs/example-images/7.png)

## Requirements
- [node](https://nodejs.org/) version 8 or above
- [Google Chrome desktop](https://www.google.com/chrome/browser/desktop/) (not required for [standalone build](https://github.com/2xAA/modV#notes-on-building))

## Build Setup
``` bash
# clone and move into directory
git clone git@github.com:2xAA/modV.git ./modV
cd modV

# install dependencies
npm

# additional step for windows users (using cmd or powershell?)
npm rebuild node-sass

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

### Windows 10

In order to build modV on Windows 10 you have to install the `windows-build-tools`:

```bash
npm install --global --production windows-build-tools
```

### Notes on Building
modV, by default, builds a standalone application using [NWJS](http://nwjs.io/).
Your standalone application should appear in `./nwjs/build/modV` and the standard site version will appear in `./dist`.

By default the build script will build standalone apps for OS X 64-bit and Windows 64-bit.
For more information, please read [the nw-builder documentation](https://github.com/nwjs/nw-builder).

To build standalone applications for Windows on macOS an Linux platforms, make sure Wine is installed and accessable via the commandline.

## OS Audio Specifics

### Windows
- You must run either Command Prompt or PowerShell with administrative privileges for the media folder to be symlinked.
To do this, find either cmd or PowerShell in your start menu, right click and select 'Run as administrator.'.
- VB Cable is recommended to route audio to the browser, download that [here](http://vb-audio.pagesperso-orange.fr/Cable/)

### macOS
- SoundFlower is recommended to route audio to the browser, download that [here](https://github.com/mattingalls/Soundflower/releases/)

### Linux
- One way of routing audio to the browser is using [Pulse Audio's](https://www.freedesktop.org/wiki/Software/PulseAudio/) Volume Control package.
This [tutorial](https://www.kirsle.net/blog/entry/redirect-audio-out-to-mic-in-linux) shows how to setup the Input Devices to show your monitoring.
When you start the modV application, your browser should appear as a recording device in the "Recording" tab and you should not have to do any extra
to make it work.
![Browser input device in pavucontrol](https://github.com/2xAA/modV/raw/master/docs/linux-audio/pavucontrol.png)

## Contribution
modV is open to contribution. Currently the project needs (in order of priority):
* full re-write for ES6
* a better UI
* work on the mediaManager and loading/saving Modules

If you can help with any of these, please submit a PR and/or issue.

## Acknowledgements
Thank you to:

* Hugh Rawlinson, Nevo Segal and Jakub Fiala for the incredible audio analysis engine, [meyda](https://github.com/hughrawlinson/meyda)
* [Dario Villanueva](http://alolo.co) for his advice and introduction to live visuals which inspired this whole project
* Lebedev Konstantin for [Sortable](https://github.com/RubaXa/Sortable)
* Charles J. Cliffe for [BeatDetektor](https://github.com/cjcliffe/beatdetektor)
* mrdoob for [THREE.js](https://threejs.org/)

## Project repos
* [modV MediaManager](https://github.com/2xAA/modV-MediaManager)
