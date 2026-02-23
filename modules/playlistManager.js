import httpRequest from "../service/httpRequest.js";
import { $ } from "../utils/commonPage.js";
import { loadAndDisplayPlaylists } from "./playlistUI.js";
import { handlePlaylistClick } from "./playlistDetail.js";
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
      const tasks = [
        httpRequest.put(`playlists/${currentEditingPlaylistId}`, {
          name,
          description,
        }),
      ];

      if (selectedCoverFile) {
        const formData = new FormData();
        formData.append("cover", selectedCoverFile);
        tasks.push(
          httpRequest.post(
            `upload/playlist/${currentEditingPlaylistId}/cover`,
            formData,
          ),
        );
      }

      await Promise.all(tasks);

      closePlaylistModal();

      await Promise.all([
        handlePlaylistClick(currentEditingPlaylistId),
        loadAndDisplayPlaylists(),
      ]);

      showToast("Playlist updated successfully!");
    } catch (error) {
      showToast("Error updating playlist.", "error");
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
