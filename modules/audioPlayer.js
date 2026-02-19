import httpRequest from "../service/httpRequest.js";
import { $, toMMSS } from "../utils/commonPage.js";

//  STATE
const state = {
  playlist: [],
  index: 0,
  context: "home",
  shuffleHistory: [],
  isRepeat: false,
  isShuffle: false,
};

function getLocalStorage() {
  state.playlist = JSON.parse(localStorage.getItem("currentPlaylist")) || [];
  state.index = parseInt(localStorage.getItem("currentTrackIndex")) || 0;
  state.context = localStorage.getItem("currentContext") || "home";
  state.isRepeat = localStorage.getItem("isRepeat") === "true";
  state.isShuffle = localStorage.getItem("isShuffle") === "true";
  state.shuffleHistory =
    JSON.parse(localStorage.getItem("playedSongsInShuffle")) || [];
}

function setLocalStorage() {
  localStorage.setItem("currentPlaylist", JSON.stringify(state.playlist));
  localStorage.setItem("currentTrackIndex", String(state.index));
  localStorage.setItem("currentContext", state.context);
  localStorage.setItem("isRepeat", state.isRepeat);
  localStorage.setItem("isShuffle", state.isShuffle);
  localStorage.setItem(
    "playedSongsInShuffle",
    JSON.stringify(state.shuffleHistory),
  );
}

//  DOM
const audio = $("#audio");
const playerImage = $(".player-image");
const playerTitle = $(".player-title");
const playerArtist = $(".player-artist");
const playBtn = $(".play-btn");

const progressBar = $(".progress-bar");
const progressFill = $(".progress-fill");
const progressHandle = $(".progress-handle");
const currentTimeEl = $(".time:first-child");
const durationTimeEl = $(".time:last-child");

const volumeBar = $(".volume-bar");
const volumeFill = $(".volume-fill");
const volumeHandle = $(".volume-handle");
const volumeIcon = $(".volumeAudio i");

// UI
function setPlayIcon(isPlaying) {
  playBtn.querySelector("i").classList.toggle("fa-pause", isPlaying);
  playBtn.querySelector("i").classList.toggle("fa-play", !isPlaying);
}

export function renderTrackInfo(track) {
  playerImage.src = track.image_url;
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist_name;
  audio.src = track.audio_url;
  localStorage.setItem("currentSong", track.id ?? "");
}

//  PLAYBACK
export async function play() {
  try {
    await audio.play();
    setPlayIcon(true);
  } catch (e) {
    if (e.name !== "AbortError") console.error("Playback error:", e);
  }
}

export function pause() {
  audio.pause();
  setPlayIcon(false);
}

export function togglePlay() {
  audio.paused ? play() : pause();
}

async function loadAndPlay(trackId) {
  try {
    const track = await httpRequest.get(`tracks/${trackId}`);
    renderTrackInfo(track);
    await play();
  } catch (e) {
    console.error("loadAndPlay failed:", e);
  }
}

//  CONTEXT
/**
 * @param {"home"|"artist"|"playlist"} context
 * @param {[]} trackIds
 * @param {number}   startIndex
 */
export async function setContext(context, trackIds, startIndex = 0) {
  state.context = context;
  state.playlist = trackIds;
  state.index = startIndex;
  state.shuffleHistory = [trackIds[startIndex]];
  setLocalStorage();
  await loadAndPlay(trackIds[startIndex]); // fix bug cũ: truyền đúng id, không phải cả mảng
}

// ─── SHUFFLE HELPERS ──────────────────────────────────────────────────────────
function getShuffleNextIndex() {
  const available = state.playlist.filter(
    (id) => !state.shuffleHistory.includes(id),
  );
  // hết bài → reset, tránh lặp lại bài hiện tại ngay lập tức
  const pool = available.length
    ? available
    : state.playlist.filter((id) => id !== state.playlist[state.index]);

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  state.shuffleHistory.push(chosen);
  return state.playlist.indexOf(chosen);
}

function getShufflePrevIndex() {
  state.shuffleHistory.pop(); // bỏ bài hiện tại khỏi history
  const prevId = state.shuffleHistory[state.shuffleHistory.length - 1];
  return state.playlist.indexOf(prevId);
}

// ─── NEXT / PREV ──────────────────────────────────────────────────────────────
export async function next() {
  if (!state.playlist.length) return;
  state.index = state.isShuffle
    ? getShuffleNextIndex()
    : (state.index + 1) % state.playlist.length;
  setLocalStorage();
  await loadAndPlay(state.playlist[state.index]);
}

export async function prev() {
  if (!state.playlist.length) return;
  state.index =
    state.isShuffle && state.shuffleHistory.length > 1
      ? getShufflePrevIndex()
      : (state.index - 1 + state.playlist.length) % state.playlist.length;
  setLocalStorage();
  await loadAndPlay(state.playlist[state.index]);
}

//  REPEAT / SHUFFLE
function toggleRepeat(btn) {
  state.isRepeat = !state.isRepeat;
  btn.classList.toggle("active", state.isRepeat);
  setLocalStorage();
}

function toggleShuffle(btn) {
  state.isShuffle = !state.isShuffle;
  btn.classList.toggle("active", state.isShuffle);
  if (state.isShuffle) {
    // giữ bài đang phát
    state.shuffleHistory = [state.playlist[state.index]];
  }
  setLocalStorage();
}

//  AUDIO EVENTS
function bindAudioEvents() {
  audio.addEventListener("ended", () => {
    state.isRepeat ? ((audio.currentTime = 0), play()) : next();
  });

  audio.addEventListener("timeupdate", () => {
    if (isDraggingProgress) return;
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    document.documentElement.style.setProperty(
      "--progressWidth",
      `${percent}%`,
    );
    currentTimeEl.textContent = toMMSS(audio.currentTime);
  });

  const onMetaLoaded = () => {
    if (audio.duration) durationTimeEl.textContent = toMMSS(audio.duration);
  };
  ["loadedmetadata", "durationchange", "canplay"].forEach((ev) =>
    audio.addEventListener(ev, onMetaLoaded),
  );
}

//  PROGRESS BAR
let isDraggingProgress = false;

function calcProgress(clientX) {
  const rect = progressBar.getBoundingClientRect();
  return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
}

function onProgressStart(clientX, e) {
  isDraggingProgress = true;
  document.body.style.userSelect = "none";
  const pct = calcProgress(clientX);
  document.documentElement.style.setProperty("--progressWidth", `${pct}%`);
  currentTimeEl.textContent = toMMSS((pct * audio.duration) / 100);
  progressFill.classList.add("show");
  progressHandle.classList.add("show");
  e.preventDefault();
}

function onProgressMove(clientX) {
  if (!isDraggingProgress) return;
  const pct = calcProgress(clientX);
  document.documentElement.style.setProperty("--progressWidth", `${pct}%`);
  currentTimeEl.textContent = toMMSS((pct * audio.duration) / 100);
}

function onProgressEnd(clientX) {
  if (!isDraggingProgress) return;
  const pct = calcProgress(clientX);
  audio.currentTime = (pct * audio.duration) / 100;
  isDraggingProgress = false;
  document.body.style.userSelect = "";
  progressFill.classList.remove("show");
  progressHandle.classList.remove("show");
}

function bindProgressEvents() {
  // Click nhanh vào progress
  progressBar.addEventListener("click", (e) => {
    if (isDraggingProgress) return;
    const pct = calcProgress(e.clientX);
    audio.currentTime = (pct * audio.duration) / 100;
    document.documentElement.style.setProperty("--progressWidth", `${pct}%`);
  });

  // Mouse
  progressBar.addEventListener("mousedown", (e) =>
    onProgressStart(e.clientX, e),
  );
  document.addEventListener("mousemove", (e) => onProgressMove(e.clientX));
  document.addEventListener("mouseup", (e) => onProgressEnd(e.clientX));

  // Touch
  progressBar.addEventListener(
    "touchstart",
    (e) => onProgressStart(e.touches[0].clientX, e),
    { passive: false },
  );
  document.addEventListener(
    "touchmove",
    (e) => {
      if (!isDraggingProgress) return;
      onProgressMove(e.touches[0].clientX);
      e.preventDefault(); // chặn scroll trang khi đang kéo progress
    },
    { passive: false },
  );
  document.addEventListener("touchend", (e) =>
    onProgressEnd(e.changedTouches[0].clientX),
  );
}

//  VOLUME
let isDraggingVolume = false;
let lastVolume = 1;

function calcVolume(clientX) {
  const rect = volumeBar.getBoundingClientRect();
  return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
}

function updateVolumeIcon(pct) {
  volumeIcon.className =
    pct === 0
      ? "fas fa-volume-mute"
      : pct < 50
        ? "fas fa-volume-down"
        : "fas fa-volume-up";
}

function applyVolume(pct) {
  audio.volume = pct / 100;
  document.documentElement.style.setProperty("--progressVolume", `${pct}%`);
  localStorage.setItem("playerVolume", audio.volume);
  updateVolumeIcon(pct);
}

function onVolumeStart(clientX, e) {
  isDraggingVolume = true;
  applyVolume(calcVolume(clientX));
  volumeFill.classList.add("show");
  volumeHandle.classList.add("show");
  e.preventDefault();
}

function onVolumeMove(clientX) {
  if (!isDraggingVolume) return;
  applyVolume(calcVolume(clientX));
}

function onVolumeEnd(clientX) {
  if (!isDraggingVolume) return;
  applyVolume(calcVolume(clientX));
  isDraggingVolume = false;
  volumeFill.classList.remove("show");
  volumeHandle.classList.remove("show");
}

function bindVolumeEvents() {
  // Mute / unmute toggle
  volumeIcon.addEventListener("click", () => {
    if (audio.volume > 0) {
      lastVolume = audio.volume;
      applyVolume(0);
    } else {
      applyVolume(lastVolume * 100);
    }
  });

  // Click nhanh vào volume bar
  volumeBar.addEventListener("click", (e) => {
    if (isDraggingVolume) return;
    applyVolume(calcVolume(e.clientX));
  });

  // Mouse
  volumeBar.addEventListener("mousedown", (e) => onVolumeStart(e.clientX, e));
  document.addEventListener("mousemove", (e) => onVolumeMove(e.clientX));
  document.addEventListener("mouseup", (e) => onVolumeEnd(e.clientX));

  // Touch
  volumeBar.addEventListener(
    "touchstart",
    (e) => onVolumeStart(e.touches[0].clientX, e),
    { passive: false },
  );
  document.addEventListener(
    "touchmove",
    (e) => {
      if (!isDraggingVolume) return;
      onVolumeMove(e.touches[0].clientX);
      e.preventDefault(); // chặn scroll khi đang kéo volume
    },
    { passive: false },
  );
  document.addEventListener("touchend", (e) =>
    onVolumeEnd(e.changedTouches[0].clientX),
  );

  // Restore volume
  const saved = parseFloat(localStorage.getItem("playerVolume"));
  if (!isNaN(saved)) applyVolume(saved * 100);
}

// control
function bindControls() {
  playBtn.addEventListener("click", togglePlay);
  $(`[data-tooltip="Next"]`).addEventListener("click", next);
  $(`[data-tooltip="Previous"]`).addEventListener("click", prev);

  const repeatBtn = $(`[data-tooltip="Repeat"]`);
  const shuffleBtn = $(`.shuffle`);

  repeatBtn.classList.toggle("active", state.isRepeat);
  shuffleBtn.classList.toggle("active", state.isShuffle);

  repeatBtn.addEventListener("click", () => toggleRepeat(repeatBtn));
  shuffleBtn.addEventListener("click", () => toggleShuffle(shuffleBtn));
}

// innit
export async function initPlayer() {
  getLocalStorage();
  bindAudioEvents();
  bindProgressEvents();
  bindVolumeEvents();
  bindControls();

  // Restore bài đang phát dở khi reload trang
  const currentSong = localStorage.getItem("currentSong");
  if (currentSong) {
    try {
      const track = await httpRequest.get(`tracks/${currentSong}`);
      renderTrackInfo(track);
    } catch (e) {
      console.warn("Không thể restore bài hát:", e);
    }
  }
}
