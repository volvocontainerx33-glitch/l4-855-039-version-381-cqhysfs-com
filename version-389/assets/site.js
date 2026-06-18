(function () {
  var assetBase = "";
  var currentScript = document.currentScript;

  if (currentScript && currentScript.src) {
    assetBase = new URL(".", currentScript.src).href;
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );

    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
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
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot") || 0);
        show(nextIndex);
        start();
      });
    });

    var carousel = document.querySelector(".hero-carousel");

    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
    }

    start();
  }

  function initSearch() {
    var input = document.querySelector(".js-search");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".movie-card"),
    );
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-kind]"),
    );

    if (!input && buttons.length === 0) {
      return;
    }

    var kind = "all";

    function normalize(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var meta = normalize(card.getAttribute("data-meta"));
        var itemKind = card.getAttribute("data-kind") || "";
        var matchesText =
          !query || title.indexOf(query) >= 0 || meta.indexOf(query) >= 0;
        var matchesKind =
          kind === "all" ||
          itemKind.indexOf(kind) >= 0 ||
          meta.indexOf(kind.toLowerCase()) >= 0;

        card.classList.toggle("hidden", !(matchesText && matchesKind));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        kind = button.getAttribute("data-kind") || "all";

        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });

        apply();
      });
    });
  }

  async function loadLocalHls() {
    try {
      var module = await import(assetBase + "hls-vendor.js");
      return module.H;
    } catch (error) {
      return null;
    }
  }

  async function attachStream(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    var HlsClass = window.Hls;

    if (!HlsClass) {
      HlsClass = await loadLocalHls();
    }

    if (HlsClass && HlsClass.isSupported()) {
      var hls = new HlsClass({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }

    video.src = source;
  }

  window.startMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);

    if (!video || !overlay || !source) {
      return;
    }

    var attached = false;

    async function beginPlayback() {
      if (!attached) {
        attached = true;
        await attachStream(video, source);
      }

      overlay.classList.add("hidden");

      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    }

    overlay.addEventListener("click", beginPlayback);

    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlayback();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
