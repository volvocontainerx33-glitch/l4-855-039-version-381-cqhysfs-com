(function () {
    var video = document.querySelector('[data-player]');
    if (!video) {
        return;
    }

    var source = video.getAttribute('data-src');
    var button = document.querySelector('[data-play-button]');
    var overlay = document.querySelector('[data-player-overlay]');
    var message = document.querySelector('[data-player-message]');
    var initialized = false;
    var hlsInstance = null;

    function setMessage(text, isError) {
        if (!message) {
            return;
        }
        message.textContent = text || '';
        message.classList.toggle('error', Boolean(isError));
        message.style.display = text ? 'block' : 'none';
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    function showOverlay() {
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    function initializePlayer() {
        if (initialized || !source) {
            return;
        }
        initialized = true;
        setMessage('正在加载播放源', false);

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setMessage('', false);
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    setMessage('网络异常，正在重新加载', true);
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    setMessage('媒体异常，正在恢复播放', true);
                    hlsInstance.recoverMediaError();
                } else {
                    setMessage('播放源暂时无法加载', true);
                    hlsInstance.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setMessage('', false);
            });
            video.addEventListener('error', function () {
                setMessage('播放源暂时无法加载', true);
            });
        } else {
            setMessage('当前浏览器不支持 HLS 播放', true);
        }
    }

    function playVideo() {
        initializePlayer();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setMessage('点击播放器即可开始播放', false);
            });
        }
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        initializePlayer();
    });
    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);

    initializePlayer();
})();
