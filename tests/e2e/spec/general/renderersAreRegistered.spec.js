import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("renderers are registered", async () => {
  const expectedRenderers = ["2d", "isf", "shader", "three"];

  const { renderers } = await modVApp.evaluateMainState();

  expect(expectedRenderers.sort()).toEqual(Object.keys(renderers).sort());
});
