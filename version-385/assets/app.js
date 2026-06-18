(function () {
    var body = document.body;
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
            body.classList.toggle('menu-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showHero(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        showHero(0);
        startHero();
    }

    var pageFilter = document.querySelector('[data-page-filter]');
    var filterList = document.querySelector('[data-filter-list]');

    if (pageFilter && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        pageFilter.addEventListener('input', function () {
            var keyword = pageFilter.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.getAttribute('data-movie-search') || '';
                card.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    var searchInput = document.getElementById('global-search');
    var searchResults = document.getElementById('search-results');
    var searchStatus = document.getElementById('search-status');
    var typeFilter = document.getElementById('filter-type');
    var regionFilter = document.getElementById('filter-region');
    var yearFilter = document.getElementById('filter-year');

    if (searchInput && searchResults && window.MOVIE_SEARCH_INDEX) {
        var data = window.MOVIE_SEARCH_INDEX;
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function uniqueValues(key) {
            var values = [];
            data.forEach(function (item) {
                if (item[key] && values.indexOf(item[key]) === -1) {
                    values.push(item[key]);
                }
            });
            return values.sort(function (a, b) {
                return String(b).localeCompare(String(a), 'zh-CN');
            }).slice(0, 80);
        }

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(typeFilter, uniqueValues('type'));
        fillSelect(regionFilter, uniqueValues('region'));
        fillSelect(yearFilter, uniqueValues('year'));

        function cardHtml(item) {
            return [
                '<article class="movie-card hover-lift">',
                '  <a href="' + item.url + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
                '    <div class="poster-wrap">',
                '      <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '      <span class="card-badge">' + escapeHtml(item.type) + '</span>',
                '      <span class="play-chip">播放</span>',
                '    </div>',
                '    <div class="card-body">',
                '      <h3>' + escapeHtml(item.title) + '</h3>',
                '      <p>' + escapeHtml(item.oneLine) + '</p>',
                '      <div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
                '    </div>',
                '  </a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function runSearch() {
            var keyword = searchInput.value.trim().toLowerCase();
            var type = typeFilter ? typeFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';

            var matches = data.filter(function (item) {
                var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
                return (!keyword || text.indexOf(keyword) !== -1) &&
                    (!type || item.type === type) &&
                    (!region || item.region === region) &&
                    (!year || item.year === year);
            }).slice(0, 120);

            searchResults.innerHTML = matches.map(cardHtml).join('');
            if (searchStatus) {
                searchStatus.textContent = matches.length ? '已展示匹配结果，可继续输入关键词缩小范围。' : '没有找到匹配内容，请更换关键词或筛选条件。';
            }
        }

        searchInput.value = initialQuery;
        [searchInput, typeFilter, regionFilter, yearFilter].forEach(function (node) {
            if (node) {
                node.addEventListener('input', runSearch);
                node.addEventListener('change', runSearch);
            }
        });
        runSearch();
    }
})();
