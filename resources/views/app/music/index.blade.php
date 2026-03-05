<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM - {{ __('app.musics') }}</title>

  <link rel="stylesheet" href="{{ asset('/css/bootstrap.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/bootstrap-icons.min.css') }}" />
  <link rel="stylesheet" href="{{ asset('/css/owazym-2.css') }}" />
</head>
<body class="font-Ambassador">
  @include('app.navbar')

  <div class="d-flex">
    @include('app.sidebar')

    <main class="app-content flex-grow-1 p-3 text-white">
      <div class="container" style="max-width: 960px;">
        <h2 class="mb-3">{{ __('app.musics') }}</h2>
        <div class="card bg-dark text-white">
          <div class="table-responsive d-none d-md-block">
            <table class="table table-dark table-striped mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ __('app.name') }}</th>
                  <th>{{ __('app.artists') }}</th>
                  <th>{{ __('app.year') }}</th>
                  <th>{{ __('app.language') }}</th>
                  <th>{{ __('app.category') }}</th>
                </tr>
              </thead>
              <tbody>
                @forelse ($musics as $music)
                  <tr>
                    <td>{{ $music->id }}</td>
                    <td>{{ $music->name }}</td>
                    <td>{{ $music->artists->pluck('name')->join(', ') }}</td>
                    <td>{{ $music->year?->date }}</td>
                    <td>{{ $music->language?->name }}</td>
                    <td>{{ $music->category?->name }}</td>
                  </tr>
                @empty
                  <tr>
                    <td colspan="6" class="text-center text-white-50">{{ __('app.no_musics_found') }}</td>
                  </tr>
                @endforelse
              </tbody>
            </table>
          </div>

          <div class="d-md-none p-2">
            @forelse ($musics as $music)
              <article class="rounded-3 p-2 mb-2" style="background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);">
                <div class="fw-semibold">{{ $music->name }}</div>
                <div class="small text-white-50">{{ $music->artists->pluck('name')->join(', ') }}</div>
                <div class="small text-white-50 mt-1">
                  {{ $music->year?->date }} &middot; {{ $music->language?->name }} &middot; {{ $music->category?->name }}
                </div>
              </article>
            @empty
              <div class="text-center text-white-50 py-3">{{ __('app.no_musics_found') }}</div>
            @endforelse
          </div>
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
  <script src="{{ asset('/js/app-music-index.js') }}"></script>
</body>
</html>






