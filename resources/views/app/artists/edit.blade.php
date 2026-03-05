<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM - {{ __('app.artists') }}</title>

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
        <h2 class="mb-3">{{ __('app.artists') }}: {{ $artist->name }}</h2>

        @if ($errors->any())
          <div class="alert alert-danger">
            <ul class="mb-0">
              @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
              @endforeach
            </ul>
          </div>
        @endif

        <div class="card bg-dark text-white border-0 rounded-4">
          <div class="card-body">
            <form method="POST" action="{{ route('artists.update', $artist) }}" enctype="multipart/form-data">
              @csrf
              @method('PATCH')

              <div class="mb-3">
                <label class="form-label">{{ __('app.artist_name') }}</label>
                <input type="text" name="name" class="form-control" value="{{ old('name', $artist->name) }}" required>
              </div>

              <div class="mb-3">
                <label class="form-label">{{ __('app.artist_photo') }}</label>
                <input type="file" name="photo" class="form-control" accept=".jpg,.jpeg,.png,.webp">
              </div>

              @if($artist->photo_path)
                <img src="{{ asset('storage/'.$artist->photo_path) }}" alt="{{ $artist->name }}" class="rounded-3 mb-3" style="width:120px; height:120px; object-fit:cover;">
              @endif

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-light">Save</button>
                <a href="{{ route('create') }}" class="btn btn-outline-light">Back</a>
              </div>
            </form>
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
  <script src="{{ asset('/js/app-artists-edit.js') }}"></script>
</body>
</html>




