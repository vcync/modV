import { expect } from "@playwright/test";
import extensions from "./tests/e2e/extentions";

expect.extend(extensions);

const config = {
  testDir: "./tests/e2e"
};

export default config;
