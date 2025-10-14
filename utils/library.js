import httpRequest from "./httpRequest.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export function showFlowerArtist() {
  const artistBtn = $(".artistBtn");
  const libraryContent = $(".library-content");
  artistBtn.addEventListener("click", async () => {
    try {
      const data = await httpRequest.get("me/following?limit=20&offset=0");
      if (data.artists.length > 0) {
        const artistFollow = data.artists
          .map((artist) => {
            return `<div class="library-item" >
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
      }
    } catch (_) {}
  });
}
