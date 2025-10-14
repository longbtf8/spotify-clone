import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//  seconds -> "m:ss"
function toMMSS(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
