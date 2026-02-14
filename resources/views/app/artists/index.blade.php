<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM - Artists</title>

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
        <h2 class="mb-3">Artists</h2>
        <div class="card bg-dark text-white">
          <ul class="list-group list-group-flush">
            @forelse ($artists as $artist)
              <li class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center">
                <span>{{ $artist->name }}</span>
                <span class="badge text-bg-secondary">{{ $artist->musics()->count() }}</span>
              </li>
            @empty
              <li class="list-group-item bg-dark text-white-50">No artists found.</li>
            @endforelse
          </ul>
        </div>
      </div>
    </main>
  </div>

  <script id="wishesData" type="application/json">@json(trans('app.wishes'))</script>
  <script id="i18nData" type="application/json">@json(trans('app.js'))</script>
  <script>
    window.user = {
      firstName: "",
      plan: ""
    };
  </script>
  <script src="{{ asset('/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('/js/owazym.js') }}"></script>
</body>
</html>
