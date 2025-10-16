import httpRequest from "./httpRequest.js";
import { $, $$ } from "./commonPage.js";

const createBtn = $(".create-btn");
const playlistModal = $("#playlistModal");
const playlistModalCloseBtn = $("#playlistModalClose");
const contentWrapper = $(".content-wrapper");
const artistSeparate = $(".artist-separate");
const playlistSeparate = $(".playlist-separate");
export function initPlayListManager() {
  createBtn.addEventListener("click", handleCreatePlaylist);
}
export function handleCreatePlaylist() {
  contentWrapper.classList.remove("show");
  artistSeparate.classList.remove("show");
  playlistSeparate.classList.add("show");
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
