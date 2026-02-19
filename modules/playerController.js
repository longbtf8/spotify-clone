import { updatePlayer as updatePlayerUI } from "../utils/commonPage";
import httpRequest from "../service/httpRequest";

class PlayerController {
  constructor() {
    this.audio = document.querySelector("#audio");
    this.currentPlaylist = localStorage.getItem("currentPlaylist") || [];
    this.currentIndex = localStorage.getItem("currentTrackIndex") || 0;
    this.context = localStorage.getItem("currentContext") || "home";
  }

  async loadTrack(trackId) {
    try {
      const track = await httpRequest.get(`track/${trackId}`);
      updatePlayerUI(track);
      localStorage.setItem("currentTrackIndex", this.currentIndex);
      localStorage.getItem("currentSong", trackId);
      this.play();
    } catch (error) {
      console.log("Fail to load track ", error);
    }
  }
  play() {
    this.audio.play().catch((e) => console.log("Playback interaction error"));
  }
  pause() {
    this.audio.pause();
  }
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.currentPlaylist.length;
    this.loadTrack(this.currentPlaylist[this.currentIndex]);
  }
  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.currentPlaylist.length) %
      this.currentPlaylist.length;
    this.loadTrack(this.currentPlaylist[this.currentIndex]);
  }
}
export const playerCtrl = new PlayerController();
