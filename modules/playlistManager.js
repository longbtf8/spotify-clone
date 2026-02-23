import httpRequest from "../service/httpRequest.js";
import { $ } from "../utils/commonPage.js";
import { loadAndDisplayPlaylists } from "./playlistUI.js";

import { showToast } from "../utils/showToast.js";

const playlistModal = $("#playlistModal");
const playlistModalCloseBtn = $("#playlistModalClose");
const playlistForm = $("#playlistForm");
const playlistCoverInput = $("#createPlaylist");
const playlistCoverPreview = $("#playlistCoverPreview");

let currentEditingPlaylistId = null;
let selectedCoverFile = null;

export function initPlayListManager() {
  const createBtn = $(".create-btn");
  createBtn.addEventListener("click", handleCreatePlaylist);

  playlistForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditingPlaylistId) return;

    const name = $("#playlistName").value;
    const description = $("#playlistDescription").value;

    const submitBtn = playlistForm.querySelector(".auth-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      // cập nhập tên , mô tả
      await httpRequest.put(`playlists/${currentEditingPlaylistId}`, {
        name,
        description,
      });

      // upload ảnh nếu có
      if (selectedCoverFile) {
        const imageUrl = await uploadPlaylistCover(
          currentEditingPlaylistId,
          selectedCoverFile,
        );
        if (imageUrl) {
          $("#playlistDetailImage").src = imageUrl;
          updateSidebarPlaylistImage(currentEditingPlaylistId, imageUrl);
        }
      }

      //  Fetch lại data mới nhất từ server
      const updatedPlaylist = await httpRequest.get(
        `playlists/${currentEditingPlaylistId}`,
      );

      console.log(updatedPlaylist);
      // 4. Cập nhật realtime trên hero section
      $("#playlistDetailName").textContent = updatedPlaylist.name;
      $("#playlistDetailCreator").textContent = updatedPlaylist.user_name;
      if (updatedPlaylist.image_url) {
        $("#playlistDetailImage").src = updatedPlaylist.image_url;
      }

      await loadAndDisplayPlaylists();

      closePlaylistModal();
      showToast("Playlist updated successfully!");
    } catch (error) {
      showToast("Error updating playlist.", "error");
      console.log(error);
      console.error("Update playlist error:", error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save";
    }
  });

  playlistCoverInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    selectedCoverFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      playlistCoverPreview.innerHTML = `<img src="${event.target.result}" alt="Cover Preview">`;

      // Preview ảnh ngay trên hero section (realtime trước khi save)
      const heroImg = $("#playlistDetailImage");
      if (heroImg) heroImg.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  playlistModalCloseBtn.addEventListener("click", closePlaylistModal);
  playlistModal.addEventListener("click", (e) => {
    if (e.target === playlistModal) closePlaylistModal();
  });
}
// Cập nhật ảnh sidebar item ngay lập tức
function updateSidebarPlaylistImage(playlistId, imageUrl) {
  const sidebarItem = $(`.library-item[data-playlist-id="${playlistId}"]`);
  if (!sidebarItem) return;

  // Nếu đang có item-image thì cập nhật src
  const existingImg = sidebarItem.querySelector(".item-image");
  if (existingImg) {
    existingImg.src = imageUrl;
    return;
  }

  // Nếu đang hiển thị icon (chưa có ảnh) → thay bằng img
  const iconEl = sidebarItem.querySelector(".item-icon");
  if (iconEl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Playlist cover";
    img.className = "item-image";
    iconEl.replaceWith(img);
  }
}

// Upload ảnh
async function uploadPlaylistCover(playlistId, file) {
  const formData = new FormData();
  formData.append("cover", file);
  let result;
  try {
    result = await httpRequest.post(
      `upload/playlist/${playlistId}/cover`,
      formData,
    );
    console.log(result);
  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 409) {
      // Ảnh đã tồn tại → cập nhật bằng PUT
      const formData2 = new FormData();
      formData2.append("cover", file);
      result = await httpRequest.put(
        `upload/playlist/${playlistId}/cover`,
        formData2,
      );
      console.log(result);
    } else {
      throw err;
    }
  }
  const relativeUrl = result?.file?.url;
  if (relativeUrl) {
    return `https://spotify.f8team.dev${relativeUrl}`;
  }
  return null;
}

async function handleCreatePlaylist() {
  try {
    await httpRequest.get("users/me");
  } catch (error) {
    showToast("Please log in to create a playlist", "error");
    return;
  }
  try {
    await httpRequest.post("playlists", {
      name: "My PlayList",
      description: "",
    });
    await loadAndDisplayPlaylists();
  } catch (error) {
    console.error("Error creating playlist:", error);
  }
}

export function openEditModal(playlist) {
  currentEditingPlaylistId = playlist.id;
  $("#playlistName").value = playlist.name;
  $("#playlistDescription").value = playlist.description || "";
  selectedCoverFile = null;

  if (playlist.image_url) {
    playlistCoverPreview.innerHTML = `<img src="${playlist.image_url}" alt="Current Cover">`;
  } else {
    playlistCoverPreview.innerHTML = '<i class="fas fa-music"></i>';
  }

  playlistModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

export function closePlaylistModal() {
  playlistModal.classList.remove("show");
  document.body.style.overflow = "auto";
  currentEditingPlaylistId = null;
  selectedCoverFile = null;
  playlistCoverPreview.innerHTML = '<i class="fas fa-music"></i>';
}
