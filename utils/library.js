import httpRequest from "./httpRequest.js";
import { handleArtistClick } from "./artist.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const contextMenu = $("#contextMenu");
const unfollowBtn = $("#unfollow-option");
unfollowBtn.addEventListener("click", async () => {
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
export async function loadAndDisplayPlaylists() {
  const libraryContent = $(".library-content");
  $(".playListBtn").classList.add("active");
  $(".artistBtn").classList.remove("active");
  try {
    const data = await httpRequest.get("me/playlists");
    console.log(data);
    const playLists = data.playlists;
    let html = `
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
  } catch (error) {
    alert("Không thể tải playlist. Bạn có thể chưa đăng nhập.", error);
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
            console.log(currentActiveItem);
            if (currentActiveItem) {
              currentActiveItem.classList.remove("active");
            }
            item.classList.add("active");
            handleArtistClick(item);
          });
          item.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            contextMenu.dataset.artistId = item.dataset.artistId;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.classList.add("show");
          });
        });
      }
    } catch (_) {}
  });
  playListBtn.addEventListener("click", loadAndDisplayPlaylists);

  // Mặc định tải danh sách playlist khi khởi động
  loadAndDisplayPlaylists();
}
