import React from 'react'
import {notification} from 'antd';

function msToHHMMSS(s) {
  let ms = s % 1000;
  s = (s - ms) / 1000;
  let secs = s % 60;
  s = (s - secs) / 60;
  let mins = s % 60;
  let hrs = (s - mins) / 60;
  return `${("00"+hrs).slice(-2)}:${("00"+mins).slice(-2)}:${("00."+secs).slice(-2)}.${ms}`;
}

const URLPattern = "^(http://www.|https://www.|http://|https://)?[a-z0-9]+([-.]{1}[a-z0-9]+)*(:[0-9]{1,5})?(/.*)?$";

function validURL(str) {
  const pattern = new RegExp(URLPattern,'i');
  return !!pattern.test(str);
}

function errorNotification(err) {
  const res = err.response ? err.response.data.err : "Request timed out.";

  let desc = res;
  if (typeof(res) === "object") {
    desc = [];
    for (var key in res) {
      desc.push(<li key={key}>{res[key]}</li>);
    }
  }
  notification.open({
    message: "Error",
    description: desc
  });
}

module.exports = {msToHHMMSS, validURL, URLPattern, errorNotification};
