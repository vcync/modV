# modV
modV is a modular audio visualisation environment written in JavaScript and runs in Google Chrome.

All documentation so far is available in [this repo's Wiki](https://github.com/2xAA/modV/wiki).

[![Flattr this](https://button.flattr.com/flattr-badge-large.png "Flattr this")](https://flattr.com/submit/auto?fid=xvwndw&url=https%3A%2F%2Fgithub.com%2F2xAA%2FmodV)

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


## Requirements
- [node](https://nodejs.org/) (we're developing on [lts/boron](https://nodejs.org/en/blog/release/v6.9.0/) (Node version 6 from 6.9.0 onwards) so we recommend that) 
- [Google Chrome desktop](https://www.google.com/chrome/browser/desktop/) (not required for [standalone build](https://github.com/2xAA/modV#building-standalone-application))

## Installation
1. Download (clone or zip)
* Open a terminal, navigate to your downloaded folder (for example; ```cd ~/Downloads/modV/```)
* Run ```npm install```, this will install modV's required packages
* Once the installation has finished, run ```npm start```
* Open Chrome and go to ```http://localhost:3131```

## OS Specifics

### Windows
- You must run either Command Prompt or PowerShell with administrative privileges for the media folder to be symlinked.  
To do this, find either cmd or PowerShell in your start menu, right click and select 'Run as administrator.'.
- VB Cable is recommended to route audio to the browser, download that [here](http://vb-audio.pagesperso-orange.fr/Cable/)

### OS X/macOS
- SoundFlower is recommended to route audio to the browser, download that [here](https://github.com/mattingalls/Soundflower/releases/)

### Linux
- Jack may be the way to go for audio routing to the browser, but I have not tested this. Please submit a PR for this README if you have any information on this.

## Building standalone application
modV can also be built using [NWJS](http://nwjs.io/) as a standalone application.

To build modV make sure you have already run ```npm install``` and then run ```gulp build-nwjs```. After it has finished building your application should appear in ./nwjs/build/modV.

By default the build script will build for OS X 64-bit and Windows 64-bit. To change this, edit the ```build-nwjs``` task in ```gulpfile.js``` and modify the platform target array.  
For more information, please read [the nw-builder documentation](https://github.com/nwjs/nw-builder).
