import { modVApp } from ".";

const tab = strings => `.lm_tab[title="${[...strings].join("")}"]`;

export const tabs = {
  getLocators() {
    const { page } = modVApp;
    return {
      inputConfig: page.locator(tab`Input Config`)
    };
  }
};
