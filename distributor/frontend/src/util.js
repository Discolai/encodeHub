function msToHHMMSS(s) {
  let ms = s % 1000;
  s = (s - ms) / 1000;
  let secs = s % 60;
  s = (s - secs) / 60;
  let mins = s % 60;
  let hrs = (s - mins) / 60;
  return `${("00"+hrs).slice(-2)}:${("00"+mins).slice(-2)}:${("00."+secs).slice(-2)}.${ms}`;
}

module.exports = {msToHHMMSS};
