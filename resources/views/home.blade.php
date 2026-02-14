<!doctype html>
<html lang="ru">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM</title>

  <link rel="stylesheet" href="{{ asset('/css/bootstrap.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/bootstrap-icons.min.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/owazym-2.css') }}" />
</head>

<body class="font-Ambassador">
  @include('app.navbar')

  <div class="d-flex">
    @include('app.sidebar')

    <main class="app-content flex-grow-1 p-3 text-white">
      <section class="spotify-section main-page">
        <div>
          <h3>Популярные</h3>
        </div>

        <div class="viewport">
          <button class="overlay-arrow right" id="nextBtn" onclick="slide(1)" aria-label="Next">
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
          <button class="overlay-arrow left" id="prevBtn" onclick="slide(-1)" aria-label="Previous">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          <div class="scroll-row" id="row">
            @foreach ($musics as $music)
            @php($musicQuery = array_merge(request()->query(), ['music_id' => $music->id]))
            <div class="music-card bg-dark" data-url="{{ url('/').'?'.http_build_query($musicQuery).'#album' }}">
              <img src="{{ asset('/img/1.jpg') }}" alt="cover">
              <div class="title">{{ $music->name }}</div>
              <div class="artist">{{ $music->artists->pluck('name')->join(', ') }}</div>
            </div>
            @endforeach
          </div>
        </div>
      </section>

      <section class="album-page">
        <button class="album-close" data-hash="#home" aria-label="Close album">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="album-hero">
          <div class="album-cover">
            <img src="{{ asset('/img/1.jpg') }}" alt="Album cover">
          </div>
          <div class="album-info">
            <div class="album-title">{{ $featuredMusic?->name ?? 'Track' }}</div>
            <div class="album-meta">
              <span class="artist-dot"></span>
              <span class="artist-name">{{ $featuredMusic?->artists?->pluck('name')->join(', ') ?? 'Artist' }}</span>
              <span class="meta-dot"></span>
              <span>{{ $featuredMusic?->year?->date ?? 'Unknown year' }}</span>
            </div>
          </div>
        </div>

        <div class="album-actions">
          <button
            class="album-play"
            data-audio-url="{{ $featuredMusic?->audio_path ? asset('storage/'.$featuredMusic->audio_path) : '' }}"
            data-title="{{ $featuredMusic?->name ?? 'Track' }}"
            data-artist="{{ $featuredMusic?->artists?->pluck('name')->join(', ') ?? 'Artist' }}">
            <i class="bi bi-play-fill"></i>
          </button>
          <button class="album-icon">
            <i class="bi bi-plus-lg"></i>
          </button>
          <button class="album-icon">
            <i class="bi bi-download"></i>
          </button>
        </div>

        <div class="album-tracklist">
          <div class="tracklist-head">
            <span>#</span>
            <span>Название</span>
            <span class="text-end"><i class="bi bi-clock"></i></span>
          </div>

          @foreach (($albumMusics ?? collect())->take(8) as $index => $music)
          <div
            class="track-row {{ (int) ($featuredMusic?->id ?? 0) === (int) $music->id ? 'active' : '' }}"
            data-audio-url="{{ $music->audio_path ? asset('storage/'.$music->audio_path) : '' }}"
            data-title="{{ $music->name }}"
            data-artist="{{ $music->artists->pluck('name')->join(', ') }}">
            <span class="track-num">{{ $index === 0 ? '▶' : $index + 1 }}</span>
            <div class="track-main">
              <div class="track-title">{{ $music->name }}</div>
              <div class="track-artist">{{ $music->artists->pluck('name')->join(', ') }}</div>
            </div>
            <div class="track-time text-end">3:2{{ $index }}</div>
          </div>
          @endforeach
        </div>
      </section>

      <img src="{{ asset('/img/image.png') }}" class="owazym-bg-logo" alt="">
    </main>
  </div>

  <footer class="player-bar player-ui">
    <div class="player-left">
      <img src="{{ asset('/img/1.jpg') }}" alt="Track">
      <div>
        <div class="track-now">Track</div>
        <div class="track-now-artist">Artist</div>
      </div>
      <button class="icon-ghost" aria-label="Like">
        <i class="bi bi-plus-lg"></i>
      </button>
    </div>

    <div class="player-center">
      <div class="player-controls">
        <button class="icon-ghost"><i class="bi bi-skip-backward-fill"></i></button>
        <button
          class="play-btn"
          data-audio-url="{{ $featuredMusic?->audio_path ? asset('storage/'.$featuredMusic->audio_path) : '' }}"
          data-title="{{ $featuredMusic?->name ?? 'Track' }}"
          data-artist="{{ $featuredMusic?->artists?->pluck('name')->join(', ') ?? 'Artist' }}">
          <i class="bi bi-play-fill"></i>
        </button>
        <button class="icon-ghost"><i class="bi bi-skip-forward-fill"></i></button>
      </div>
      <div class="player-progress">
        <span class="progress-current">0:00</span>
        <div class="progress-bar player-seekbar" role="slider" aria-label="Seek">
          <span class="bar-fill player-progress-fill"></span>
        </div>
        <span class="progress-duration">0:00</span>
      </div>
    </div>

    <div class="player-right">
      <button class="icon-ghost player-volume-btn" aria-label="Mute or unmute">
        <i class="bi bi-volume-up"></i>
      </button>
      <div class="volume-bar player-volume-bar" role="slider" aria-label="Volume">
        <span class="bar-fill player-volume-fill" style="width: 100%"></span>
      </div>
      <button class="icon-ghost player-close" aria-label="Close player">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  </footer>

  <script id="wishesData" type="application/json">@json(trans('app.wishes'))</script>
  <script id="i18nData" type="application/json">@json(trans('app.js'))</script>
  <script>
    window.user = {
      firstName: "{{ $firstName }}",
      plan: "{{ $plan }}"
    };
  </script>
  <script src="{{ asset('/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('/js/owazym.js') }}"></script>
</body>

</html>
