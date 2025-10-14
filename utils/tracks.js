import httpRequest from "./httpRequest.js";
import { $, $$, toMMSS, updatePlayer } from "./commonPage.js";
import { handleArtistClick } from "./artist.js";

let currentContext = localStorage.getItem("currentContext") || "home";
let currentPlaylist = JSON.parse(localStorage.getItem("currentPlaylist")) || [];
let currentTrackIndex =
  parseInt(localStorage.getItem("currentTrackIndex")) || 0;
export async function showTodayBiggestHit() {
  const hitsGrid = $(".hits-grid");
  try {
    const data = await httpRequest.get("tracks/trending?limit=20");
    const hits = data.tracks
      .map((track) => {
        return `<div class="hit-card" data-track-id="${track.id}">
                  <div class="hit-card-cover">
                    <img
                      src="${track.image_url}"
                      alt="Flowers"
                    />
                    <button class="hit-play-btn">
                      <i class="fas fa-play"></i>
                    </button>
                  </div>
                  <div class="hit-card-info">
                    <h3 class="hit-card-title">${track.title}</h3>
                    <p class="hit-card-artist">${track.artist_name}</p>
                  </div>
                </div>`;
      })
      .join("");
    hitsGrid.innerHTML = hits;
    const hitsCard = $$(".hit-card");
    return hitsCard;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function showPopularArtists() {
  const artistsGrid = $(".artists-grid");
  try {
    const data = await httpRequest.get("artists/trending?limit=20");
    const artists = data.artists
      .map((artist) => {
        return `<div class="artist-card" data-artist-id="${artist.id}">
                <div class="artist-card-cover">
                  <img src="${artist.image_url}" alt="${artist.name}" />
                  <button class="artist-play-btn">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
                <div class="artist-card-info">
                  <h3 class="artist-card-name">${artist.name}</h3>
                  <p class="artist-card-type">Artist</p>
                </div>
              </div>`;
      })
      .join("");
    artistsGrid.innerHTML = artists;
    const artistCard = $$(".artist-card");
    return artistCard;
  } catch (error) {
    console.log(error);
  }
}
let playedSongsInShuffle = [];
export async function playerSongHome() {
  const hitsCards = await showTodayBiggestHit();
  const playerImage = $(".player-image");
  const playerTitle = $(".player-title");
  const playerArtist = $(".player-artist");
  const audio = $("#audio");
  hitsCards.forEach((hitsCard, index) => {
    hitsCard.addEventListener("click", async () => {
      const id = hitsCard.dataset.trackId;

      // cập nhật context và playlist
      currentContext = "home";
      currentPlaylist = Array.from(hitsCards).map(
        (card) => card.dataset.trackId
      );
      currentTrackIndex = index;
      // lấy id hiện tại
      playedSongsInShuffle = [id];

      // luu vao localstorage;
      localStorage.setItem("currentContext", currentContext);
      localStorage.setItem("currentPlaylist", JSON.stringify(currentPlaylist));
      localStorage.setItem("currentTrackIndex", currentTrackIndex);
      localStorage.setItem("currentSong", `${id}`);

      try {
        const track = await httpRequest.get(`tracks/${id}`);
        playerImage.src = `${track.image_url}`;
        playerTitle.textContent = track.title;
        playerArtist.textContent = track.artist_name;
        audio.src = `${track.audio_url}`;
        audioPlay();
      } catch (error) {
        console.log(error);
      }
    });
  });

  //  seconds -> "m:ss"
  function toMMSS(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  //artists
  const artistCards = await showPopularArtists();
  artistCards.forEach((artistCard) => {
    artistCard.addEventListener("click", () => {
      handleArtistClick(artistCard);
    });
  });
  // click follow
  const followBtn = $(".following-btn");
  followBtn.addEventListener("click", async () => {
    const artistId = followBtn.dataset.artistId;
    const isFollowing = followBtn.classList.contains("active");
    try {
      if (!isFollowing) {
        await httpRequest.post(`artists/${artistId}/follow`);
        followBtn.textContent = "Following";
        followBtn.classList.add("active");
      } else {
        await httpRequest.del(`artists/${artistId}/follow`);
        followBtn.textContent = "Follow";
        followBtn.classList.remove("active");
      }
    } catch (error) {
      if (error?.response?.error?.code === "ALREADY_FOLLOWING") {
        alert(error?.response?.error?.message);
      }
      if (error?.response?.error?.code === "NOT_FOLLOWING") {
        alert("Not following this artist");
      }
      if (error?.response?.error?.code === "AUTH_HEADER_MISSING") {
        alert("Vui lòng đăng nhập để được follow");
      }
      if (error?.response?.error?.code === "ARTIST_NOT_FOUND") {
        alert("ARTIST_NOT_FOUND");
      }
      if (error?.response?.error?.code === "TOKEN_EXPIRED") {
        alert("Vui lòng đăng nhập lại");
      }
    }
  });
  const contentWrapper = $(".content-wrapper");
  const artistSeparate = $(".artist-separate");
  const trackList = $(".track-list");
  // click Home
  $(".home-btn").addEventListener("click", () => {
    {
      contentWrapper.classList.add("show");
      artistSeparate.classList.remove("show");
      trackList.innerHTML = "";
      currentContext = "home";
      localStorage.setItem("currentContext", "home");
    }
  });
  $(".logo i").addEventListener("click", () => {
    {
      contentWrapper.classList.add("show");
      artistSeparate.classList.remove("show");
      trackList.innerHTML = "";
      currentContext = "home";
      localStorage.setItem("currentContext", "home");
    }
  });

  // player
  async function audioPlay() {
    await audio.play();
    playPlayerBtn.querySelector("i").classList.add("fa-pause");
    playPlayerBtn.querySelector("i").classList.remove("fa-play");
  }
  async function audioPause() {
    audio.pause();
    playPlayerBtn.querySelector("i").classList.remove("fa-pause");
    playPlayerBtn.querySelector("i").classList.add("fa-play");
  }
  const playPlayerBtn = $(".play-btn");
  playPlayerBtn.addEventListener("click", async () => {
    if (audio.paused) {
      audioPlay();
    } else {
      audioPause();
    }
  });

  // function handle next
  async function handleNextSong() {
    if (currentPlaylist.length === 0) return;
    let nextTrackId;
    if (isShuffle) {
      nextTrackId = handleTurnShuffle();
    } else {
      currentTrackIndex =
        (currentTrackIndex + currentPlaylist.length + 1) %
        currentPlaylist.length;
      nextTrackId = currentPlaylist[currentTrackIndex];
    }
    localStorage.setItem("currentTrackIndex", currentTrackIndex);
    localStorage.setItem("currentSong", nextTrackId);
    try {
      const track = await httpRequest.get(`tracks/${nextTrackId}`);
      updatePlayer(track);
      await audioPlay();
    } catch (error) {}
  }
  // function handle pre

  async function handlePrevSong() {
    if (currentPlaylist.length === 0) return;
    let prevTrackId;

    // Logic mới: Nếu shuffle đang bật VÀ đã có lịch sử (>1 bài), thì dùng lịch sử shuffle.
    // Nếu không, sẽ lùi về bài trước đó theo thứ tự playlist gốc.
    if (isShuffle && playedSongsInShuffle.length > 1) {
      playedSongsInShuffle.pop(); // Bỏ bài hát hiện tại
      prevTrackId = playedSongsInShuffle[playedSongsInShuffle.length - 1]; // Lấy bài trước đó
      currentTrackIndex = currentPlaylist.indexOf(prevTrackId);
    } else {
      // Fallback: Lùi bài theo thứ tự playlist gốc
      currentTrackIndex =
        (currentTrackIndex - 1 + currentPlaylist.length) %
        currentPlaylist.length;
      prevTrackId = currentPlaylist[currentTrackIndex];
    }

    localStorage.setItem("currentTrackIndex", currentTrackIndex);
    localStorage.setItem("currentSong", prevTrackId);
    try {
      const track = await httpRequest.get(`tracks/${prevTrackId}`);
      updatePlayer(track);
      await audioPlay();
    } catch (error) {
      console.error("Không thể lùi bài hát:", error);
    }
  }

  //  handle next/prev
  const nextBtn = $(`button[data-tooltip="Next"]`);
  const prevBtn = $(`button[data-tooltip="Previous"]`);
  const repeatBtn = $(`button[data-tooltip="Repeat"]`);
  const shuffleBtn = $(`.shuffle`);
  let isRepeat = localStorage.getItem("isRepeat") === "true";
  let isShuffle = localStorage.getItem("isShuffle") === "true";
  repeatBtn.classList.toggle("active", isRepeat);
  shuffleBtn.classList.toggle("active", isShuffle);
  //progress
  const progressHandle = $(".progress-handle");
  const progressFill = $(".progress-fill");
  const currentTimeEl = $(".time:first-child");
  const durationTimeEl = $(".time:last-child");
  const progressBar = $(".progress-bar");
  let isDraggingProgress = false;

  // event progress
  function updateProgress(clientX) {
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    );
    document.documentElement.style.setProperty(
      "--progressWidth",
      `${percent}%`
    );
    const newTime = (percent * audio.duration) / 100;
    currentTimeEl.textContent = toMMSS(newTime);
    return newTime;
  }
  progressBar.addEventListener("mousedown", (e) => {
    isDraggingProgress = true;
    updateProgress(e.clientX);
    e.preventDefault();
  });
  progressBar.addEventListener("touchstart", (e) => {
    isDraggingProgress = true;
    updateDuration(e.touches[0].clientX);
  });

  document.addEventListener("mouseup", (e) => {
    if (isDraggingProgress) {
      const newTime = updateProgress(e.clientX);
      audio.currentTime = newTime;
      isDraggingProgress = false;
      progressHandle.classList.remove("show");
      progressFill.classList.remove("show");
      document.body.style.userSelect = "";
    }
  });
  document.addEventListener("touchend", (e) => {
    if (isDraggingProgress) {
      const newTime = updateProgress(e.changedTouches[0].clientX);
      audio.currentTime = newTime;
      isDraggingProgress = false;
      progressHandle.classList.remove("show");
      progressFill.classList.remove("show");
      document.body.style.userSelect = "";
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDraggingProgress) {
      updateProgress(e.clientX);
      progressHandle.classList.add("show");
      progressFill.classList.add("show");
      document.body.style.userSelect = "none";
    }
  });
  document.addEventListener("touchmove", (e) => {
    if (isDraggingProgress) {
      updateProgress(e.touches[0].clientX);
      progressHandle.classList.add("show");
      progressFill.classList.add("show");
      document.body.style.userSelect = "none";
    }
  });

  //event player

  nextBtn.addEventListener("click", () => {
    handleNextSong();
  });
  prevBtn.addEventListener("click", () => {
    handlePrevSong();
  });
  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
    localStorage.setItem("isRepeat", isRepeat);
  });
  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    localStorage.setItem("isShuffle", isShuffle);
    // Reset shuffle history khi bật/tắt shuffle
    playedSongsInShuffle = [currentPlaylist[currentTrackIndex]];
  });

  // shuffle
  function handleTurnShuffle() {
    let availableTracks = currentPlaylist.filter(
      (trackId) => !playedSongsInShuffle.includes(trackId)
    );
    if (availableTracks.length === 0) {
      // Đặt lại lịch sử nhưng giữ lại bài hiện tại để không bị lặp lại ngay
      playedSongsInShuffle = [currentPlaylist[currentTrackIndex]];
      availableTracks = currentPlaylist.filter(
        (trackId) => !playedSongsInShuffle.includes(trackId)
      );
    }
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    const selectedTrackId = availableTracks[randomIndex];
    playedSongsInShuffle.push(selectedTrackId);

    currentTrackIndex = currentPlaylist.indexOf(selectedTrackId);

    return selectedTrackId;
  }
  // audio
  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.play();
      audio.currentTime = 0;
    } else {
      handleNextSong();
    }
  });
  audio.addEventListener("timeupdate", () => {
    if (!isDraggingProgress) {
      const percent = (audio.currentTime / audio.duration) * 100;
      document.documentElement.style.setProperty(
        "--progressWidth",
        `${percent}%`
      );
      currentTimeEl.textContent = toMMSS(audio.currentTime);
    }
  });

  //update duration
  function updateDuration() {
    if (audio.duration) {
      durationTimeEl.textContent = toMMSS(audio.duration);
    }
  }
  // volume
  const volumeBar = $(".volume-bar");
  const volumeFill = $(".volume-fill");
  const volumeHandle = $(".volume-handle");
  let isDraggingVolume = false;

  function updateVolume(clientX) {
    const rect = volumeBar.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(((clientX - rect.left) / rect.width) * 100, 100)
    );
    const volume = percent / 100;
    audio.volume = volume;
    document.documentElement.style.setProperty(
      "--progressVolume",
      `${percent}%`
    );
    localStorage.setItem("playerVolume", volume);
    return percent;
  }
  // event volume
  function checkVolume(volume) {
    if (volume >= 50) {
      $(`.volumeAudio i`).classList.add("fa-volume-up");
      $(`.volumeAudio i`).classList.remove("fa-volume-down");
    }
    if (volume <= 50) {
      $(`.volumeAudio i`).classList.remove("fa-volume-mute");
      $(`.volumeAudio i`).classList.remove("fa-volume-up");
      $(`.volumeAudio i`).classList.add("fa-volume-down");
    }
    if (volume === 0) {
      $(`.volumeAudio i`).classList.remove("fa-volume-down");
      $(`.volumeAudio i`).classList.add("fa-volume-mute");
    }
  }
  // bật tắt audio
  let lastVolume = 1;
  $(`.volumeAudio i`).addEventListener("click", () => {
    if (audio.volume > 0) {
      lastVolume = audio.volume;
      audio.volume = 0;
      checkVolume(0);
      document.documentElement.style.setProperty("--progressVolume", `0%`);
    } else {
      audio.volume = lastVolume;
      checkVolume(lastVolume);
      const percentVolume = lastVolume * 100;
      document.documentElement.style.setProperty(
        "--progressVolume",
        `${percentVolume}%`
      );
    }
  });
  volumeBar.addEventListener("mousedown", (e) => {
    isDraggingVolume = true;
    updateVolume(e.clientX);
    e.preventDefault();
  });

  volumeBar.addEventListener("touchstart", (e) => {
    isDraggingVolume = true;
    updateVolume(e.touches[0].clientX);
  });
  document.addEventListener("mouseup", (e) => {
    if (isDraggingVolume) {
      const volumePercent = updateVolume(e.clientX);
      isDraggingVolume = false;

      checkVolume(volumePercent);
      volumeFill.classList.remove("show");

      volumeHandle.classList.remove("show");
    }
  });

  document.addEventListener("touchend", (e) => {
    if (isDraggingVolume) {
      const volumePercent = updateVolume(e.changedTouches[0].clientX);
      checkVolume(volumePercent);
      isDraggingVolume = false;
      volumeHandle.classList.remove("show");
      volumeFill.classList.remove("show");
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDraggingVolume) {
      const volumePercent = updateVolume(e.clientX);
      checkVolume(volumePercent);
      volumeFill.classList.add("show");
      volumeHandle.classList.add("show");
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (isDraggingVolume) {
      const volumePercent = updateVolume(e.touches[0].clientX);
      checkVolume(volumePercent);
      volumeFill.classList.add("show");
      volumeHandle.classList.add("show");
    }
  });
  const volumeAudio = localStorage.getItem("playerVolume");
  if (volumeAudio) {
    audio.volume = parseFloat(volumeAudio);
    document.documentElement.style.setProperty(
      "--progressVolume",
      `${volumeAudio * 100}%`
    );
    const volumePercent = volumeAudio * 100;
    checkVolume(volumePercent);
  }

  audio.addEventListener("loadedmetadata", updateDuration);
  audio.addEventListener("durationchange", updateDuration);
  audio.addEventListener("canplay", updateDuration);
  //  lấy ra hit hiện tại
  const currentSong = localStorage.getItem("currentSong");
  if (currentSong) {
    try {
      const track = await httpRequest.get(`tracks/${currentSong}`);
      updatePlayer(track);
    } catch (error) {
      console.log(error);
    }
  }
  function updatePlayer(track) {
    playerImage.src = `${track.image_url}`;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist_name;
    audio.src = `${track.audio_url}`;
  }
}
