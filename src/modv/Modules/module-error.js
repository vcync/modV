export default function ModuleError(message) {
  // Grab the stack
  this.stack = (new Error()).stack;

  // Parse the stack for some helpful debug info
  const reg = /\((.*?)\)/;
  let stackInfo = this.stack.split('\n').pop().trim();
  try {
    stackInfo = reg.exec(stackInfo)[0];
  } catch (e) {
    //
  }

  // Expose name and message
  this.name = 'modV.Module Error';
  this.message = `${message}  ${(stackInfo || '')}`;
}
