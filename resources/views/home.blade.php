<!doctype html>
<html lang="{{ app()->getLocale() }}">

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
          <h3>{{ __('app.popular') }}</h3>
        </div>

        <div class="viewport">
          <button class="overlay-arrow right" id="nextBtn" onclick="slide(1)" aria-label="{{ __('app.next') }}">
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
          <button class="overlay-arrow left" id="prevBtn" onclick="slide(-1)" aria-label="{{ __('app.previous') }}">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          <div class="scroll-row" id="row">
            @foreach ($musics as $music)
            @php($musicQuery = array_merge(request()->query(), ['music_id' => $music->id]))
            @php($musicCover = $music->cover_url)
            <div class="music-card bg-dark" data-url="{{ url('/').'?'.http_build_query($musicQuery).'#album' }}">
              <img src="{{ $musicCover }}" alt="{{ __('app.cover_image') }}">
              <div class="title">{{ $music->name }}</div>
              <div class="artist">{{ $music->artists->pluck('name')->join(', ') }}</div>
            </div>
            @endforeach
          </div>
        </div>
      </section>

      <section class="spotify-section main-page mt-4">
        <div>
          <h3>{{ __('app.popular_artists') }}</h3>
        </div>
        <div class="scroll-row overflow-auto">
          @foreach ($popularArtists as $artist)
          @php($artistUrl = url('/').'?'.http_build_query(array_merge(request()->query(), ['artist_id' => $artist->id])).'#album')
          <a
            class="text-white text-decoration-none d-flex flex-column align-items-center me-3"
            href="{{ $artistUrl }}"
            style="min-width: 170px;">
            <img
              src="{{ asset('storage/'.$artist->photo_path) }}"
              alt="{{ __('app.artist_photo') }}"
              class="rounded-circle"
              style="width:150px; height:150px; object-fit:cover;">
            <div class="artist mt-2 text-center">{{ $artist->name }}</div>
          </a>
          @endforeach
        </div>
      </section>

      <section class="spotify-section main-page mt-4">
        <div>
          <h3>{{ __('app.new_releases') }}</h3>
        </div>
        <div class="scroll-row overflow-auto">
          @foreach ($newMusics as $newMusic)
          @php($newMusicUrl = url('/').'?'.http_build_query(array_merge(request()->query(), ['music_id' => $newMusic->id])).'#album')
          @php($newMusicCover = $newMusic->cover_url)
          <div class="music-card bg-dark" data-url="{{ $newMusicUrl }}">
            <img src="{{ $newMusicCover }}" alt="{{ __('app.cover_image') }}">
            <div class="title">{{ $newMusic->name }}</div>
            <div class="artist">{{ $newMusic->artists->pluck('name')->join(', ') }}</div>
          </div>
          @endforeach
        </div>
      </section>

      <section class="spotify-section main-page mt-4">
        <div>
          <h3>{{ __('app.popular_by_genres') }}</h3>
        </div>
        @foreach ($popularGenres as $genre)
        <div class="mt-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h5 class="mb-0">{{ $genre->name }}</h5>
            <small class="text-white-50">{{ $genre->musics_count }} {{ __('app.tracks_word') }}</small>
          </div>
          <div class="scroll-row overflow-auto">
            @foreach (($genreMusics[$genre->id] ?? collect())->take(6) as $genreMusic)
            @php($genreMusicUrl = url('/').'?'.http_build_query(array_merge(request()->query(), ['music_id' => $genreMusic->id])).'#album')
            @php($genreCover = $genreMusic->cover_url)
            <div class="music-card bg-dark" data-url="{{ $genreMusicUrl }}">
              <img src="{{ $genreCover }}" alt="{{ __('app.cover_image') }}">
              <div class="title">{{ $genreMusic->name }}</div>
              <div class="artist">{{ $genreMusic->artists->pluck('name')->join(', ') }}</div>
            </div>
            @endforeach
          </div>
        </div>
        @endforeach
      </section>

      <section class="album-page">
        @php($featuredCover = $featuredMusic?->cover_url ?? asset('/img/1.jpg'))
        
        <a class="icon-ghost album-close" data-hash="#home" href="{{ url('/') }}#home" aria-label="{{ __('app.close_player') }}">
        <i class="bi bi-x-lg"></i>
      </a>

        <div class="album-hero">
          <div class="album-cover">
            <img src="{{ $featuredCover }}" data-default-cover="{{ $featuredCover }}" alt="{{ __('app.cover_image') }}">
          </div>
        <div class="album-info">
          <div class="album-title">{{ $featuredMusic?->name ?? __('app.track') }}</div>
          <div class="album-meta">
            <span class="artist-dot"></span>
            <span class="artist-name">{{ $featuredMusic?->artists?->pluck('name')->join(', ') ?? __('app.artist') }}</span>
            <span class="meta-dot"></span>
            <span>{{ $featuredMusic?->year?->date ?? __('app.unknown_year') }}</span>
          </div>
        </div>
        </div>

        <div class="album-actions">
          <button
            class="album-play"
            data-music-id="{{ $featuredMusic?->id ?? '' }}"
            data-audio-url="{{ $featuredMusic?->audio_path ? asset('storage/'.$featuredMusic->audio_path) : '' }}"
            data-title="{{ $featuredMusic?->name ?? __('app.track') }}"
            data-artist="{{ $featuredMusic?->artists?->pluck('name')->join(', ') ?? __('app.artist') }}"
            data-cover-url="{{ $featuredCover }}">
            <i class="bi bi-play-fill"></i>
          </button>
          <button class="album-icon album-add" type="button" data-music-id="{{ $featuredMusic?->id ?? '' }}" aria-label="{{ __('app.add_to_playlist') }}">
            <i class="bi bi-plus-lg"></i>
          </button>
          <button class="album-icon" aria-label="{{ __('app.download') }}">
            <i class="bi bi-download"></i>
          </button>
        </div>

        <div class="album-tracklist">
          <div class="tracklist-head">
            <span>#</span>
            <span>{{ __('app.title') }}</span>
            <span class="text-end"><i class="bi bi-clock"></i></span>
          </div>

          @foreach (($albumMusics ?? collect())->take(8) as $index => $music)
          <div
            class="track-row {{ (int) ($featuredMusic?->id ?? 0) === (int) $music->id ? 'active' : '' }}"
            data-music-id="{{ $music->id }}"
            data-audio-url="{{ $music->audio_path ? asset('storage/'.$music->audio_path) : '' }}"
            data-title="{{ $music->name }}"
            data-artist="{{ $music->artists->pluck('name')->join(', ') }}"
            data-cover-url="{{ $music->cover_url }}">
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
        <button
          class="play-btn"
          data-music-id="{{ $featuredMusic?->id ?? '' }}"
          data-audio-url="{{ $featuredMusic?->audio_path ? asset('storage/'.$featuredMusic->audio_path) : '' }}"
          data-title="{{ $featuredMusic?->name ?? __('app.track') }}"
          data-artist="{{ $featuredMusic?->artists?->pluck('name')->join(', ') ?? __('app.artist') }}"
          data-cover-url="{{ $featuredCover }}">
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
        <i class="bi bi-x-lg"></i>
      </a>
    </div>
  </footer>

  <script id="wishesData" type="application/json">@json(trans('app.wishes'))</script>
  <script id="i18nData" type="application/json">@json(trans('app.js'))</script>
  <script>
    window.csrfToken = "{{ csrf_token() }}";
  </script>
  <script src="{{ asset('/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('/js/owazym.js') }}?v={{ filemtime(public_path('js/owazym.js')) }}"></script>
</body>

</html>


