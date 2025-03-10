import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("generates a preset with expected keys", async () => {
  const preset = await modVApp.generatePreset();

  const expectedPresetKeys = [
    "expressions",
    "groups",
    "inputs",
    "midi",
    "modules",
    "tweens",
  ];

  expect(preset).toBeDefined();
  expect(preset).toBeJSON();
  expect(expectedPresetKeys.sort()).toEqual(
    Object.keys(JSON.parse(preset)).sort(),
  );
});
