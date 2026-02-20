import httpRequest from "../service/httpRequest.js";
import { $, $$ } from "../utils/commonPage.js";
import { showToast } from "../utils/showToast.js";
import { loadAndDisplayPlaylists } from "./library.js";

const createBtn = $(".create-btn");
const playlistModal = $("#playlistModal");
const playlistModalCloseBtn = $("#playlistModalClose");
const contentWrapper = $(".content-wrapper");
const artistSeparate = $(".artist-separate");
const playlistSeparate = $(".playlist-separate");
const playlistForm = $("#playlistForm");
const playlistCoverInput = $("#createPlaylist");
const playlistCoverPreview = $("#playlistCoverPreview");

let currentEditingPlaylistId = null;
let selectedCoverFile = null;

export function initPlayListManager() {
  createBtn.addEventListener("click", handleCreatePlaylist);
  playlistForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditingPlaylistId) return;
    const name = $("#playlistName").value;
    const description = $("#playlistDescription").value;
    //  anh
    try {
      if (selectedCoverFile) {
        const formData = new FormData();
        formData.append("cover", selectedCoverFile);
        await httpRequest.post(
          `upload/playlist/${currentEditingPlaylistId}/cover`,
          formData,
        );
      }
      //  Cập nhật tên và mô tả
      await httpRequest.put(`playlists/${currentEditingPlaylistId}`, {
        name,
        description,
      });
      closeModal();
      // Tải lại cả chi tiết playlist
      await handlePlaylistClick(currentEditingPlaylistId);
      await loadAndDisplayPlaylists();
      showToast("Cập nhật playlist thành công!");
    } catch (error) {
      showToast("Lỗi khi cập nhật playlist.", "error");
      console.error("Update playlist error:", error);
    }
  });
  playlistCoverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedCoverFile = file; // Lưu file đã chọn
      const reader = new FileReader();
      reader.onload = (event) => {
        playlistCoverPreview.innerHTML = `<img src="${event.target.result}" alt="Cover Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });
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
  // Hiển thị ảnh bìa hiện tại của playlist trong modal
  if (playlist.image_url) {
    playlistCoverPreview.innerHTML = `<img src="${playlist.image_url}" alt="Current Cover">`;
  } else {
    playlistCoverPreview.innerHTML = '<i class="fas fa-music"></i>';
  }
  playlistModal.classList.add("show");
  document.body.style.overflow = "hidden";
};
// Đóng modal
const closeModal = () => {
  playlistModal.classList.remove("show");
  document.body.style.overflow = "auto";
  currentEditingPlaylistId = null; // Reset ID khi đóng
  selectedCoverFile = null; // Reset file đã chọn
  playlistCoverPreview.innerHTML = '<i class="fas fa-music"></i>';
};
playlistModalCloseBtn.addEventListener("click", closeModal);
playlistModal.addEventListener("click", (e) => {
  if (e.target === playlistModal) {
    closeModal();
  }
});
