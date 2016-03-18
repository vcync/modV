#modV
modV is a modular audio visualisation environment written in JavaScript and runs in Google Chrome.

Docs to come! (promise)

## Requirements
- [node](https://nodejs.org/download/) (v0.12.7) - A nice way of managing your node versions is by installing [n](https://github.com/tj/n).
- [grunt-cli](https://github.com/gruntjs/grunt-cli)
- [Google Chrome desktop](https://www.google.com/chrome/browser/desktop/)

## Installation
1. Download (clone or zip)
* Open a terminal, navigate to your downloaded folder (for example; ```cd ~/Downloads/modV/```)
* Make sure you're running node 0.12.7 (**very important**) by typing ```node -v```
	* If you're not running 0.12.7, use [n](https://github.com/tj/n) to install 0.12.7 by running ```n 0.12.7```
* Run ```npm install```, this will install modV's required packages
* Once the installation has finished, run ```grunt server``` (or run ```grunt no-manager``` to start without the media manager)
* Open Chrome and go to ```http://localhost:3131```