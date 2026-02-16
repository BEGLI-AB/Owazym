<!doctype html>
<html lang="{{ app()->getLocale() }}">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM - {{ __('app.my_playlist') }}</title>

  <link rel="stylesheet" href="{{ asset('/css/bootstrap.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/bootstrap-icons.min.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/owazym-2.css') }}" />
</head>

<body class="font-Ambassador">
  @include('app.navbar')

  <div class="d-flex">
    @include('app.sidebar', ['artists' => $artists, 'hasMore' => $hasMore])

    <main class="app-content flex-grow-1 p-3 text-white">
      <div class="container" style="max-width: 1080px;">
        <section class="rounded-4 p-4 mb-4" style="background: linear-gradient(135deg, rgba(42,11,74,.95), rgba(131,20,78,.85)); border:1px solid rgba(255,255,255,.08);">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <p class="text-uppercase mb-2 text-white-50" style="letter-spacing:.14em;">{{ __('app.my_playlist') }}</p>
              <h2 class="mb-2">{{ $playlist->name }}</h2>
              <div class="text-white-50">{{ $tracks->count() }} {{ __('app.tracks_word') }}</div>
            </div>
            <div class="d-flex gap-2">
              <a href="{{ url('/') }}#album" class="btn btn-light rounded-pill px-3">
                <i class="bi bi-play-fill me-1"></i> {{ __('app.start_listening') }}
              </a>
            </div>
          </div>
        </section>

        @if($tracks->isEmpty())
          <div class="card bg-dark text-white border-0 rounded-4">
            <div class="card-body py-5 text-center">
              <i class="bi bi-music-note-beamed" style="font-size:2rem;"></i>
              <h4 class="mt-3 mb-2">{{ __('app.playlist_empty') }}</h4>
              <p class="text-white-50 mb-0">{{ __('app.playlist_empty_hint') }}</p>
            </div>
          </div>
        @else
          <div class="row g-3">
            @foreach($tracks as $track)
              <div class="col-12">
                <article class="card bg-dark text-white border-0 rounded-4 shadow-sm">
                  <div class="card-body p-3 p-md-4">
                    <div class="d-flex flex-wrap align-items-center gap-3">
                      <img src="{{ $track->cover_url }}" alt="{{ $track->name }}" class="rounded-3" style="width:78px; height:78px; object-fit:cover;">
                      <div class="flex-grow-1">
                        <h5 class="mb-1">{{ $track->name }}</h5>
                        <div class="text-white-50">{{ $track->artists->pluck('name')->join(', ') ?: __('app.unknown_artist') }}</div>
                        <div class="small text-white-50 mt-1">
                          {{ $track->year?->date ?? __('app.unknown_year') }}
                          &middot;
                          {{ $track->category?->name ?? __('app.no_category') }}
                        </div>
                      </div>
                      <a href="{{ url('/').'?music_id='.$track->id.'#album' }}" class="btn btn-outline-light rounded-pill px-3">
                        <i class="bi bi-play-fill me-1"></i> {{ __('app.open') }}
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            @endforeach
          </div>
        @endif
      </div>
    </main>
  </div>

  <script id="wishesData" type="application/json">@json(trans('app.wishes'))</script>
  <script id="i18nData" type="application/json">@json(trans('app.js'))</script>
  <script src="{{ asset('/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('/js/owazym.js') }}?v={{ filemtime(public_path('js/owazym.js')) }}"></script>
</body>

</html>


