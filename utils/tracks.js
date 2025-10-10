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
export async function playerSongHome() {
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
  const contentWrapper = $(".content-wrapper");
  const artistSeparate = $(".artist-separate");
  const heroImage = $(".hero-image");
  const artistName = $(".artist-name");
  const monthlyListeners = $(".monthly-listeners");
  const trackList = $(".track-list");
  // lặp từng artistCard ngoài home
  artistCards.forEach((artistCard) => {
    artistCard.addEventListener("click", async () => {
      const id = artistCard.dataset.artistId;
      try {
        const artistInformation = await httpRequest.get(`artists/${id}`);
        contentWrapper.classList.remove("show");
        artistSeparate.classList.add("show");
        heroImage.src = `${artistInformation.background_image_url}`;
        artistName.textContent = artistInformation.name;
        monthlyListeners.textContent = `${artistInformation.monthly_listeners} monthly listeners `;
        if (artistInformation.is_verified) {
          $(".verified-badge i").classList.add("show");
        }

        const artistTracks = await httpRequest.get(
          `artists/${id}/tracks/popular`
        );
        console.log(artistTracks);
        //  lấy nhạc của artist
        const artistTrack = artistTracks.tracks
          .map((artistTrack, index) => {
            return `<div class="track-item" data-artist-track-id="${
              artistTrack.id
            }">
                <div class="track-number">${index + 1}</div>
                <div class="track-image">
                  <img
                    src="${artistTrack.image_url}"
                    alt="${artistTrack.title}"
                  />
                </div>
                <div class="track-info">
                  <div class="track-name">${artistTrack.title}</div>
                </div>
                <div class="track-plays">27,498,341</div>
                <div class="track-duration">${toMMSS(
                  artistTrack.duration
                )}</div>
                <button class="track-menu-btn">
                  <i class="fas fa-ellipsis-h"></i>
                </button>
              </div>`;
          })
          .join("");
        trackList.innerHTML = artistTrack;
        const trackItems = $$(".track-item");
        trackItems.forEach((trackItem) => {
          trackItem.addEventListener("click", async () => {
            const artistTrackId = trackItem.dataset.artistTrackId;
            console.log(artistTrackId);
            const track = await httpRequest.get(`tracks/${artistTrackId}`);
            playerImage.src = track.image_url;
            playerTitle.textContent = track.title;
            playerArtist.textContent = track.artist_name;
            audio.src = track.audio_url;
            await audioPlay();
            localStorage.setItem("currentSong", artistTrackId);
          });
        });
      } catch (error) {
        console.log(error);
      }
    });
  });

  // click Home
  $(".home-btn").addEventListener("click", () => {
    {
      contentWrapper.classList.add("show");
      artistSeparate.classList.remove("show");
      trackList.innerHTML = "";
    }
  });
  $(".logo i").addEventListener("click", () => {
    {
      contentWrapper.classList.add("show");
      artistSeparate.classList.remove("show");
      trackList.innerHTML = "";
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
}
