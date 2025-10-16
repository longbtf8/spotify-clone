import httpRequest from "./httpRequest.js";
import { $, $$ } from "./commonPage.js";
import { loadAndDisplayPlaylists } from "./library.js";

const createBtn = $(".create-btn");
const playlistModal = $("#playlistModal");
const playlistModalCloseBtn = $("#playlistModalClose");
const contentWrapper = $(".content-wrapper");
const artistSeparate = $(".artist-separate");
const playlistSeparate = $(".playlist-separate");
const playlistForm = $("#playlistForm");
let currentEditingPlaylistId = null;

export function initPlayListManager() {
  createBtn.addEventListener("click", handleCreatePlaylist);
}
async function handleCreatePlaylist() {
  try {
    await httpRequest.post("playlists", {
      name: "My PlayList",
      description: "",
    });

    await loadAndDisplayPlaylists();
  } catch (error) {
    console.error("Lỗi khi tạo playlist:", error);
  }
}
export async function handlePlaylistClick(playlistId) {
  try {
    const playlistData = await httpRequest.get(`playlists/${playlistId}`);
    console.log(playlistData);
    // Điền thông tin vào hero section
    $("#playlistDetailImage").src = playlistData.image_url || "placeholder.svg";
    $("#playlistDetailName").textContent = playlistData.name;
    $("#playlistDetailCreator").textContent = playlistData.user_name;
    contentWrapper.classList.remove("show");
    artistSeparate.classList.remove("show");
    playlistSeparate.classList.add("show");
    // Gán sự kiện cho nút Edit
    const editBtn = $("#editPlaylistBtn");
    editBtn.onclick = () => openEditModal(playlistData);
  } catch (error) {}
}
const openEditModal = (playlist) => {
  currentEditingPlaylistId = playlist.id;
  $("#playlistName").value = playlist.name;
  $("#playlistDescription").value = playlist.description;
  playlistModal.classList.add("show");
  document.body.style.overflow = "hidden";
};
// Đóng modal
const closeModal = () => {
  playlistModal.classList.remove("show");
  document.body.style.overflow = "auto";
  currentEditingPlaylistId = null; // Reset ID khi đóng
};
playlistModalCloseBtn.addEventListener("click", closeModal);
playlistModal.addEventListener("click", (e) => {
  if (e.target === playlistModal) {
    closeModal();
  }
});
