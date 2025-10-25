import httpRequest from "./httpRequest.js";
import { handleArtistClick } from "./artist.js";
import { handlePlaylistClick } from "./playlist.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const contextMenu = $("#contextMenu");
const unfollowArtistBtn = $("#unfollow-artist-option");
const deletePlaylistBtn = $("#delete-playlist-option");
unfollowArtistBtn.addEventListener("click", async () => {
  const artistId = contextMenu.dataset.artistId;
  if (artistId) {
    try {
      if (window.confirm(`Bạn có chắc muốn huỷ Follow chứ `)) {
        await httpRequest.del(`artists/${artistId}/follow`);
        const itemArtist = $(`.library-item[data-artist-id="${artistId}"]`);
        contextMenu.classList.remove("show");
        if (itemArtist) {
          itemArtist.remove();
        }
        alert("Đã bỏ theo dõi nghệ sĩ.");
      }
    } catch (error) {
      if (error?.response?.error?.code === "AUTH_HEADER_MISSING") {
        alert("Vui lòng đăng nhập để thực hiện");
      }
      if (error?.response?.error?.code === "NOT_FOLLOWING") {
        alert("Not following this artist");
      }
      console.error("Lỗi khi bỏ theo dõi:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      contextMenu.classList.remove("show");
    }
  }
});
deletePlaylistBtn.addEventListener("click", async () => {
  const playlistId = contextMenu.dataset.playlistId;
  if (!playlistId) return;

  try {
    if (window.confirm(`Bạn có chắc muốn xóa playlist này không?`)) {
      await httpRequest.del(`playlists/${playlistId}`);
      $(`.library-item[data-playlist-id="${playlistId}"]`)?.remove();
      alert("Đã xóa playlist thành công.");
    }
  } catch (error) {
    alert("Có lỗi xảy ra khi xóa playlist.");
    console.error("Lỗi khi xóa playlist:", error);
  } finally {
    contextMenu.classList.remove("show");
  }
});

export async function loadAndDisplayPlaylists() {
  const libraryContent = $(".library-content");
  $(".playListBtn").classList.add("active");
  $(".artistBtn").classList.remove("active");
  try {
    const data = await httpRequest.get("me/playlists");
    const playLists = data.playlists;
    let html = "";
    if (playLists) {
      html += playLists
        .map(
          (playlist) => `
      <div class="library-item" data-playlist-id="${playlist.id}">
        <img src="${
          playlist.image_url || "placeholder.svg?height=48&width=48"
        }" alt="${playlist.name}" class="item-image" />
        <div class="item-info">
          <div class="item-title">${playlist.name}</div>
          <div class="item-subtitle">Playlist • ${playlist.user_name}</div>
        </div>
      </div>`
        )
        .join("");
    }
    libraryContent.innerHTML = html;
    $$(".library-item[data-playlist-id]").forEach((item) => {
      item.addEventListener("click", () => {
        const playlistId = item.dataset.playlistId;
        const currentActiveItem = libraryContent.querySelector(
          ".library-item.active"
        );
        if (currentActiveItem) {
          currentActiveItem.classList.remove("active");
        }
        item.classList.add("active");

        handlePlaylistClick(playlistId);
      });

      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showContextMenu(e, { playlistId: item.dataset.playlistId });
      });
    });
  } catch (error) {
    libraryContent.innerHTML = `
      <div class="library-item active">
        <div class="item-icon liked-songs">
          <i class="fas fa-heart"></i>
        </div>
        <div class="item-info">
          <div class="item-title">Liked Songs</div>
          <div class="item-subtitle">
            <i class="fas fa-thumbtack"></i>
            Playlist • 3 songs
          </div>
        </div>
      </div>`;
  }
}

export function setupLibraryTabs() {
  const artistBtn = $(".artistBtn");
  const playListBtn = $(".playListBtn");
  const libraryContent = $(".library-content");
  artistBtn.addEventListener("click", async () => {
    artistBtn.classList.add("active");
    playListBtn.classList.remove("active");
    try {
      const data = await httpRequest.get("me/following?limit=20&offset=0");
      if (data.artists.length > 0) {
        const artistFollow = data.artists
          .map((artist) => {
            return `<div class="library-item" data-artist-id="${artist.id}" >
              <img
                src="${artist.image_url}"
                alt="Đen"
                class="item-image"
              />
              <div class="item-info">
                <div class="item-title">${artist.name}</div>
                <div class="item-subtitle">Artist</div>
              </div>
            </div>`;
          })
          .join("");
        libraryContent.innerHTML = artistFollow;
        const libraryItems = $$(".library-item");
        libraryItems.forEach((item) => {
          item.addEventListener("click", () => {
            const currentActiveItem = libraryContent.querySelector(
              ".library-item.active"
            );
            if (currentActiveItem) {
              currentActiveItem.classList.remove("active");
            }
            item.classList.add("active");
            handleArtistClick(item);
          });
          item.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showContextMenu(e, { artistId: item.dataset.artistId });
          });
        });
      }
    } catch (_) {}
  });
  playListBtn.addEventListener("click", loadAndDisplayPlaylists);

  loadAndDisplayPlaylists();
}

function showContextMenu(e, { artistId, playlistId }) {
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.removeAttribute("data-artist-id");
  contextMenu.removeAttribute("data-playlist-id");
  unfollowArtistBtn.style.display = "none";
  deletePlaylistBtn.style.display = "none";
  if (artistId) {
    contextMenu.dataset.artistId = artistId;
    unfollowArtistBtn.style.display = "flex";
  }

  if (playlistId) {
    contextMenu.dataset.playlistId = playlistId;
    deletePlaylistBtn.style.display = "flex";
  }

  contextMenu.classList.add("show");
}

// ===== SORT MENU FUNCTIONALITY =====
export function initSortMenu() {
  const sortBtn = $("#openSortMenu");
  const sortMenu = $("#sortMenu");

  if (!sortBtn || !sortMenu) {
    console.error("Sort menu elements not found!");
    return;
  }

  const menuItems = $$(".menu-item[data-sort]");
  const viewButtons = $$(".view-btn[data-view]");
  const libraryContent = $(".library-content");
  const sortBtnText = sortBtn.childNodes[0];

  let currentSort = "recents";
  let currentView = "grid-dense";

  console.log("Sort menu initialized"); // Debug

  // Toggle menu
  sortBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();

    const isOpen = sortMenu.classList.contains("show");

    if (isOpen) {
      sortMenu.classList.remove("show");
      sortBtn.setAttribute("aria-expanded", "false");
    } else {
      sortMenu.classList.add("show");
      sortBtn.setAttribute("aria-expanded", "true");
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!sortBtn.contains(e.target) && !sortMenu.contains(e.target)) {
      sortMenu.classList.remove("show");
      sortBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Close menu with Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sortMenu.classList.contains("show")) {
      sortMenu.classList.remove("show");
      sortBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Handle sort options
  menuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const sortType = item.dataset.sort;

      // Update UI
      menuItems.forEach((i) => {
        i.classList.remove("is-active");
        i.setAttribute("aria-checked", "false");
      });

      item.classList.add("is-active");
      item.setAttribute("aria-checked", "true");

      // Update button text
      const sortText = item.querySelector("span").textContent;
      sortBtnText.textContent = sortText + " ";

      currentSort = sortType;
      sortLibrary(sortType);
    });
  });

  // Handle view options
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const viewType = btn.dataset.view;

      // Update UI
      viewButtons.forEach((b) => b.classList.remove("is-current"));
      btn.classList.add("is-current");

      currentView = viewType;
      applyView(viewType);
    });
  });

  // Sort library function
  function sortLibrary(sortType) {
    const items = Array.from(libraryContent.querySelectorAll(".library-item"));

    items.sort((a, b) => {
      const titleA =
        a.querySelector(".item-title")?.textContent.toLowerCase() || "";
      const titleB =
        b.querySelector(".item-title")?.textContent.toLowerCase() || "";
      const subtitleA =
        a.querySelector(".item-subtitle")?.textContent.toLowerCase() || "";
      const subtitleB =
        b.querySelector(".item-subtitle")?.textContent.toLowerCase() || "";

      switch (sortType) {
        case "alphabetical":
          return titleA.localeCompare(titleB);

        case "creator":
          return subtitleA.localeCompare(subtitleB);

        case "recently-added":
        case "recents":
        default:
          return 0;
      }
    });

    libraryContent.innerHTML = "";
    items.forEach((item) => libraryContent.appendChild(item));
  }

  // Apply view function
  function applyView(viewType) {
    libraryContent.classList.remove(
      "view--list",
      "view--list-compact",
      "view--grid",
      "view--grid-dense"
    );
    libraryContent.classList.add(`view--${viewType}`);
  }
}
