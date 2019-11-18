let _frames = 0;

function tick() {
  return _frames++;
}

function frames() {
  return _frames;
}

export { tick, frames };
