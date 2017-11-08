/* global window */
import url from "url";

export function newRequest() {
  return new window.XMLHttpRequest();
}

export function resolveUrl(origin, link) {
  let path = url.parse(origin).path;
  // console.log(path);
  return "http://"+origin.replace(path, "") + link;
}
