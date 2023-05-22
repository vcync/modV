import { defineConfig, expect } from "@playwright/test";
import extensions from "./tests/e2e/extentions";

expect.extend(extensions);

export default defineConfig({
  testDir: "./tests/e2e/spec",
  workers: process.env.CI ? 1 : 2
});
