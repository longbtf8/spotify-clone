import httpRequest from "./httpRequest.js";
import { $, $$ } from "./commonPage.js";

const createBtn = $(".create-btn");
const playlistModal = $("#playlistModal");
const playlistModalCloseBtn = $("#playlistModalClose");
export function initPlayListManager() {
  createBtn.addEventListener("click", handleCreatePlaylist);
}
export function handleCreatePlaylist() {
  playlistModal.classList.add("show");
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
