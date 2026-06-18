(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot) {
        var dotIndex = parseInt(dot.getAttribute('data-hero-dot'), 10);
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function textOf(card, name) {
    return (card.getAttribute(name) || '').toLowerCase();
  }

  function initFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-panel');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        scope = document;
      }
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var reset = panel.querySelector('[data-filter-reset]');
      var status = document.querySelector('[data-search-status]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input && !input.value) {
        input.value = query;
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        cards.forEach(function (card) {
          var haystack = [
            textOf(card, 'data-title'),
            textOf(card, 'data-region'),
            textOf(card, 'data-type'),
            textOf(card, 'data-year'),
            textOf(card, 'data-tags')
          ].join(' ');
          var matchQuery = !q || haystack.indexOf(q) !== -1;
          var matchYear = !y || textOf(card, 'data-year') === y;
          var matchType = !t || textOf(card, 'data-type').indexOf(t.toLowerCase()) !== -1;
          card.hidden = !(matchQuery && matchYear && matchType);
        });
        if (status) {
          status.textContent = q || y || t ? '筛选结果已更新' : '输入关键词或条件快速筛选';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (type) {
            type.value = '';
          }
          apply();
        });
      }
      apply();
    });
  }

  function initPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (root) {
      var video = root.querySelector('video');
      var button = root.querySelector('[data-play]');
      var stream = root.getAttribute('data-stream');
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded || !video || !stream) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        load();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function toggle() {
        if (!video) {
          return;
        }
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', toggle);
        video.addEventListener('play', function () {
          root.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          root.classList.remove('playing');
        });
        video.addEventListener('ended', function () {
          root.classList.remove('playing');
        });
        video.setAttribute('controls', 'controls');
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
