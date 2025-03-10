/*
 * In relation to: https://github.com/vcync/modv-3/issues/129
 *
 * The frame-counter will not overflow in a normal session of modV.
 *
 * We can determine the maximum safe integer in JavaScript with `Number.MAX_SAFE_INTEGER`.
 * In V8 at the time of writing this is 9007199254740991.
 *
 * That's nine quadrillion, seven trillion, one hundred and ninety-nine billion,
 * two hundred and fifty-four million, seven hundred and forty thousand and nine hundred
 * and ninety-one.
 *
 * We use the following formula to calculate when, in days, this will reach the max safe int:
 * max_int / (frames_per_second * (seconds_in_a_minute * minutes_in_an_hour) / hours_in_a_day)
 *
 * At an average screen refresh of 60fps:
 * Number.MAX_SAFE_INTEGER / (60 * (60 * 60) / 24)
 * = 1000799917193.4435
 *
 * In years, this is:
 * 1000799917193.4435 / 365
 * = 2741917581.3519
 *
 * Of course this doesn't account for leap years, but we're pretty safe.
 * Unless you have a time-machine and somewhere safe to hide a computer running modV…
 */

let _frames = 0;

function tick() {
  return _frames++;
}

function frames() {
  return _frames;
}

export { tick, frames };
