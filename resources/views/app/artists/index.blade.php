<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM - {{ __('app.artists') }}</title>
  <link rel="icon" type="image/x-icon" href="{{ asset('/img/logo.ico') }}">


  <link rel="stylesheet" href="{{ asset('/css/bootstrap.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/bootstrap-icons.min.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/owazym-2.css') }}" />
</head>
<body class="font-Ambassador">
  @include('app.navbar')

  <div class="d-flex">
    @include('app.sidebar', ['artists' => $sidebarArtists, 'hasMore' => $hasMore])

    <main class="app-content flex-grow-1 p-3 text-white">
      <div class="container" style="max-width: 760px;">
        <h2 class="mb-3">{{ __('app.artists') }}</h2>
        @if (session('status'))
          <div class="alert alert-success py-2">{{ session('status') }}</div>
        @endif
        @php($artistAdmin = auth()->user() && ((isset(auth()->user()->is_admin) && (bool) auth()->user()->is_admin) || (isset(auth()->user()->role) && in_array(strtolower(trim((string) auth()->user()->role)), ['admin', 'administrator'], true)) || strtolower(trim((string) auth()->user()->name)) === 'admin'))
        <form method="GET" action="{{ route('artists.index') }}" class="d-flex gap-2 mb-3">
          <input type="search" name="q" value="{{ $q ?? '' }}" class="form-control" placeholder="Search artist">
          <button type="submit" class="btn btn-outline-light">Search</button>
        </form>
        @if($artistAdmin)
        <div class="card bg-dark text-white mb-3">
          <div class="card-body">
            <div class="fw-semibold mb-2">Already in Popular Artists</div>
            @if(($popularArtists ?? collect())->isEmpty())
              <div class="text-white-50 small">No artists yet.</div>
            @else
              <div class="d-flex flex-wrap gap-2">
                @foreach($popularArtists as $popularArtist)
                  <span class="badge text-bg-success">{{ $popularArtist->name }}</span>
                @endforeach
              </div>
            @endif
          </div>
        </div>
        @endif
        <div class="card bg-dark text-white">
          <ul class="list-group list-group-flush">
            @forelse ($artists as $artist)
              <li class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center">
                <span>{{ $artist->name }}</span>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge text-bg-secondary">{{ $artist->musics_count }}</span>
                  @if($artistAdmin)
                    @if(!empty($artist->is_popular))
                      <form method="POST" action="{{ route('artists.popular.remove', $artist) }}">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-outline-danger">Remove</button>
                      </form>
                    @else
                      <form method="POST" action="{{ route('artists.popular.add', $artist) }}">
                        @csrf
                        <button type="submit" class="btn btn-sm btn-light">Add</button>
                      </form>
                    @endif
                  @endif
                </div>
              </li>
            @empty
              <li class="list-group-item bg-dark text-white-50">{{ __('app.no_artists_found') }}</li>
            @endforelse
          </ul>
        </div>
      </div>
    </main>
  </div>

  <script id="wishesData" type="application/json">@json(trans('app.wishes'))</script>
  <script id="i18nData" type="application/json">@json(trans('app.js'))</script>
  <script src="{{ asset('/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('/js/common.js') }}"></script>
  <script src="{{ asset('/js/player.js') }}"></script>
  <script src="{{ asset('/js/app-init.js') }}"></script>
  <script src="{{ asset('/js/app-artists-index.js') }}"></script>
</body>
</html>





