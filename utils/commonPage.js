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
function updatePlayer(track) {
  const playerImage = $(".player-image");
  const playerTitle = $(".player-title");
  const playerArtist = $(".player-artist");
  const audio = $("#audio");
  playerImage.src = `${track.image_url}`;
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist_name;
  audio.src = `${track.audio_url}`;
}
export { $, $$, toMMSS, updatePlayer };
