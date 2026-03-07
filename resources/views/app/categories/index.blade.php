<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM - {{ __('app.category') }}</title>
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
        <h2 class="mb-3">{{ __('app.category') }}</h2>
        <div class="card bg-dark text-white">
          <ul class="list-group list-group-flush">
            @forelse ($categories as $category)
              <li class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center">
                <span>{{ $category->name }}</span>
                <span class="badge text-bg-secondary">{{ $category->musics_count }}</span>
              </li>
            @empty
              <li class="list-group-item bg-dark text-white-50">No categories found.</li>
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
</body>
</html>
