import { defineConfig, expect } from "@playwright/test";
import extensions from "./tests/e2e/extentions";

expect.extend(extensions);

export default defineConfig({
  testDir: "./tests/e2e"
});
