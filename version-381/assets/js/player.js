(function () {
  function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    if (!video || !config.source) return;
    var attached = false;
    function attach() {
      if (attached) return;
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }
    function play() {
      attach();
      if (button) button.classList.add("is-hidden");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (button) button.classList.remove("is-hidden");
        });
      }
    }
    if (button) {
      button.addEventListener("click", play);
      button.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play();
        }
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) play();
    });
    video.addEventListener("play", function () {
      if (button) button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended && button) button.classList.remove("is-hidden");
    });
    attach();
  }
  window.initMoviePlayer = initMoviePlayer;
})();
