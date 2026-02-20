import httpRequest from "../service/httpRequest.js";
import { showConfirm } from "../utils/confirm.js";
import { showToast } from "../utils/showToast.js";
import { handleArtistClick } from "./artist.js";
import {
  loadAndDisplayPlaylists,
  showPlaylistContextMenu,
  initPlaylistContextMenu,
} from "./playlistUI.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const contextMenu = $("#contextMenu");
const unfollowArtistBtn = $("#unfollow-artist-option");

// context menu artist
unfollowArtistBtn.addEventListener("click", async () => {
  const artistId = contextMenu.dataset.artistId;
  if (artistId) {
    try {
      if (await showConfirm(`Are you sure you want to unfollow? `)) {
        await httpRequest.del(`artists/${artistId}/follow`);
        const itemArtist = $(`.library-item[data-artist-id="${artistId}"]`);
        contextMenu.classList.remove("show");
        if (itemArtist) itemArtist.remove();
        showToast("Đã bỏ theo dõi nghệ sĩ.");

        // nếu đang xem ở nghệ sĩ đó cập nhật giao diện
        const followBtn = $(".following-btn");
        if (followBtn.dataset.artistId === artistId) {
          followBtn.textContent = "Follow";
          followBtn.classList.remove("active");
        }
      }
    } catch (error) {
      if (error?.response?.error?.code === "AUTH_HEADER_MISSING") {
        showToast("Please log in to proceed.", "error");
      }
      if (error?.response?.error?.code === "NOT_FOLLOWING") {
        showToast("Not following this artist", "error");
      }
      console.error("Lỗi khi bỏ theo dõi:", error);
      showToast("An error occurred, please try again.", "error");
    } finally {
      contextMenu.classList.remove("show");
    }
  }
});

export function setupLibraryTabs() {
  const artistBtn = $(".artistBtn");
  const playListBtn = $(".playListBtn");
  const libraryContent = $(".library-content");

  initPlaylistContextMenu();

  artistBtn.addEventListener("click", async () => {
    artistBtn.classList.add("active");
    playListBtn.classList.remove("active");
    try {
      const data = await httpRequest.get("me/following?limit=20&offset=0");
      if (data.artists.length > 0) {
        const artistFollow = data.artists
          .map(
            (artist) => `
            <div class="library-item" data-artist-id="${artist.id}">
              <img src="${artist.image_url}" alt="${artist.name}" class="item-image" />
              <div class="item-info">
                <div class="item-title">${artist.name}</div>
                <div class="item-subtitle">Artist</div>
              </div>
            </div>`,
          )
          .join("");
        libraryContent.innerHTML = artistFollow;

        $$(".library-item").forEach((item) => {
          item.addEventListener("click", () => {
            const currentActiveItem = libraryContent.querySelector(
              ".library-item.active",
            );
            if (currentActiveItem) currentActiveItem.classList.remove("active");
            item.classList.add("active");
            handleArtistClick(item);
          });

          item.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showArtistContextMenu(e, item.dataset.artistId);
          });
        });
      }
    } catch (_) {}
  });

  playListBtn.addEventListener("click", loadAndDisplayPlaylists);
  loadAndDisplayPlaylists();
}

function showArtistContextMenu(e, artistId) {
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.removeAttribute("data-artist-id");
  contextMenu.removeAttribute("data-playlist-id");

  unfollowArtistBtn.style.display = "flex";
  $("#delete-playlist-option").style.display = "none";

  contextMenu.dataset.artistId = artistId;
  contextMenu.classList.add("show");
}

//  SORT MENU
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

  let currentView = "grid-dense";

  sortBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const isOpen = sortMenu.classList.contains("show");
    sortMenu.classList.toggle("show", !isOpen);
    sortBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!sortBtn.contains(e.target) && !sortMenu.contains(e.target)) {
      sortMenu.classList.remove("show");
      sortBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sortMenu.classList.contains("show")) {
      sortMenu.classList.remove("show");
      sortBtn.setAttribute("aria-expanded", "false");
    }
  });

  menuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      menuItems.forEach((i) => {
        i.classList.remove("is-active");
        i.setAttribute("aria-checked", "false");
      });
      item.classList.add("is-active");
      item.setAttribute("aria-checked", "true");
      sortBtnText.textContent = item.querySelector("span").textContent + " ";
      sortLibrary(item.dataset.sort);
    });
  });

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      viewButtons.forEach((b) => b.classList.remove("is-current"));
      btn.classList.add("is-current");
      currentView = btn.dataset.view;
      applyView(btn.dataset.view);
    });
  });

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
        default:
          return 0;
      }
    });
    libraryContent.innerHTML = "";
    items.forEach((item) => libraryContent.appendChild(item));
  }

  function applyView(viewType) {
    libraryContent.classList.remove(
      "view--list",
      "view--list-compact",
      "view--grid",
      "view--grid-dense",
    );
    libraryContent.classList.add(`view--${viewType}`);
  }
}
