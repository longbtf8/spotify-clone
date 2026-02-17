import {
  showTodayBiggestHit,
  showPopularArtists,
  playerSongHome,
} from "./modules/tracks.js";
import { setupLibraryTabs, initSortMenu } from "./modules/library.js";
import { initPlayListManager } from "./modules/playlist.js";
import { initAuth } from "./modules/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  showTodayBiggestHit();
  showPopularArtists();
  playerSongHome();
  setupLibraryTabs();
  initSortMenu();
  initPlayListManager();
  initAuth();
});
