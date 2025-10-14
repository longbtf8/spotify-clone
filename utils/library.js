import httpRequest from "./httpRequest.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export function showFlowerArtist() {
  const artistBtn = $(".artistBtn");
  const libraryContent = $(".library-content");
  artistBtn.addEventListener("click", async () => {
    try {
      const data = await httpRequest.get("me/following?limit=20&offset=0");
      if (data.artists.length > 0) {
        const artistFollow = data.artists
          .map((artist) => {
            return `<div class="library-item" >
              <img
                src="${artist.image_url}"
                alt="Đen"
                class="item-image"
              />
              <div class="item-info">
                <div class="item-title">${artist.name}</div>
                <div class="item-subtitle">Artist</div>
              </div>
            </div>`;
          })
          .join("");
        libraryContent.innerHTML = artistFollow;
      }
    } catch (_) {}
  });
}
const id = hitsCard.dataset.trackId;

// cập nhật context và playlist
currentContext = "home";
currentPlaylist = Array.from(hitsCards).map((card) => card.dataset.trackId);
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
