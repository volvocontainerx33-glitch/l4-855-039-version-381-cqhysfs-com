const header = document.querySelector('[data-header]');
const mobileToggle = document.querySelector('[data-mobile-toggle]');

if (mobileToggle && header) {
  mobileToggle.addEventListener('click', () => {
    header.classList.toggle('is-open');
  });
}

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let activeSlide = 0;

function activateSlide(index) {
  if (!slides.length) {
    return;
  }

  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === activeSlide);
  });
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === activeSlide);
  });
}

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => activateSlide(index));
});

if (slides.length > 1) {
  window.setInterval(() => activateSlide(activeSlide + 1), 5200);
}

const navSearch = document.querySelector('[data-nav-search]');
if (navSearch) {
  navSearch.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const value = navSearch.value.trim();
      const url = new URL('./search.html', window.location.href);
      if (value) {
        url.searchParams.set('q', value);
      }
      window.location.href = url.toString();
    }
  });
}

const grid = document.querySelector('[data-filter-grid]');
const cards = grid ? Array.from(grid.querySelectorAll('[data-card]')) : [];
const searchInput = document.querySelector('[data-filter-search]');
const regionSelect = document.querySelector('[data-filter-region]');
const typeSelect = document.querySelector('[data-filter-type]');
const yearSelect = document.querySelector('[data-filter-year]');
const resultCount = document.querySelector('[data-result-count]');
const emptyState = document.querySelector('[data-empty-state]');

function readParams() {
  const params = new URLSearchParams(window.location.search);
  if (searchInput && params.get('q')) {
    searchInput.value = params.get('q');
  }
}

function matchCard(card, query, region, type, year) {
  const haystack = [
    card.dataset.title,
    card.dataset.region,
    card.dataset.type,
    card.dataset.year,
    card.dataset.genre,
    card.dataset.tags,
    card.dataset.summary,
  ].join(' ').toLowerCase();

  const queryOk = !query || haystack.includes(query);
  const regionOk = !region || card.dataset.regionGroup === region || card.dataset.region === region;
  const typeOk = !type || card.dataset.typeGroup === type || card.dataset.type.includes(type);
  const yearOk = !year || card.dataset.year === year;

  return queryOk && regionOk && typeOk && yearOk;
}

function applyFilters() {
  if (!cards.length) {
    return;
  }

  const query = (searchInput?.value || '').trim().toLowerCase();
  const region = regionSelect?.value || '';
  const type = typeSelect?.value || '';
  const year = yearSelect?.value || '';
  let visible = 0;

  cards.forEach(card => {
    const matched = matchCard(card, query, region, type, year);
    card.dataset.hidden = matched ? 'false' : 'true';
    if (matched) {
      visible += 1;
    }
  });

  if (resultCount) {
    resultCount.textContent = `${visible} 部影片`;
  }

  if (emptyState) {
    emptyState.classList.toggle('is-visible', visible === 0);
  }
}

readParams();
[searchInput, regionSelect, typeSelect, yearSelect].forEach(control => {
  if (control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  }
});
applyFilters();

const jumpLinks = document.querySelectorAll('[data-scroll-target]');
jumpLinks.forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.dataset.scrollTarget);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
