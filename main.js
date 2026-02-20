import {
  showTodayBiggestHit,
  showPopularArtists,
  playerSongHome,
} from "./modules/tracks.js";
import { setupLibraryTabs, initSortMenu } from "./modules/library.js";
import { initPlayListManager } from "./modules/playlistManager.js";
import {
  initAuth,
  isAuthenticated,
  openModal,
  showLoginForm,
} from "./modules/auth.js";
import { initPlayer } from "./modules/audioPlayer.js";

import { $, $$ } from "./utils/commonPage.js";
import { showToast } from "./utils/showToast.js";

// check sideBar khi chưa login
function checkSideBar() {
  const sideBar = $(".sidebar");
  const createBtn = $(".create-btn");

  const handleAuthRequire = (e) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      e.stopPropagation();
      showToast("Please log in to use this feature!", "warning");
      openModal();
      return false;
    }
    return true;
  };
  if (createBtn) {
    createBtn.addEventListener("click", handleAuthRequire, true);
  }
  //  các nút khác
  $$(".sidebar-nav button, .sidebar-nav a").forEach((item) =>
    item.addEventListener("click", handleAuthRequire, true),
  );
}
//  update biểu tượng cấm khi chưa login
function updateSideBarUi() {
  const isAuth = isAuthenticated();
  const protectedEL = $$(".create-btn, .nav-tab, .search-library-btn");
  protectedEL.forEach((el) => {
    if (!isAuth) {
      el.classList.add("auth-locked");
    } else {
      el.classList.remove("auth-locked");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // sideBar
  checkSideBar();
  updateSideBarUi();

  // Artist
  showTodayBiggestHit();
  showPopularArtists();
  playerSongHome();

  // sort and playlist
  setupLibraryTabs();
  initSortMenu();
  initPlayListManager();

  initAuth();
  // logic player audio
  initPlayer();
});
