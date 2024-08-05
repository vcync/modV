import { log } from "./log";
import store from "./store";

export default async function addReadHandler({ saveHandler }) {
  await store.dispatch("saveHandlers/addHandler", { saveHandler });
  log(`Added SaveHandler for ${saveHandler.folder}`);
}
