import { createStore } from "vuex";

import dialogs from "./modules/dialogs.js";
import focus from "./modules/focus.js";
import infoView from "./modules/infoView.js";
import search from "./modules/search.js";
import uiGroups from "./modules/ui-groups.js";
import uiModules from "./modules/ui-modules.js";

export default createStore({
  modules: {
    dialogs,
    focus,
    infoView,
    search,
    uiGroups,
    uiModules,
  },
  strict: false,
});
