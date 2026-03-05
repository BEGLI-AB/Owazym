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
    @include('app.sidebar', ['artists' => $sidebarArtists, 'hasMore' => $hasMore])

    <main class="app-content flex-grow-1 p-3 text-white">
      <div class="container" style="max-width: 840px;">
        <h2 class="mb-3">{{ __('app.musics') }}: {{ $music->name }}</h2>

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
            <form method="POST" action="{{ route('musics.update', $music) }}" enctype="multipart/form-data">
              @csrf
              @method('PATCH')

              <div class="mb-3">
                <label class="form-label">{{ __('app.music_name') }}</label>
                <input type="text" name="name" class="form-control" value="{{ old('name', $music->name) }}" required>
              </div>

              <div class="mb-3">
                <label class="form-label">{{ __('app.artist') }}</label>
                @php($selectedArtists = collect(old('artist_ids', $music->artists->pluck('id')->all())))
                <div id="artistFields" class="d-grid gap-2">
                  @foreach (($selectedArtists->isEmpty() ? collect([null]) : $selectedArtists) as $aid)
                    <div class="d-flex gap-2 align-items-center artist-row">
                      <select name="artist_ids[]" class="form-select" required>
                        <option value="" disabled {{ $aid ? '' : 'selected' }}>{{ __('app.select_artist') }}</option>
                        @foreach ($artists as $artist)
                          <option value="{{ $artist->id }}" @selected((int)$aid === $artist->id)>{{ $artist->name }}</option>
                        @endforeach
                      </select>
                      <button type="button" class="btn btn-outline-light btn-sm remove-artist" {{ $loop->first ? 'disabled' : '' }}>{{ __('app.remove') }}</button>
                    </div>
                  @endforeach
                </div>
                <button type="button" class="btn btn-outline-light btn-sm mt-2" id="addArtistBtn">+ {{ __('app.add_artist_button') }}</button>
              </div>

              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">{{ __('app.year') }}</label>
                  <select name="year_id" class="form-select" required>
                    @foreach ($years as $year)
                      <option value="{{ $year->id }}" @selected((int) old('year_id', $music->year_id) === $year->id)>{{ $year->date }}</option>
                    @endforeach
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ __('app.language') }}</label>
                  <select name="language_id" class="form-select" required>
                    @foreach ($languages as $language)
                      <option value="{{ $language->id }}" @selected((int) old('language_id', $music->language_id) === $language->id)>{{ $language->name }}</option>
                    @endforeach
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ __('app.category') }}</label>
                  <select name="category_id" class="form-select" required>
                    @foreach ($categories as $category)
                      <option value="{{ $category->id }}" @selected((int) old('category_id', $music->category_id) === $category->id)>{{ $category->name }}</option>
                    @endforeach
                  </select>
                </div>
              </div>

              <div class="row g-3 mt-1">
                <div class="col-md-6">
                  <label class="form-label">{{ __('app.audio_file') }}</label>
                  <input type="file" name="audio" class="form-control" accept=".mp3,.wav,.ogg,.flac,.m4a">
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ __('app.cover_image') }}</label>
                  <input type="file" name="cover" class="form-control" accept=".jpg,.jpeg,.png,.webp">
                </div>
              </div>

              <div class="d-flex gap-2 mt-3">
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
  <script src="{{ asset('/js/app-music-edit.js') }}"></script>
</body>
</html>




