import store from '@/../store';
import WebSocket from 'reconnecting-websocket';

class MediaManagerClient {
  constructor() {
    this.available = false;

    let ws;

    try {
      ws = new WebSocket('ws://localhost:3132/');
    } catch (e) {
      console.warn('Media Manager not connected, retrying'); //eslint-disable-line
    }

    this.ws = ws;

    ws.sendJSON = data => ws.send(JSON.stringify(data));

    ws.addEventListener('error', () => {
      this.available = false;
      console.warn('Media Manager not connected, retrying'); //eslint-disable-line
    });

    ws.addEventListener('open', () => {
      this.update();
      this.available = true;
      console.info('Media Manager connected, retrieving media list'); //eslint-disable-line
    });

    window.addEventListener('beforeunload', () => {
      ws.close({
        keepClosed: true,
      });
      this.available = false;
    });

    ws.addEventListener('message', this.messageHandler);
  }

  update() {
    this.ws.sendJSON({ request: 'update' });
  }

  send(data) {
    this.ws.sendJSON(data);
  }

  messageHandler(message) { //eslint-disable-line
    const parsed = JSON.parse(message.data);
    console.log('Media Manager says:', parsed); //eslint-disable-line

    if ('type' in parsed) {
      switch (parsed.type) {
        default:
          break;

        case 'update':
          Object.keys(parsed.payload).forEach((profileName) => {
            const profile = parsed.payload[profileName];

            store.commit('profiles/addProfile', {
              profileName,
              images: profile.images,
              palettes: profile.palettes,
              presets: profile.presets,
              videos: profile.videos,
            });
          });
          break;

        case 'file-update-add':
          if ('data' in parsed) {
            const data = parsed.data;
            const type = data.type;
            const profileName = data.profile;
            const name = data.name;

            if (type === 'palette') {
              store.commit('profiles/addPaletteToProfile', {
                profileName,
                paletteName: name,
                colors: data.contents,
              });
            } else if (type === 'preset') {
              store.commit('profiles/addPresetToProfile', {
                profileName,
                presetName: name,
                presetData: data.contents,
              });
            } else if (type === 'image') {
              // modV.profiles[profile].images[name] = data.path;
            } else if (type === 'video') {
              //  modV.profiles[profile].videos[name] = data.path;
            }
          }

          break;

      //   case 'profile-add':
      //     data = parsed.data;
      //     profile = data.profile;

      //     modV.profiles[profile] = {
      //       palettes: {},
      //       videos: {},
      //       images: {},
      //       presets: {}
      //     };
      //     break;

      //   case 'profile-delete':
      //     data = parsed.data;
      //     profile = data.profile;

      //     delete modV.profiles[profile];
      //     break;

      //   case 'file-update-delete':
      //     data = parsed.data;
      //     type = data.type;
      //     profile = data.profile;
      //     name = data.name;

      //     if(type === 'palette') {
      //       delete modV.profiles[profile].palettes[name];
      //     } else if(type === 'preset') {
      //       delete modV.profiles[profile].presets[name];
      //     } else if(type === 'image') {
      //       delete modV.profiles[profile].images[name];
      //     } else if(type === 'video') {
      //       delete modV.profiles[profile].videos[name];
      //     }

      //     break;
      }

      // modV.mediaSelectors.forEach(function(ms) {
      //   ms.update(modV.profiles);
      // });

      // modV.profileSelectors.forEach(function(ps) {
      //   ps.update(modV.profiles);
      // });

      // let presetSelectNode = document.querySelector('#loadPresetSelect');
      // if(!presetSelectNode) return;

      // presetSelectNode.innerHTML = '';

      // let options = [];

      // forIn(modV.profiles, (profileName, profile) => {
      //   forIn(profile.presets, (presetName, preset) => {
      //     if(presetSelectNode) {
      //       var optionNode = document.createElement('option');
      //       optionNode.value = presetName;
      //       optionNode.textContent = presetName;

      //       options.push(optionNode);
      //     }

      //     modV.presets[presetName] = preset;
      //   });
      // });

      // options.sort((a, b) => {
      //   return a.textContent.localeCompare(b.textContent);
      // });

      // options.forEach(node => {
      //   presetSelectNode.appendChild(node);
      // });
    }
  }
}

export default MediaManagerClient;
