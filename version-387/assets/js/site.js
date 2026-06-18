(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters(scope) {
    var input = scope.querySelector(".filter-input");
    var typeSelect = scope.querySelector(".filter-select");
    var yearSelect = scope.querySelector(".filter-year");
    var regionSelect = scope.querySelector(".filter-region");
    var section = scope.closest("section") || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
    var result = section.querySelector(".filter-result");

    function apply() {
      var keyword = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var matched = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (type && normalize(card.getAttribute("data-type")) !== type) {
          ok = false;
        }
        if (year && normalize(card.getAttribute("data-year")) !== year) {
          ok = false;
        }
        if (region && normalize(card.getAttribute("data-region")) !== region) {
          ok = false;
        }

        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          matched += 1;
        }
      });

      if (result) {
        result.textContent = "匹配到 " + matched + " 部精选内容";
      }
    }

    [input, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && input) {
      input.value = query;
    }

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(setupFilters);
})();
