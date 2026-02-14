<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM - Musics</title>

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
        <h2 class="mb-3">Musics</h2>
        <div class="card bg-dark text-white">
          <div class="table-responsive">
            <table class="table table-dark table-striped mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Artists</th>
                  <th>Year</th>
                  <th>Language</th>
                  <th>Category</th>
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
                    <td colspan="6" class="text-center text-white-50">No musics found.</td>
                  </tr>
                @endforelse
              </tbody>
            </table>
          </div>
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
