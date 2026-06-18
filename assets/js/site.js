(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (!slides.length) return;
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    if (!inputs.length) return;
    inputs.forEach(function (input) {
      var scope = document.querySelector(input.getAttribute("data-search-input")) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      function run() {
        var q = normalize(input.value);
        cards.forEach(function (card) {
          var hay = normalize(card.getAttribute("data-search") || card.textContent);
          card.style.display = !q || hay.indexOf(q) !== -1 ? "" : "none";
        });
      }
      input.addEventListener("input", run);
      run();
    });
  }

  function setupFilters() {
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    if (!chips.length) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var current = "all";
    function apply() {
      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-filter") === current);
      });
      cards.forEach(function (card) {
        var type = card.getAttribute("data-type") || "";
        var region = card.getAttribute("data-region") || "";
        var year = card.getAttribute("data-year") || "";
        var ok = current === "all" || type.indexOf(current) !== -1 || region.indexOf(current) !== -1 || year === current;
        card.style.display = ok ? "" : "none";
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        current = chip.getAttribute("data-filter") || "all";
        apply();
      });
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
  });
})();
