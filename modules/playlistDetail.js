import httpRequest from "../service/httpRequest.js";
import { $, $$, toMMSS } from "../utils/commonPage.js";
import {
  getState,
  isPlaying,
  setContext,
  syncPlayButtons,
  togglePlay,
} from "./audioPlayer.js";
import { openEditModal } from "./playlistManager.js";

const contentWrapper = $(".content-wrapper");
const artistSeparate = $(".artist-separate");
const playlistSeparate = $(".playlist-separate");

export async function handlePlaylistClick(playlistId) {
  try {
    const [playlistData, tracksData] = await Promise.all([
      httpRequest.get(`playlists/${playlistId}`),
      httpRequest.get(`playlists/${playlistId}/tracks`),
    ]);

    $("#playlistDetailImage").src = playlistData.image_url || "placeholder.svg";
    $("#playlistDetailName").textContent = playlistData.name;
    $("#playlistDetailCreator").textContent = playlistData.user_name;

    contentWrapper.classList.remove("show");
    artistSeparate.classList.remove("show");
    playlistSeparate.classList.add("show");

    const editBtn = $("#editPlaylistBtn");
    editBtn.onclick = () => openEditModal(playlistData);

    //render tracks
    const tracks = tracksData.tracks || [];
    const trackIds = tracks.map((t) => t.track_id);
    const trackListEl = $("#playlistDetailTrackList");
    if (!tracks.length) {
      trackListEl.innerHTML = `<div style="padding:16px;color:#b3b3b3;text-align:center">No songs yet</div>`;
    } else {
      trackListEl.innerHTML = tracks
        .map(
          (track, index) => `
          <div class="track-item" data-playlist-track-id="${track.track_id}">
            <div class="track-number">${index + 1}</div>
            <div class="track-image">
              <img src="${track.track_image_url}" alt="${track.track_title}" />
            </div>
            <div class="track-info">
              <div class="track-name">${track.track_title}</div>
              <div class="track-plays">${track.artist_name}</div>
            </div>
            <div class="track-duration">${toMMSS(track.track_duration)}</div>
            <button class="track-menu-btn">
              <i class="fas fa-ellipsis-h"></i>
            </button>
          </div>`,
        )
        .join("");
      $$(".track-item[data-playlist-track-id]").forEach((item, index) => {
        item.addEventListener("click", () => {
          setContext("playlist", trackIds, index, null, playlistId);
          updateActivePlaylistTrack();
        });
      });
    }

    // Nút play big
    playlistSeparate.querySelector(".play-btn-large").onclick = () => {
      if (!trackIds.length) return;
      const state = getState();
      if (state.context === "playlist" && state.playlistId === playlistId) {
        togglePlay();
      } else {
        setContext("playlist", trackIds, 0, null, playlistId);
      }
    };

    syncPlayButtons(isPlaying());
    updateActivePlaylistTrack();
  } catch (error) {
    console.error("Lỗi khi load playlist detail:", error);
  }
}
export function updateActivePlaylistTrack() {
  const state = getState();
  const currentTrackId = state.playlist[state.index];
  $$(".track-item[data-playlist-track-id]").forEach((item) => {
    item.classList.toggle(
      "active",
      item.dataset.playlistTrackId === currentTrackId,
    );
  });
}
