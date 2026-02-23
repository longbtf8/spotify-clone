// modules/addToPlaylist.js
import httpRequest from "../service/httpRequest.js";
import { showToast } from "../utils/showToast.js";
import { $, $$ } from "../utils/commonPage.js";
let modal = null;
let isOpen = false;
let addBtn = null;
let cachedAddedMap = {};
let cachedTrackId = null;

function createModal() {
  const el = document.createElement("div");
  el.className = "add-playlist-modal";
  el.id = "addPlaylistModal";
  el.innerHTML = `
    <div class="add-playlist-modal-title">Add to playlist</div>
    <div class="add-playlist-modal-list" id="addPlaylistList">
      <div class="add-playlist-modal-empty">Loading...</div>
    </div>
  `;
  document.body.appendChild(el);
  return el;
}
function checkAddBtn(addedMap) {
  if (!addBtn) return;
  const isAdded = Object.values(addedMap).some(Boolean);
  const icon = addBtn.querySelector("i");
  if (isAdded) {
    addBtn.style.borderColor = "#1db954";
    addBtn.style.color = "#1db954";
    icon?.classList.replace("fa-plus", "fa-check");
  } else {
    addBtn.style.borderColor = "";
    addBtn.style.color = "";
    icon?.classList.replace("fa-check", "fa-plus");
  }
}
function resetAddBtn() {
  if (!addBtn) return;
  const icon = addBtn.querySelector("i");
  addBtn.style.borderColor = "";
  addBtn.style.color = "";
  icon?.classList.replace("fa-check", "fa-plus");
}
function openModal() {
  if (!modal) modal = createModal();
  modal.classList.add("show");
  isOpen = true;
  loadPlayList();
}
function closeModal() {
  if (modal) {
    modal.classList.remove("show");
  }
  isOpen = false;
}

async function loadPlayList() {
  const listEl = $("#addPlaylistList");
  listEl.innerHTML = `<div class="add-playlist-modal-empty">Đang tải...</div>`;
  const currentTrackId = localStorage.getItem("currentSong");
  try {
    const data = await httpRequest.get("me/playlists");
    const playlists =
      data?.playlists.filter((p) => p.name !== "Liked Songs") || [];
    if (!playlists.length) {
      listEl.innerHTML = `<div class="add-playlist-modal-empty">No playlists yet. !</div>`;
    }

    // kiểm tra đã thêm bài đó chưa
    let addedMap = {};
    if (
      currentTrackId &&
      currentTrackId === cachedTrackId &&
      Object.keys(cachedAddedMap).length > 0
    ) {
      addedMap = { ...cachedAddedMap };
    }
    if (currentTrackId) {
      await Promise.all(
        playlists.map(async (p) => {
          if (cachedAddedMap[p.id] !== undefined) {
            addedMap[p.id] = cachedAddedMap[p.id];
            return;
          }

          try {
            const detail = await httpRequest.get(`playlists/${p.id}/tracks`);
            const tracks = detail.tracks || [];
            addedMap[p.id] = tracks.some((t) => t.track_id === currentTrackId);
          } catch {
            addedMap[p.id] = false;
          }
        }),
      );
    }
    cachedAddedMap = { ...addedMap };
    cachedTrackId = currentTrackId;
    checkAddBtn(addedMap);
    listEl.innerHTML = playlists
      .map((p) => {
        const added = addedMap[p.id] || false;
        const thumb = p.image_url
          ? `<img src="${p.image_url}" alt="${p.name}" />`
          : `<i class="fas fa-music"></i>`;
        return `
        <div class="add-playlist-modal-item ${added ? "added" : ""}"
             data-playlist-id="${p.id}"
             data-added="${added}">
          <div class="add-playlist-modal-thumb">${thumb}</div>
          <span class="add-playlist-modal-name">${p.name}</span>
          <i class="fas fa-check add-playlist-modal-check"></i>
        </div>`;
      })
      .join("");
    listEl.querySelectorAll(".add-playlist-modal-item").forEach((item) => {
      item.addEventListener("click", () => {
        handleAddPlaylist(item, currentTrackId, addedMap);
      });
    });
  } catch (error) {
    showToast("Please log in.");
    listEl.innerHTML = `<div class="add-playlist-modal-empty">Please log in.</div>`;
    console.log(error);
  }
}
async function handleAddPlaylist(item, trackId, addedMap) {
  if (!trackId) {
    showToast("Chưa có bài nào đang phát", "warning");
    return;
  }
  const playlistId = item.dataset.playlistId;
  const isAdded = item.dataset.added === "true";
  try {
    if (!isAdded) {
      await httpRequest.post(`playlists/${playlistId}/tracks`, {
        track_id: trackId,
      });
      item.classList.add("added");
      item.dataset.added = "true";
      addedMap[playlistId] = true;
      cachedAddedMap[playlistId] = true;
      showToast("Added to playlist!");
    } else {
      await httpRequest.del(`playlists/${playlistId}/tracks/${trackId}`);
      item.classList.remove("added");
      item.dataset.added = "false";
      addedMap[playlistId] = false;
      cachedAddedMap[playlistId] = false;
      showToast("Removed from playlist");
    }
    checkAddBtn(addedMap);
  } catch (error) {
    showToast("An error occurred, please try again", "error");
  }
}

export function initAddToPlaylist() {
  addBtn = document.querySelector(".add-btn");
  if (!addBtn) return;

  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  });

  //   đóng khi click bên ngoài
  document.addEventListener("click", (e) => {
    if (
      modal &&
      isOpen &&
      !modal.contains(e.target) &&
      !addBtn.contains(e.target)
    ) {
      closeModal();
    }
  });
}

export function resetAddToPlaylistCache() {
  cachedAddedMap = {};
  cachedTrackId = null;
  resetAddBtn();
}
