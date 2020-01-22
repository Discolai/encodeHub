function msToHHMMSS(s) {
  let ms = s % 1000;
  s = (s - ms) / 1000;
  let secs = s % 60;
  s = (s - secs) / 60;
  let mins = s % 60;
  let hrs = (s - mins) / 60;
  return `${("00"+hrs).slice(-2)}:${("00"+mins).slice(-2)}:${("00."+secs).slice(-2)}.${ms}`;
}

const URLPattern = "^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*(:[0-9]{1,5})?(\/.*)?$";

function validURL(str) {
  const pattern = new RegExp(URLPattern,'i');
  return !!pattern.test(str);
}

module.exports = {msToHHMMSS, validURL, URLPattern};
