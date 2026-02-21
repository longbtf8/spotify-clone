import httpRequest from "../service/httpRequest.js";
import { $, $$ } from "../utils/commonPage.js";
import { handleArtistClick } from "./artist.js";
import { getState, setContext, togglePlay } from "./audioPlayer.js";
import { appState } from "./state.js";

// UI showTodayBiggestHit
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
    const data = await httpRequest.get("albums/popular?limit=20");
    const artists = data.albums
      .map((artist) => {
        return `<div class="artist-card" data-artist-id="${artist.artist_id}">
                <div class="artist-card-cover">
                  <img src="${artist.artist_image_url}" alt="${artist.artist_name}" />
                  <button class="artist-play-btn">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
                <div class="artist-card-info">
                  <h3 class="artist-card-name">${artist.artist_name}</h3>
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

  hitsCards.forEach((hitsCard, index) => {
    const playBtn = hitsCard.querySelector(".hit-play-btn");
    // click nếu đang phát thì dừng nếu dừng thì phát
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const ids = Array.from(hitsCards).map((c) => c.dataset.trackId);
      const playList = JSON.parse(
        localStorage.getItem("currentPlaylist") || "[]",
      );
      const savedIndex = parseInt(
        localStorage.getItem("currentTrackIndex") || 0,
      );
      const isSameTrack =
        JSON.stringify(playList) === JSON.stringify(ids) &&
        savedIndex === index;
      if (isSameTrack) {
        togglePlay();
      } else {
        setContext("home", ids, index);
      }
    });

    // clickCard (không phải button thì luôn tải bài)
    hitsCard.addEventListener("click", (e) => {
      if (e.target.closest(".hit-play-btn")) return;
      const ids = Array.from(hitsCards).map((c) => c.dataset.trackId);
      setContext("home", ids, index);
    });
  });

  // artists
  const artistCards = await showPopularArtists();
  artistCards.forEach((artistCard) => {
    const artistPlayBtn = artistCard.querySelector(".artist-play-btn");

    artistPlayBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      console.log(appState.CURRENT_ARTIST_ID);
      const artistId = artistCard.dataset.artistId;
      const currentState = getState();
      if (
        currentState.context === "artist" &&
        currentState.artistId === artistId
      ) {
        togglePlay();
        return;
      }
      //  chưa phát thì phải fetch lấy dữ liệu
      try {
        const data = await httpRequest.get(
          `artists/${artistId}/tracks/popular`,
        );
        const trackIds = data.tracks.map((t) => t.id);
        if (trackIds.length > 0) {
          setContext("artist", trackIds, 0, artistId);
        }
      } catch (error) {
        console.error("Lỗi khi phát artist:", err);
      }
    });

    artistCard.addEventListener("click", () => {
      handleArtistClick(artistCard);
    });
  });

  const contentWrapper = $(".content-wrapper");
  const artistSeparate = $(".artist-separate");
  const playlistSeparate = $(".playlist-separate");
  const trackList = $(".track-list");

  // click Home
  $(".home-btn").addEventListener("click", () => {
    // xoá library active
    $$(".library-item").forEach((i) => i.classList.remove("active"));
    contentWrapper.classList.add("show");
    artistSeparate.classList.remove("show");
    playlistSeparate.classList.remove("show");
    trackList.innerHTML = "";
    localStorage.setItem("currentContext", "home");
  });
  $(".logo i").addEventListener("click", () => {
    // xoá library active
    $$(".library-item").forEach((i) => i.classList.remove("active"));
    contentWrapper.classList.add("show");
    playlistSeparate.classList.remove("show");
    artistSeparate.classList.remove("show");
    trackList.innerHTML = "";
    localStorage.setItem("currentContext", "home");
  });

  // lấy ra bài hiện tại khi reload trang
  const currentSong = localStorage.getItem("currentSong");
  if (currentSong) {
    try {
      const track = await httpRequest.get(`tracks/${currentSong}`);
    } catch (error) {
      console.log(error);
    }
  }
}
