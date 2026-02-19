import httpRequest from "../service/httpRequest.js";
import { $ } from "../utils/commonPage.js";
import { openEditModal } from "./playlistManager.js";

const contentWrapper = $(".content-wrapper");
const artistSeparate = $(".artist-separate");
const playlistSeparate = $(".playlist-separate");

export async function handlePlaylistClick(playlistId) {
  try {
    const playlistData = await httpRequest.get(`playlists/${playlistId}`);

    $("#playlistDetailImage").src = playlistData.image_url || "placeholder.svg";
    $("#playlistDetailName").textContent = playlistData.name;
    $("#playlistDetailCreator").textContent = playlistData.user_name;

    contentWrapper.classList.remove("show");
    artistSeparate.classList.remove("show");
    playlistSeparate.classList.add("show");

    const editBtn = $("#editPlaylistBtn");
    editBtn.onclick = () => openEditModal(playlistData);
  } catch (error) {
    console.error("Lỗi khi load playlist detail:", error);
  }
}
