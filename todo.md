* ~~New Electron Window (EThread)~~
* Implement IPC-Messaging to talk with the EThread in background.js, which will replace the Worker-Msg
  * ~~Windows have to talk directly with each other~~
  * Dynamic Coupling -> shared.js from Sams example
  * async messages
  * abstract away the messaging so we can change it to SharedWorkers once that is fixed
* Hide the RendererWindow
* Move Audio processing into EThread
* Use video.requestPictureInPicture for Output Window
