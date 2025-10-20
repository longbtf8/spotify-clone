import httpRequest from "./httpRequest.js";
import { toMMSS, updatePlayer } from "./commonPage.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
let currentContext = localStorage.getItem("currentContext") || "home";
let currentPlaylist = JSON.parse(localStorage.getItem("currentPlaylist")) || [];
let currentTrackIndex =
  parseInt(localStorage.getItem("currentTrackIndex")) || 0;
let playedSongsInShuffle = [];

export async function handleArtistClick(artistCard) {
  const id = artistCard.dataset.artistId;
  const contentWrapper = $(".content-wrapper");
  const artistSeparate = $(".artist-separate");
  const playlistSeparate = $(".playlist-separate ");
  const heroImage = $(".hero-image");
  const artistName = $(".artist-name");
  const monthlyListeners = $(".monthly-listeners");
  const trackList = $(".track-list");
  const followBtn = $(".following-btn");
  const audio = $("#audio");
  async function audioPlay() {
    try {
      await audio.play();
      const playPlayerBtn = $(".play-btn");
      playPlayerBtn.querySelector("i").classList.add("fa-pause");
      playPlayerBtn.querySelector("i").classList.remove("fa-play");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error playing audio:", error);
      }
    }
  }
  async function audioPause() {
    await audio.pause();
    const playPlayerBtn = $(".play-btn");
    playPlayerBtn.querySelector("i").classList.remove("fa-pause");
    playPlayerBtn.querySelector("i").classList.add("fa-play");
  }
  const updateFollowState = (isFollowing) => {
    if (isFollowing) {
      followBtn.textContent = "Following";
      followBtn.classList.add("active");
    } else {
      followBtn.textContent = "Follow";
      followBtn.classList.remove("active");
    }
    followBtn.dataset.artistId = id;
  };
  const checkFollowStatus = async () => {
    try {
      const follow = await httpRequest.get(`artists/${id}`);
      const isFollowing = follow.is_following;
      updateFollowState(isFollowing);
    } catch (error) {
      console.log("Cần đăng nhập để sử dụng chức năng này", error);
      // Có thể ẩn nút follow nếu người dùng chưa đăng nhập
      followBtn.style.display = "none";
    }
  };
  try {
    const artistInformation = await httpRequest.get(`artists/${id}`);
    contentWrapper.classList.remove("show");
    artistSeparate.classList.add("show");
    playlistSeparate.classList.remove("show");
    heroImage.src = `${artistInformation.background_image_url}`;
    artistName.textContent = artistInformation.name;
    monthlyListeners.textContent = `${artistInformation.monthly_listeners} monthly listeners `;
    if (artistInformation.is_verified) {
      $(".verified-badge i").classList.add("show");
    }

    await checkFollowStatus();
    const artistTracks = await httpRequest.get(`artists/${id}/tracks/popular`);
    const playBtnLarge = $(".play-btn-large");
    const playBtnLargeIcon = playBtnLarge.querySelector("i");
    // click phát nhạc đầu tiên
    $(".play-btn-large").addEventListener("click", async () => {
      if (artistTracks.tracks && artistTracks.tracks.length > 0) {
        const firstTrack = artistTracks.tracks[0];
        const firstTrackId = firstTrack.id;
        currentContext = "artist";
        currentPlaylist = artistTracks.tracks.map((trackId) => {
          return trackId.id;
        });
        currentTrackIndex = 0;
        playedSongsInShuffle = [firstTrackId];

        //luu vao local
        localStorage.setItem("currentContext", currentContext);
        localStorage.setItem(
          "currentPlaylist",
          JSON.stringify(currentPlaylist)
        );
        localStorage.setItem("currentTrackIndex", String(currentTrackIndex));

        localStorage.setItem("currentSong", firstTrackId);
        // if (audio.paused || audio.src !== firstTrack.audio_url) {
        //   updatePlayer(firstTrack);
        //   await audioPlay();
        //   playBtnLargeIcon.classList.remove("fa-play");
        //   playBtnLargeIcon.classList.add("fa-pause");
        // } else {
        //   audioPause();
        //   playBtnLargeIcon.classList.remove("fa-pause");
        //   playBtnLargeIcon.classList.add("fa-play");
        // }
        updatePlayer(firstTrack);
        await audioPlay();
      }
    });
    // audio.addEventListener("play", () => {
    //   playBtnLargeIcon.classList.remove("fa-play");
    //   playBtnLargeIcon.classList.add("fa-pause");
    // });

    // audio.addEventListener("pause", () => {
    //   playBtnLargeIcon.classList.remove("fa-pause");
    //   playBtnLargeIcon.classList.add("fa-play");
    // });

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
            <div class="track-plays">${(artistTrack.play_count || 27,
            498,
            341).toLocaleString()}</div>
            <div class="track-duration">${toMMSS(artistTrack.duration)}</div>
            <button class="track-menu-btn">
              <i class="fas fa-ellipsis-h"></i>
            </button>
          </div>`;
      })
      .join("");
    trackList.innerHTML = artistTrack;
    const trackItems = $$(".track-item");
    trackItems.forEach((trackItem, index) => {
      trackItem.addEventListener("click", async () => {
        const artistTrackId = trackItem.dataset.artistTrackId;

        // Cập nhật context và playlist cho artist
        currentContext = "artist";
        currentPlaylist = Array.from(trackItems).map(
          (item) => item.dataset.artistTrackId
        );
        currentTrackIndex = index;
        playedSongsInShuffle = [artistTrackId];

        // Lưu vào localStorage
        localStorage.setItem("currentContext", currentContext);
        localStorage.setItem(
          "currentPlaylist",
          JSON.stringify(currentPlaylist)
        );
        localStorage.setItem("currentTrackIndex", String(currentTrackIndex));

        localStorage.setItem("currentSong", artistTrackId);

        // Cập nhật context và playlist cho artist
        currentContext = "artist";
        currentPlaylist = Array.from(trackItems).map(
          (item) => item.dataset.artistTrackId
        );
        currentTrackIndex = index;

        const track = await httpRequest.get(`tracks/${artistTrackId}`);
        updatePlayer(track);
        await audioPlay();
        localStorage.setItem("currentSong", artistTrackId);
      });
    });
  } catch (error) {
    console.log(error);
  }
}
