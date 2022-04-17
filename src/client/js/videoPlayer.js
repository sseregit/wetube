const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playI = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteI = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenI = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playI.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};
const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteI.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};
const handleVolumeChange = (e) => {
  const {
    target: { value },
  } = e;

  if (video.muted) {
    video.muted = false;
  } else if (value === "0") {
    video.muted = true;
  }
  muteI.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(11, 19);

const handleLoadedEetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};
const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};
const handleTimelineChange = (e) => {
  const {
    target: { value },
  } = e;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullScreen = document.fullscreenElement;
  if (fullScreen) {
    document.exitFullscreen();
    fullScreenI.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenI.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

const handleKeydown = (e) => {
  if (e.target.tagName !== "TEXTAREA" && e.keyCode === 32) {
    handlePlayClick();
  }
};

const handleVideoClick = () => handlePlayClick();

const handleVideoEnded = () => {
  const { id } = video.dataset;
  fetch(`/api/videos/${id}/view`, { method: "POST" });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
fullScreenBtn.addEventListener("click", handleFullScreen);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedEetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handleVideoClick);
video.addEventListener("ended", handleVideoEnded);
timeline.addEventListener("input", handleTimelineChange);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
document.addEventListener("keydown", handleKeydown);
