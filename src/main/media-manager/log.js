/* eslint-disable no-console */
const consoleLog = console.log;
const consoleError = console.error;

function log(...argsIn) {
  const delta = new Date();
  const args = [];
  args.push(`[${delta.toLocaleTimeString()}]:`);

  for (let i = 0; i < argsIn.length; i += 1) {
    args.push(argsIn[i]);
  }
  consoleLog.apply(console, args);
}

function logError(...argsIn) {
  const delta = new Date();
  const args = [];
  args.push(`[${delta.toLocaleTimeString()}]:`);

  for (let i = 0; i < argsIn.length; i += 1) {
    args.push(argsIn[i]);
  }
  consoleError.apply(console, args);
}

export { log, logError };
