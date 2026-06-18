(function () {
  function attachSource(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    }
  }

  function startVideo(shell) {
    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-video-src');

    if (!video || !source) {
      return;
    }

    if (!video.getAttribute('data-attached')) {
      attachSource(video, source);
      video.setAttribute('data-attached', 'true');
      shell.classList.add('is-ready');
    }

    var playback = video.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {});
    }
  }

  document.querySelectorAll('[data-video-src]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');

    if (button) {
      button.addEventListener('click', function () {
        button.classList.add('is-hidden');
        startVideo(shell);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }
  });
})();
