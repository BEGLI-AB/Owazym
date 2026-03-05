<!doctype html>
<html lang="{{ app()->getLocale() }}">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OWAZYM</title>
  <link rel="stylesheet" href="{{ asset('/css/bootstrap.css') }}">
  <link rel="stylesheet" href="{{ asset('/css/owazym-2.css') }}?v={{ filemtime(public_path('css/owazym-2.css')) }}">
  <link rel="stylesheet" href="{{ asset('/css/bootstrap-icons.min.css') }}">
</head>

<body class="font-Ambassador search-view">
  @include('app.navbar')

  @php($featuredCover = $featuredCover ?? asset('/img/1.jpg'))
  <div class="d-flex">
    @include('app.sidebar')

    <main class="app-content flex-grow-1 p-3 text-white">
      <section class="search-page">
        <div class="search-header">
          <form method="GET" action="{{ route('search') }}" class="search-bar app-search-form">
            <button type="submit" class="search-submit-btn" aria-label="{{ __('app.search') }}">
              <i class="bi bi-search"></i>
            </button>
            <input
              type="search"
              name="q"
              value="{{ request('q') }}"
              class="search-page-input"
              placeholder="{{ __('app.search') }}">
          </form>
          <button
            class="chip-btn chip-icon search-filter-btn"
            type="button"
            aria-label="{{ __('app.search') }}"
            data-bs-toggle="modal"
            data-bs-target="#searchFiltersModal"
            data-open-search-filters>
            <i class="bi bi-sliders2"></i>
          </button>
        </div>

        <div class="search-grid">
          @foreach ($musics as $music)
          @php($musicUrl = url('/').'?'.http_build_query(['music_id' => $music->id]).'#album')
          <a class="search-card" href="{{ $musicUrl }}">
            <div class="search-card-media">
              <img src="{{ $music->cover_url }}" alt="{{ __('app.cover_image') }}">
            </div>
            <div class="search-card-title">{{ $music->name }}</div>
          </a>
          @endforeach
        </div>
      </section>
    </main>
  </div>

  <div class="modal fade" id="searchFiltersModal" tabindex="-1" aria-labelledby="searchFiltersModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-black text-white border border-secondary-subtle">
        <div class="modal-header border-secondary-subtle">
          <h5 class="modal-title" id="searchFiltersModalLabel">Фильтры</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form method="GET" action="{{ route('search') }}">
          <input type="hidden" name="q" value="{{ request('q') }}">
          <div class="modal-body">
            <div class="d-grid gap-2">
              <div class="bg-dark rounded-3 p-3">
                <label class="form-label mb-1 text-white-50">Жанры</label>
                <select class="form-select bg-dark text-white border-secondary" name="genre_id">
                  <option value="">Любая</option>
                  @foreach ($genres as $genre)
                    <option value="{{ $genre->id }}" @selected((int) request('genre_id') === (int) $genre->id)>{{ $genre->name }}</option>
                  @endforeach
                </select>
              </div>

              <div class="bg-dark rounded-3 p-3">
                <label class="form-label mb-1 text-white-50">Страны</label>
                <select class="form-select bg-dark text-white border-secondary" name="country_id">
                  <option value="">Любая</option>
                  @foreach ($countries as $country)
                    <option value="{{ $country->id }}" @selected((int) request('country_id') === (int) $country->id)>{{ $country->name }}</option>
                  @endforeach
                </select>
              </div>

              <div class="bg-dark rounded-3 p-3">
                <label class="form-label mb-1 text-white-50">Год</label>
                <select class="form-select bg-dark text-white border-secondary" name="year_id">
                  <option value="">Любая</option>
                  @foreach ($years as $year)
                    <option value="{{ $year->id }}" @selected((int) request('year_id') === (int) $year->id)>{{ $year->date }}</option>
                  @endforeach
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer border-secondary-subtle d-flex">
            <a href="{{ route('search', ['q' => request('q')]) }}" class="btn btn-outline-light flex-fill">Очистить фильтр</a>
            <button type="submit" class="btn btn-primary flex-fill">Показать результаты</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <footer class="player-bar player-ui">
    <div class="player-left">
      <img src="{{ $featuredCover }}" data-default-cover="{{ $featuredCover }}" alt="{{ __('app.track') }}">
      <div>
        <div class="track-now">{{ __('app.track') }}</div>
        <div class="track-now-artist">{{ __('app.artist') }}</div>
      </div>
      <button class="icon-ghost" aria-label="{{ __('app.like') }}">
        <i class="bi bi-plus-lg"></i>
      </button>
    </div>

    <div class="player-center">
      <div class="player-controls">
        <button class="icon-ghost"><i class="bi bi-skip-backward-fill"></i></button>
        <button class="icon-ghost play-btn">
          <i class="bi bi-play-fill"></i>
        </button>
        <button class="icon-ghost"><i class="bi bi-skip-forward-fill"></i></button>
      </div>
      <div class="player-progress">
        <span class="progress-current">0:00</span>
        <div class="progress-bar player-seekbar" role="slider" aria-label="{{ __('app.seek') }}">
          <span class="bar-fill player-progress-fill"></span>
        </div>
        <span class="progress-duration">0:00</span>
      </div>
    </div>

    <div class="player-right">
      <button class="icon-ghost player-volume-btn" aria-label="{{ __('app.mute_or_unmute') }}">
        <i class="bi bi-volume-up"></i>
      </button>
      <div class="volume-bar player-volume-bar" role="slider" aria-label="{{ __('app.volume') }}">
        <span class="bar-fill player-volume-fill" style="width: 100%"></span>
      </div>
      <a class="icon-ghost player-close" data-hash="#home" href="{{ url('/') }}#home" aria-label="{{ __('app.close_player') }}">
        <i class="bi bi-x"></i>
      </a>
    </div>
  </footer>

  <script id="wishesData" type="application/json">@json(trans('app.wishes'))</script>
  <script id="i18nData" type="application/json">@json(trans('app.js'))</script>
  <script id="playlistData" type="application/json">@json(($playlists ?? collect())->map(fn ($item) => ['id' => $item->id, 'name' => $item->name])->values())</script>
  <script>
    (function () {
      const applySearchTheme = () => {
        const body = document.body;
        if (!body) return;

        const isLight = body.classList.contains('light') || body.classList.contains('light-mode');
        const input = document.querySelector('.search-view .search-page-input');
        const submitBtn = document.querySelector('.search-view .search-submit-btn');
        const submitIcon = submitBtn ? submitBtn.querySelector('i') : null;
        const filterBtn = document.querySelector('.search-view .search-filter-btn');
        const filterIcon = filterBtn ? filterBtn.querySelector('i') : null;
        const cardTitles = document.querySelectorAll('.search-view .search-card-title');

        if (input) {
          input.style.setProperty('color', isLight ? '#0f172a' : '#ffffff', 'important');
          input.style.setProperty('-webkit-text-fill-color', isLight ? '#0f172a' : '#ffffff', 'important');
          input.style.setProperty('caret-color', isLight ? '#0f172a' : '#ffffff', 'important');
        }
        if (submitBtn) submitBtn.style.setProperty('color', isLight ? '#0f172a' : 'rgba(255,255,255,0.7)', 'important');
        if (submitIcon) submitIcon.style.setProperty('color', isLight ? '#0f172a' : 'rgba(255,255,255,0.55)', 'important');
        if (filterBtn) {
          filterBtn.style.setProperty('color', isLight ? '#0f172a' : '#ffffff', 'important');
          filterBtn.style.setProperty('border-color', isLight ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.12)', 'important');
          filterBtn.style.setProperty('background', isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.08)', 'important');
        }
        if (filterIcon) filterIcon.style.setProperty('color', isLight ? '#0f172a' : '#ffffff', 'important');
        if (cardTitles.length) {
          cardTitles.forEach((title) => {
            title.style.setProperty('color', isLight ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)', 'important');
          });
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySearchTheme, { once: true });
      } else {
        applySearchTheme();
      }

      const observer = new MutationObserver(applySearchTheme);
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    })();
  </script>
  <script src="{{ asset('/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('/js/common.js') }}"></script>
  <script src="{{ asset('/js/player.js') }}"></script>
  <script src="{{ asset('/js/app-init.js') }}"></script>
  <script src="{{ asset('/js/search.js') }}"></script>
</body>
</html>
