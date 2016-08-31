#modV
modV is a modular audio visualisation environment written in JavaScript and runs in Google Chrome.

All documentation so far is available in [this repo's Wiki](https://github.com/2xAA/modV/wiki). There's more to come!

## Requirements
- [node](https://nodejs.org/) (LTS is usually fine, this branch was built with 4.4.7 and has been confirmed to work with 4.5.0)
- [Google Chrome desktop](https://www.google.com/chrome/browser/desktop/)

## Installation
1. Download (clone or zip)
* Open a terminal, navigate to your downloaded folder (for example; ```cd ~/Downloads/modV/```)
* Run ```npm install```, this will install modV's required packages
* Once the installation has finished, run ```gulp watch```
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