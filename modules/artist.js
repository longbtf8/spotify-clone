import httpRequest from "../service/httpRequest.js";
import { $, $$, toMMSS } from "../utils/commonPage.js";
import { isPlaying, setContext, syncPlayButtons } from "./audioPlayer.js";

export async function handleArtistClick(artistCard) {
  const id = artistCard.dataset.artistId;
  const contentWrapper = $(".content-wrapper");
  const artistSeparate = $(".artist-separate");
  const playlistSeparate = $(".playlist-separate");
  const heroImage = $(".hero-image");
  const artistName = $(".artist-name");
  const monthlyListeners = $(".monthly-listeners");
  const trackList = $(".track-list");
  const followBtn = $(".following-btn");

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
      updateFollowState(follow.is_following);
    } catch (error) {
      console.log("Cần đăng nhập để sử dụng chức năng này", error);
      followBtn.style.display = "none";
    }
  };
  // click follow

  const handleFollowClick = async () => {
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
  };

  try {
    const artistInformation = await httpRequest.get(`artists/${id}`);
    contentWrapper.classList.remove("show");
    artistSeparate.classList.add("show");
    playlistSeparate.classList.remove("show");

    heroImage.src = artistInformation.background_image_url;
    artistName.textContent = artistInformation.name;
    monthlyListeners.textContent = `${artistInformation.monthly_listeners} monthly listeners`;

    if (artistInformation.is_verified) {
      $(".verified-badge i").classList.add("show");
    }

    await checkFollowStatus();
    followBtn.onclick = handleFollowClick;
    syncPlayButtons(isPlaying());

    const artistTracks = await httpRequest.get(`artists/${id}/tracks/popular`);
    const trackIds = artistTracks?.tracks.map((t) => t.id);

    // Click nút Play lớn → phát bài đầu tiên
    $(".play-btn-large").addEventListener("click", () => {
      if (trackIds.length > 0) {
        setContext("artist", trackIds, 0, id);
      }
    });

    // Render danh sách track
    trackList.innerHTML = artistTracks.tracks
      .map(
        (track, index) => `
        <div class="track-item" data-artist-track-id="${track.id}">
          <div class="track-number">${index + 1}</div>
          <div class="track-image">
            <img src="${track.image_url}" alt="${track.title}" />
          </div>
          <div class="track-info">
            <div class="track-name">${track.title}</div>
          </div>
          <div class="track-plays">${(track.play_count || 0).toLocaleString()}</div>
          <div class="track-duration">${toMMSS(track.duration)}</div>
          <button class="track-menu-btn">
            <i class="fas fa-ellipsis-h"></i>
          </button>
        </div>`,
      )
      .join("");

    // Click từng track  phát đúng bài đó
    $$(".track-item").forEach((trackItem, index) => {
      trackItem.addEventListener("click", () => {
        setContext("artist", trackIds, index, id);
      });
    });
  } catch (error) {
    console.log(error);
  }
}
