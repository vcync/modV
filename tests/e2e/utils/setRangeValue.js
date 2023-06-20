export function setRangeValue(locator, value) {
  return locator.evaluate((e, value) => {
    e.value = value;
    e.dispatchEvent(new Event("input", { bubbles: true }));
    e.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
