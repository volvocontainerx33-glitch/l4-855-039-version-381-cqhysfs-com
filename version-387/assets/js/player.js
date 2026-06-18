(function () {
  function setupPlayer(player) {
    var video = player.querySelector(".js-video");
    var cover = player.querySelector(".player-cover");
    var text = player.querySelector(".player-text");
    var stream = player.getAttribute("data-stream");
    var attached = false;
    var hlsInstance = null;

    if (!video || !cover || !stream) {
      return;
    }

    function attachStream() {
      if (attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve, reject) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error("playback"));
            }
          });
        });
      }

      video.src = stream;
      return Promise.resolve();
    }

    function restoreButton() {
      cover.classList.remove("is-hidden");
      cover.classList.remove("is-loading");
      if (text) {
        text.textContent = "点击重试";
      }
      attached = false;
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    }

    function startPlayback() {
      cover.classList.add("is-loading");
      if (text) {
        text.textContent = "正在加载";
      }

      attachStream()
        .then(function () {
          cover.classList.add("is-hidden");
          cover.classList.remove("is-loading");
          return video.play();
        })
        .catch(restoreButton);
    }

    cover.addEventListener("click", startPlayback);
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    video.addEventListener("error", restoreButton);
  }

  Array.prototype.slice.call(document.querySelectorAll(".player-card")).forEach(setupPlayer);
})();
