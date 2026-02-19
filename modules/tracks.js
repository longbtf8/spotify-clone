import httpRequest from "../service/httpRequest.js";
import { $, $$, toMMSS } from "../utils/commonPage.js";
import { handleArtistClick } from "./artist.js";
import { setContext } from "./player.js"; // ← thêm dòng này

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

  // ── hit cards: thay ~20 dòng localStorage + fetch bằng setContext ──
  hitsCards.forEach((hitsCard, index) => {
    hitsCard.addEventListener("click", () => {
      const ids = Array.from(hitsCards).map((c) => c.dataset.trackId);
      setContext("home", ids, index); // ← thay toàn bộ khối cũ
    });
  });

  // artists
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
  const playlistSeparate = $(".playlist-separate");
  const trackList = $(".track-list");

  // click Home
  $(".home-btn").addEventListener("click", () => {
    contentWrapper.classList.add("show");
    artistSeparate.classList.remove("show");
    playlistSeparate.classList.remove("show");
    trackList.innerHTML = "";
    localStorage.setItem("currentContext", "home");
  });
  $(".logo i").addEventListener("click", () => {
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
      // renderTrackInfo đã được initPlayer() lo, không cần làm lại ở đây
    } catch (error) {
      console.log(error);
    }
  }
}
