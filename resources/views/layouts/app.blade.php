<!doctype html>
<html lang="{{ app()->getLocale() }}">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>OWAZYM</title>
  <link rel="stylesheet" href="{{ asset('/css/bootstrap.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/owazym-2.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/bootstrap-icons.min.css') }}" />
</head>

<body class="font-Ambassador">
  @php($artists = $artists ?? collect())
  @php($hasMore = $hasMore ?? false)
  @php($playlists = $playlists ?? collect())
  @php($musicsSource = $musics ?? collect())
  @php($musicsList = method_exists($musicsSource, 'getCollection') ? $musicsSource->getCollection() : collect($musicsSource))
  @php($albumMusics = $albumMusics ?? $musicsList)
  @php($popularArtists = $popularArtists ?? collect())
  @php($newMusics = $newMusics ?? collect())
  @php($popularGenres = $popularGenres ?? collect())
  @php($genreMusics = $genreMusics ?? collect())
  @php($genres = $genres ?? collect())
  @php($countries = $countries ?? collect())
  @php($years = $years ?? collect())
  @php($playlist = $playlist ?? null)
  @php($tracks = $tracks ?? collect())
  @php($selectedArtistId = (int) ($selectedArtistId ?? 0))
  @php($selectedArtist = $selectedArtist ?? null)
  @php($featuredMusic = $featuredMusic ?? $musicsList->first())
  @php($artistCover = $selectedArtist?->photo_path ? asset('storage/'.$selectedArtist->photo_path) : null)
  @php($featuredCover = $artistCover ?? $featuredMusic?->cover_url ?? ($featuredCover ?? asset('/img/1.jpg')))
  @php($lockAlbumCover = $selectedArtistId > 0)

  @include('app.navbar')

  <div class="d-flex">
    @include('app.sidebar')

    <main class="app-content flex-grow-1 p-3 text-white">
      <script id="playlistData" type="application/json">@json($playlists->map(fn ($item) => ['id' => $item->id, 'name' => $item->name])->values())</script>

      <template id="vue-home-template">
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
              @foreach ($musicsList as $music)
              @php($musicQuery = array_merge(request()->query(), ['music_id' => $music->id]))
              @php($musicCover = $music->cover_url)
              <div
                class="music-card bg-dark"
                data-url="{{ url('/').'?'.http_build_query($musicQuery).'#album' }}"
                data-music-id="{{ $music->id }}"
                data-audio-url="{{ $music->audio_path ? asset('storage/'.$music->audio_path) : '' }}"
                data-title="{{ $music->name }}"
                data-artist="{{ $music->artists->pluck('name')->join(', ') }}"
                data-cover-url="{{ $musicCover }}">
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
            <a class="text-white text-decoration-none d-flex flex-column align-items-center me-3" href="{{ $artistUrl }}" style="min-width: 170px;">
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
            <div
              class="music-card bg-dark"
              data-url="{{ $newMusicUrl }}"
              data-music-id="{{ $newMusic->id }}"
              data-audio-url="{{ $newMusic->audio_path ? asset('storage/'.$newMusic->audio_path) : '' }}"
              data-title="{{ $newMusic->name }}"
              data-artist="{{ $newMusic->artists->pluck('name')->join(', ') }}"
              data-cover-url="{{ $newMusicCover }}">
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
              <div
                class="music-card bg-dark"
                data-url="{{ $genreMusicUrl }}"
                data-music-id="{{ $genreMusic->id }}"
                data-audio-url="{{ $genreMusic->audio_path ? asset('storage/'.$genreMusic->audio_path) : '' }}"
                data-title="{{ $genreMusic->name }}"
                data-artist="{{ $genreMusic->artists->pluck('name')->join(', ') }}"
                data-cover-url="{{ $genreCover }}">
                <img src="{{ $genreCover }}" alt="{{ __('app.cover_image') }}">
                <div class="title">{{ $genreMusic->name }}</div>
                <div class="artist">{{ $genreMusic->artists->pluck('name')->join(', ') }}</div>
              </div>
              @endforeach
            </div>
          </div>
          @endforeach
        </section>
      </template>

      <template id="vue-album-template">
        <section class="album-page">
          <a class="icon-ghost album-close" data-hash="#home" href="{{ url('/') }}#home" aria-label="{{ __('app.close_player') }}">
            <i class="bi bi-x-lg"></i>
          </a>

          <div class="album-hero">
            <div class="album-cover rounded-3 overflow-hidden">
              <img
                class="rounded-3"
                src="{{ $featuredCover }}"
                data-default-cover="{{ $featuredCover }}"
                data-lock-cover="{{ $lockAlbumCover ? '1' : '0' }}"
                alt="{{ __('app.cover_image') }}">
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
              <span class="track-num">{{ $index === 0 ? '' : $index + 1 }}</span>
              <div class="track-main">
                <div class="track-title">{{ $music->name }}</div>
                <div class="track-artist">{{ $music->artists->pluck('name')->join(', ') }}</div>
              </div>
              <div class="track-time text-end">3:2{{ $index }}</div>
            </div>
            @endforeach
          </div>
        </section>
      </template>

      <template id="vue-search-template">
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
            @foreach ($musicsList as $music)
            @php($musicUrl = url('/').'?'.http_build_query(['music_id' => $music->id]).'#album')
            <a
              class="search-card"
              href="{{ $musicUrl }}"
              data-music-id="{{ $music->id }}"
              data-audio-url="{{ $music->audio_path ? asset('storage/'.$music->audio_path) : '' }}"
              data-title="{{ $music->name }}"
              data-artist="{{ $music->artists->pluck('name')->join(', ') }}"
              data-cover-url="{{ $music->cover_url }}">
              <div class="search-card-media">
                <img src="{{ $music->cover_url }}" alt="{{ __('app.cover_image') }}">
              </div>
              <div class="search-card-title">{{ $music->name }}</div>
            </a>
            @endforeach
          </div>
        </section>

        <div class="modal fade" id="searchFiltersModal" tabindex="-1" aria-labelledby="searchFiltersModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-black text-white border border-secondary-subtle">
              <div class="modal-header border-secondary-subtle">
                <h5 class="modal-title" id="searchFiltersModalLabel">{{ __('app.search') }}</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form method="GET" action="{{ route('search') }}">
                <input type="hidden" name="q" value="{{ request('q') }}">
                <div class="modal-body">
                  <div class="d-grid gap-2">
                    <div class="bg-dark rounded-3 p-3">
                      <label class="form-label mb-1 text-white-50">{{ __('app.genres') ?? 'Genres' }}</label>
                      <select class="form-select bg-dark text-white border-secondary" name="genre_id">
                        <option value="">{{ __('app.any') ?? 'Any' }}</option>
                        @foreach ($genres as $genre)
                        <option value="{{ $genre->id }}" @selected((int) request('genre_id') === (int) $genre->id)>{{ $genre->name }}</option>
                        @endforeach
                      </select>
                    </div>

                    <div class="bg-dark rounded-3 p-3">
                      <label class="form-label mb-1 text-white-50">{{ __('app.countries') ?? 'Countries' }}</label>
                      <select class="form-select bg-dark text-white border-secondary" name="country_id">
                        <option value="">{{ __('app.any') ?? 'Any' }}</option>
                        @foreach ($countries as $country)
                        <option value="{{ $country->id }}" @selected((int) request('country_id') === (int) $country->id)>{{ $country->name }}</option>
                        @endforeach
                      </select>
                    </div>

                    <div class="bg-dark rounded-3 p-3">
                      <label class="form-label mb-1 text-white-50">{{ __('app.year') ?? 'Year' }}</label>
                      <select class="form-select bg-dark text-white border-secondary" name="year_id">
                        <option value="">{{ __('app.any') ?? 'Any' }}</option>
                        @foreach ($years as $year)
                        <option value="{{ $year->id }}" @selected((int) request('year_id') === (int) $year->id)>{{ $year->date }}</option>
                        @endforeach
                      </select>
                    </div>
                  </div>
                </div>
                <div class="modal-footer border-secondary-subtle d-flex">
                  <a href="{{ route('search', ['q' => request('q')]) }}" class="btn btn-outline-light flex-fill">{{ __('app.clear') ?? 'Clear' }}</a>
                  <button type="submit" class="btn btn-primary flex-fill">{{ __('app.show_results') ?? 'Show Results' }}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </template>

      <template id="vue-playlist-template">
        <div class="container" style="max-width: 1080px;">
          @if (session('status'))
          <div class="alert alert-info border-0 rounded-4">{{ session('status') }}</div>
          @endif

          <section class="rounded-4 p-3 mb-3 bg-dark border border-secondary-subtle">
            <div class="d-flex flex-wrap align-items-end justify-content-between gap-3">
              <div class="flex-grow-1">
                <p class="text-uppercase mb-1 text-white-50 small" style="letter-spacing:.12em;">{{ __('app.my_playlist') }}</p>
                <h6 class="mb-2">{{ __('app.create') }} {{ __('app.my_playlist') }}</h6>
                <form method="POST" action="{{ route('playlists.store') }}" class="d-flex flex-wrap gap-2">
                  @csrf
                  <input
                    type="text"
                    name="name"
                    class="form-control"
                    style="max-width: 320px;"
                    placeholder="{{ __('app.new_playlist_name') }}"
                    required
                    maxlength="120">
                  <button type="submit" class="btn btn-light btn-sm rounded-pill px-3">
                    <i class="bi bi-folder-plus me-1"></i> {{ __('app.create') }}
                  </button>
                </form>
              </div>
              <div class="d-flex flex-wrap gap-2">
                @foreach ($playlists as $item)
                <a
                  href="{{ route('playlist.index', ['playlist_id' => $item->id]) }}"
                  class="btn btn-sm rounded-pill px-3 {{ (int) $item->id === (int) ($playlist->id ?? 0) ? 'btn-light text-dark' : 'btn-outline-light' }}">
                  {{ $item->name }}
                </a>
                @endforeach
              </div>
            </div>
          </section>

          <section class="rounded-4 p-3 mb-3" style="background: linear-gradient(135deg, rgba(42,11,74,.95), rgba(131,20,78,.85)); border:1px solid rgba(255,255,255,.08);">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <p class="text-uppercase mb-1 text-white-50 small" style="letter-spacing:.12em;">{{ __('app.my_playlist') }}</p>
                <h4 class="mb-1">{{ $playlist->name ?? __('app.no_playlist_selected') }}</h4>
                <div class="small text-white-50">{{ $tracks->count() }} {{ __('app.tracks_word') }}</div>
              </div>
              <div class="d-flex gap-2">
                <a href="{{ url('/') }}#album" class="btn btn-light btn-sm rounded-pill px-3">
                  <i class="bi bi-play-fill me-1"></i> {{ __('app.start_listening') }}
                </a>
                @if($playlist)
                <form method="POST" action="{{ route('playlists.destroy', $playlist) }}" onsubmit="return confirm('{{ __('app.confirm_delete_playlist') }}');">
                  @csrf
                  @method('DELETE')
                  <button type="submit" class="btn btn-outline-danger btn-sm rounded-pill px-3">
                    <i class="bi bi-trash me-1"></i> {{ __('app.delete_playlist') }}
                  </button>
                </form>
                @endif
              </div>
            </div>
          </section>

          @if($tracks->isEmpty())
          <div class="card bg-dark text-white border-0 rounded-4">
            <div class="card-body py-5 text-center">
              <i class="bi bi-music-note-beamed" style="font-size:2rem;"></i>
              <h4 class="mt-3 mb-2">{{ $playlist ? __('app.playlist_empty') : __('app.create_playlist_to_start') }}</h4>
              <p class="text-white-50 mb-0">{{ $playlist ? __('app.playlist_empty_hint') : __('app.use_form_then_add_tracks') }}</p>
            </div>
          </div>
          @else
          <div class="card bg-dark text-white border-0 rounded-4 shadow-sm overflow-hidden">
            <div class="list-group list-group-flush">
              @foreach($tracks as $track)
              <div class="list-group-item bg-transparent border-secondary-subtle text-white px-3 py-3">
                <div class="d-flex align-items-center gap-3">
                  <img src="{{ $track->cover_url }}" alt="{{ $track->name }}" class="rounded-2" style="width:56px; height:56px; object-fit:cover;">
                  <div class="flex-grow-1 min-w-0">
                    <div class="fw-semibold text-truncate">{{ $track->name }}</div>
                    <div class="small text-white-50 text-truncate">{{ $track->artists->pluck('name')->join(', ') ?: __('app.unknown_artist') }}</div>
                    <div class="small text-white-50">
                      {{ $track->year?->date ?? __('app.unknown_year') }}
                      &middot;
                      {{ $track->category?->name ?? __('app.no_category') }}
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-2 flex-shrink-0">
                    <a
                      href="{{ url('/').'?music_id='.$track->id.'#album' }}"
                      class="btn btn-outline-light btn-sm rounded-pill px-3"
                      data-music-id="{{ $track->id }}"
                      data-audio-url="{{ $track->audio_path ? asset('storage/'.$track->audio_path) : '' }}"
                      data-title="{{ $track->name }}"
                      data-artist="{{ $track->artists->pluck('name')->join(', ') }}"
                      data-cover-url="{{ $track->cover_url }}">
                      <i class="bi bi-play-fill"></i>
                    </a>
                    @if($playlist)
                    <form method="POST" action="{{ route('playlist-tracks.destroy') }}">
                      @csrf
                      @method('DELETE')
                      <input type="hidden" name="playlist_id" value="{{ $playlist->id }}">
                      <input type="hidden" name="music_id" value="{{ $track->id }}">
                      <button type="submit" class="btn btn-outline-danger btn-sm rounded-pill px-3">
                        <i class="bi bi-trash"></i>
                      </button>
                    </form>
                    @endif
                  </div>
                </div>
              </div>
              @endforeach
            </div>
          </div>
          @endif
        </div>
      </template>

      <div id="app"></div>
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
  <script src="{{ asset('/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('/js/common.js') }}"></script>
  <script src="{{ asset('/js/player.js') }}"></script>
  @vite('resources/js/app.js')
  <script src="{{ asset('/js/app-init.js') }}"></script>
  <script src="{{ asset('/js/search.js') }}"></script>
</body>

</html>
