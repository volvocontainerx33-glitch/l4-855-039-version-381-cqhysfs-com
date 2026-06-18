(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(' / ');
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
      '  <a class="movie-card__poster" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="./' + escapeHtml(movie.cover_num) + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-card__year">' + escapeHtml(movie.year) + '</span>',
      '    <span class="movie-card__play">立即播放</span>',
      '  </a>',
      '  <div class="movie-card__body">',
      '    <h3 class="movie-card__title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-card__desc">' + escapeHtml(movie.one_line) + '</p>',
      '    <div class="movie-card__meta">',
      '      <a href="category-' + escapeHtml(movie.category) + '.html">' + escapeHtml(movie.category_name) + '</a>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <p class="movie-card__tags">' + escapeHtml(tags) + '</p>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function runSearch() {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.getElementById('searchPageInput');
    var results = document.getElementById('searchResults');
    var title = document.getElementById('searchTitle');
    var summary = document.getElementById('searchSummary');
    var movies = window.SEARCH_MOVIES || [];

    if (input) {
      input.value = keyword;
    }
    if (!results || !keyword) {
      return;
    }

    var lowerKeyword = keyword.toLowerCase();
    var matched = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre_raw,
        (movie.tags || []).join(' '),
        movie.one_line,
        movie.category_name
      ].join(' ').toLowerCase();
      return haystack.indexOf(lowerKeyword) !== -1;
    }).slice(0, 100);

    if (title) {
      title.textContent = '“' + keyword + '”的搜索结果';
    }
    if (summary) {
      summary.textContent = matched.length + ' 条结果';
    }

    if (matched.length) {
      results.innerHTML = matched.map(card).join('\n');
    } else {
      results.innerHTML = '<div class="detail-article"><h2>没有找到匹配内容</h2><p>请尝试更换片名、地区、年份或类型关键词。</p></div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runSearch);
  } else {
    runSearch();
  }
})();
