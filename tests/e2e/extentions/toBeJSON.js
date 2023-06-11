export function toBeJSON(received) {
  const pass = JSON.parse(received);

  if (pass) {
    return {
      message: () => "passed",
      pass: true
    };
  } else {
    return {
      message: () => "failed",
      pass: false
    };
  }
}
