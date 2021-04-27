export default function map(value, low1, high1, low2, high2) {
  // eslint-disable-next-line
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
