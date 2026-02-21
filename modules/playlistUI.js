import httpRequest from "../service/httpRequest.js";
import { $, $$ } from "../utils/commonPage.js";
import { showConfirm } from "../utils/confirm.js";
import { showToast } from "../utils/showToast.js";
import { handlePlaylistClick } from "./playlistDetail.js";
import { appState } from "./state.js";

const contextMenu = $("#contextMenu");
const deletePlaylistBtn = $("#delete-playlist-option");

export function initPlaylistContextMenu() {
  deletePlaylistBtn.addEventListener("click", async () => {
    const playlistId = contextMenu.dataset.playlistId;
    if (!playlistId) return;

    try {
      if (await showConfirm(`Are you sure you want to delete this playlist?`)) {
        const currentPlaylist = $(
          `.library-item.active[data-playlist-id="${playlistId}"]`,
        );

        await httpRequest.del(`playlists/${playlistId}`);
        $(`.library-item[data-playlist-id="${playlistId}"]`)?.remove();
        showToast("Playlist successfully deleted.");

        if (currentPlaylist) {
          const playlistSeparate = $(".playlist-separate.show");
          if (playlistSeparate?.classList.contains("show")) {
            playlistSeparate?.classList.remove("show");
            $(".content-wrapper")?.classList.add("show");
          }
        }
      }
    } catch (error) {
      showToast("An error occurred while deleting the playlist.", "error");
      console.error("Lỗi khi xóa playlist:", error);
    } finally {
      contextMenu.classList.remove("show");
    }
  });
}
// playlist library
export async function loadAndDisplayPlaylists() {
  const libraryContent = $(".library-content");
  $(".playListBtn").classList.add("active");
  $(".artistBtn").classList.remove("active");

  try {
    const data = await httpRequest.get("me/playlists");
    const playLists = data.playlists?.filter((p) => p.name !== "Liked Songs");
    let html = "";
    if (playLists) {
      html += playLists
        .map(
          (playlist) => `
          <div class="library-item" data-playlist-id="${playlist.id}">
          ${
            playlist.image_url
              ? `<img src="${
                  playlist.image_url || "placeholder.svg?height=48&width=48"
                }" alt="${playlist.name}" 
            class="item-image" />`
              : ` <div class="item-icon liked-songs">
                <i class="fas fa-heart"></i>
              </div>`
          }
            <div class="item-info">
              <div class="item-title">${playlist.name}</div>
              <div class="item-subtitle">Playlist  ${playlist.user_name ? `•${playlist.user_name}` : ""}</div>
            </div>
          </div>`,
        )
        .join("");
    }

    libraryContent.innerHTML = html;
    const activeItem = $(
      `.library-item[data-playlist-id="${appState.CURRENT_PLAYLIST_ID}"]`,
    );
    if (activeItem) activeItem.classList.add("active");

    $$(".library-item[data-playlist-id]").forEach((item) => {
      item.addEventListener("click", () => {
        const playlistId = item.dataset.playlistId;
        appState.CURRENT_PLAYLIST_ID = playlistId;
        $$(".library-item").forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        handlePlaylistClick(playlistId);
      });

      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showPlaylistContextMenu(e, item.dataset.playlistId);
      });
    });
  } catch (error) {
    libraryContent.innerHTML = ``;
  }
}

export function showPlaylistContextMenu(e, playlistId) {
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.removeAttribute("data-artist-id");
  contextMenu.removeAttribute("data-playlist-id");

  $("#unfollow-artist-option").style.display = "none";
  deletePlaylistBtn.style.display = "flex";

  contextMenu.dataset.playlistId = playlistId;
  contextMenu.classList.add("show");
}
