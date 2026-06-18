import { H as Hls } from './hls-vendor-dru42stk.js';

const shell = document.querySelector('[data-player-shell]');
const video = document.querySelector('[data-hls-player]');
const playButton = document.querySelector('[data-play-button]');
const statusText = document.querySelector('[data-player-status]');
let hlsInstance = null;
let sourceLoaded = false;

function setStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function attachSource() {
  if (!video || sourceLoaded) {
    return;
  }

  const source = video.dataset.src;
  if (!source) {
    setStatus('未找到播放源');
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    sourceLoaded = true;
    setStatus('已加载原生 HLS 播放源');
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      sourceLoaded = true;
      setStatus('HLS 播放源已就绪');
    });
    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus('网络加载异常，正在重试播放源');
        hlsInstance.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus('媒体解码异常，正在恢复');
        hlsInstance.recoverMediaError();
      } else {
        setStatus('当前播放源暂时不可用，请切换浏览器或刷新重试');
        hlsInstance.destroy();
      }
    });
    return;
  }

  setStatus('当前浏览器不支持 HLS 播放');
}

async function startPlayback() {
  if (!video) {
    return;
  }

  attachSource();
  shell?.classList.add('is-loaded');

  try {
    await video.play();
    setStatus('正在播放');
  } catch (error) {
    setStatus('播放源已加载，请再次点击视频播放');
  }
}

if (playButton) {
  playButton.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', () => {
    if (!sourceLoaded) {
      startPlayback();
    }
  });
  video.addEventListener('play', () => shell?.classList.add('is-loaded'));
}

window.addEventListener('beforeunload', () => {
  if (hlsInstance) {
    hlsInstance.destroy();
  }
});
