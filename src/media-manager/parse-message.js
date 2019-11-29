import store from "./store";
import { log } from "./log";

export default function parseMessage(message, connection) {
  const parsed = JSON.parse(message);
  log(`Received message from client: ${message}`);

  if ("request" in parsed) {
    switch (parsed.request) {
      default:
        break;

      case "update":
        this.broadcast(
          JSON.stringify({
            type: "media/UPDATE",
            payload: {
              media: store.state.media,
              plugins: store.state.plugins
            }
          })
        );
        break;

      case "save-option":
        this.writeOptions(parsed.key, parsed.value);
        break;

      case "set-folder":
        this.changeDirectory(parsed.folder);
        break;

      case "make-profile":
        if (this.makeProfile(parsed.profileName)) {
          this.getOrMakeProfile(parsed.profileName);
          this.updateClients();
        }
        break;

      case "save-preset":
        this.writePreset(
          parsed.name,
          parsed.payload,
          parsed.profile,
          connection
        );
        break;

      case "save-palette":
        this.writePalette(
          parsed.name,
          parsed.payload,
          parsed.profile,
          connection
        );
        break;

      case "save-plugin":
        this.writePlugin(
          parsed.name,
          parsed.payload,
          parsed.profile,
          connection
        );
        break;
    }
  }
}
