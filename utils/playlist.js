import httpRequest from "./httpRequest.js";
import { $, $$ } from "./commonPage.js";
import { loadAndDisplayPlaylists } from "./library.js";

const createBtn = $(".create-btn");
const playlistModal = $("#playlistModal");
const playlistModalCloseBtn = $("#playlistModalClose");
const contentWrapper = $(".content-wrapper");
const artistSeparate = $(".artist-separate");
const playlistSeparate = $(".playlist-separate");
export function initPlayListManager() {
  createBtn.addEventListener("click", handleCreatePlaylist);
}
async function handleCreatePlaylist() {
  try {
    await httpRequest.post("playlists", {
      name: "My PlayList",
      description: "",
    });
    contentWrapper.classList.remove("show");
    artistSeparate.classList.remove("show");
    playlistSeparate.classList.add("show");
    await loadAndDisplayPlaylists();
  } catch (error) {
    console.error("Lỗi khi tạo playlist:", error);
  }
}

// Đóng modal
const closeModal = () => {
  playlistModal.classList.remove("show");
  document.body.style.overflow = "auto";
};
playlistModalCloseBtn.addEventListener("click", closeModal);
playlistModal.addEventListener("click", (e) => {
  if (e.target === playlistModal) {
    closeModal();
  }
});
