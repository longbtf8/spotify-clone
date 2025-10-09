import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

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
  console.log("abc");
  try {
    const data = await httpRequest.get("artists/trending?limit=20");
    console.log(data);
    const artists = data.artists
      .map((artist) => {
        return `<div class="artist-card">
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
  } catch (error) {
    console.log(error);
  }
}
const hitsCards = await showTodayBiggestHit();
const playerImage = $(".player-image");
const playerTitle = $(".player-title");
const playerArtist = $(".player-artist");
const audio = $("#audio");
hitsCards.forEach((hitsCard) => {
  hitsCard.addEventListener("click", async () => {
    const id = hitsCard.dataset.trackId;
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
//  lấy ra hit hiện tại
const currentSong = localStorage.getItem("currentSong");
if (currentSong) {
  try {
    const track = await httpRequest.get(`tracks/${currentSong}`);
    playerImage.src = `${track.image_url}`;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist_name;
    audio.src = `${track.audio_url}`;
  } catch (error) {
    console.log(error);
  }
}
