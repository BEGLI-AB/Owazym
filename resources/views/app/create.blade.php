<!doctype html>
<html lang="{{ app()->getLocale() }}">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM - {{ __('app.create') }}</title>

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
        <h2 class="mb-3">{{ __('app.create') }}</h2>

        @if (session('status'))
          <div class="alert alert-success">{{ session('status') }}</div>
        @endif

        @if ($errors->any())
          <div class="alert alert-danger">
            <ul class="mb-0">
              @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
              @endforeach
            </ul>
          </div>
        @endif

        <div class="card bg-dark text-white mb-4">
          <div class="card-body">
            <button class="btn btn-outline-light w-100 text-start mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#addMusicBlock" aria-expanded="true" aria-controls="addMusicBlock">
              {{ __('app.add_music') }}
            </button>
            <div class="collapse show" id="addMusicBlock">
            <form method="POST" action="{{ route('musics.store') }}" enctype="multipart/form-data">
              @csrf
              <div class="mb-3">
                <label class="form-label">{{ __('app.music_name') }}</label>
                <input type="text" name="name" class="form-control" value="{{ old('name') }}" required>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ __('app.artist') }}</label>
                <div id="artistFields" class="d-grid gap-2">
                  @php($oldArtistIds = collect(old('artist_ids', []))->filter())
                  @if ($oldArtistIds->isEmpty())
                    <div class="d-flex gap-2 align-items-center artist-row">
                      <select name="artist_ids[]" class="form-select" required>
                        <option value="" disabled selected>{{ __('app.select_artist') }}</option>
                        @foreach ($artists as $artist)
                          <option value="{{ $artist->id }}">{{ $artist->name }}</option>
                        @endforeach
                      </select>
                      <button type="button" class="btn btn-outline-light btn-sm remove-artist" aria-label="{{ __('app.remove') }}" disabled>{{ __('app.remove') }}</button>
                    </div>
                  @else
                    @foreach ($oldArtistIds as $aid)
                      <div class="d-flex gap-2 align-items-center artist-row">
                        <select name="artist_ids[]" class="form-select" required>
                          <option value="" disabled>{{ __('app.select_artist') }}</option>
                          @foreach ($artists as $artist)
                            <option value="{{ $artist->id }}" @selected((int)$aid === $artist->id)>{{ $artist->name }}</option>
                          @endforeach
                        </select>
                        <button type="button" class="btn btn-outline-light btn-sm remove-artist" aria-label="{{ __('app.remove') }}" {{ $loop->first ? 'disabled' : '' }}>{{ __('app.remove') }}</button>
                      </div>
                    @endforeach
                  @endif
                </div>
                <button type="button" class="btn btn-outline-light btn-sm mt-2" id="addArtistBtn">
                  + {{ __('app.add_artist_button') }}
                </button>
              </div>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">{{ __('app.year') }}</label>
                  <select name="year_id" class="form-select" required>
                    <option value="" disabled selected>{{ __('app.select_year') }}</option>
                    @foreach ($years as $year)
                      <option value="{{ $year->id }}" @selected(old('year_id') == $year->id)>{{ $year->date }}</option>
                    @endforeach
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ __('app.language') }}</label>
                  <select name="language_id" class="form-select" required>
                    <option value="" disabled selected>{{ __('app.select_language') }}</option>
                    @foreach ($languages as $language)
                      <option value="{{ $language->id }}" @selected(old('language_id') == $language->id)>{{ $language->name }}</option>
                    @endforeach
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ __('app.category') }}</label>
                  <select name="category_id" class="form-select" required>
                    <option value="" disabled selected>{{ __('app.select_category') }}</option>
                    @foreach ($categories as $category)
                      <option value="{{ $category->id }}" @selected(old('category_id') == $category->id)>{{ $category->name }}</option>
                    @endforeach
                  </select>
                </div>
              </div>
              <div class="row g-3 mt-1">
                <div class="col-md-6">
                  <label class="form-label">{{ __('app.audio_file') }}</label>
                  <input type="file" name="audio" class="form-control" accept=".mp3,.wav,.ogg,.flac,.m4a" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ __('app.cover_image') }}</label>
                  <input type="file" name="cover" class="form-control" accept=".jpg,.jpeg,.png,.webp" required>
                </div>
              </div>
              <button type="submit" class="btn btn-light mt-3">{{ __('app.create_music') }}</button>
            </form>
            </div>
          </div>
        </div>

        <div class="card bg-dark text-white">
          <div class="card-body">
            <button class="btn btn-outline-light w-100 text-start mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#addArtistBlock" aria-expanded="false" aria-controls="addArtistBlock">
              {{ __('app.add_artist') }}
            </button>
            <div class="collapse" id="addArtistBlock">
            <form method="POST" action="{{ route('artists.store') }}" enctype="multipart/form-data">
              @csrf
              <div class="mb-3">
                <label class="form-label">{{ __('app.artist_name') }}</label>
                <input type="text" name="name" class="form-control" value="{{ old('name') }}" required>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ __('app.artist_photo') }}</label>
                <input type="file" name="photo" class="form-control" accept=".jpg,.jpeg,.png,.webp" id="artistPhotoInput" required>
                <img id="artistPhotoPreview" src="" alt="{{ __('app.artist_photo') }}" class="rounded mt-2 d-none" style="width:120px; height:120px; object-fit:cover;">
              </div>
              <button type="submit" class="btn btn-light">{{ __('app.create_artist') }}</button>
            </form>
            </div>
          </div>
        </div>

        <div class="card bg-dark text-white mt-4">
          <div class="card-body">
            <button class="btn btn-outline-light w-100 text-start mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#addCategoryBlock" aria-expanded="false" aria-controls="addCategoryBlock">
              {{ __('app.create') }} {{ __('app.category') }}
            </button>
            <div class="collapse" id="addCategoryBlock">
              <form method="POST" action="{{ route('categories.store') }}">
                @csrf
                <div class="input-group">
                  <input type="text" name="name" class="form-control" placeholder="{{ __('app.category') }}" required>
                  <button type="submit" class="btn btn-light">{{ __('app.create') }}</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="card bg-dark text-white mt-4">
          <div class="card-body">
            <button class="btn btn-outline-light w-100 text-start mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#manageArtistsBlock" aria-expanded="false" aria-controls="manageArtistsBlock">
              Manage Artists
            </button>
            <div class="collapse" id="manageArtistsBlock">
            <form method="GET" action="{{ route('create') }}" class="mb-3">
              <div class="input-group">
                <input type="search" name="artist_q" value="{{ $artistQuery ?? '' }}" class="form-control" placeholder="{{ __('app.search') }} {{ __('app.artist') }}">
                @if(!empty($musicQuery))
                  <input type="hidden" name="music_q" value="{{ $musicQuery }}">
                @endif
                @if(!empty($categoryQuery))
                  <input type="hidden" name="category_q" value="{{ $categoryQuery }}">
                @endif
                <button class="btn btn-outline-light" type="submit">{{ __('app.search') }}</button>
                <a class="btn btn-outline-secondary" href="{{ route('create') }}">Reset</a>
              </div>
            </form>
            <div class="table-responsive">
              <table class="table table-dark table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ __('app.artist') }}</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @forelse ($existingArtists ?? collect() as $artistItem)
                    <tr>
                      <td>{{ $artistItem->id }}</td>
                      <td>{{ $artistItem->name }}</td>
                      <td class="text-end">
                        <a href="{{ route('artists.edit', $artistItem) }}" class="btn btn-sm btn-outline-light">Edit</a>
                        <form method="POST" action="{{ route('artists.destroy', $artistItem) }}" class="d-inline" onsubmit="return confirm('Delete this artist?');">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                        </form>
                      </td>
                    </tr>
                  @empty
                    <tr>
                      <td colspan="3" class="text-white-50">No artists yet.</td>
                    </tr>
                  @endforelse
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>

        <div class="card bg-dark text-white mt-4">
          <div class="card-body">
            <button class="btn btn-outline-light w-100 text-start mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#manageCategoriesBlock" aria-expanded="false" aria-controls="manageCategoriesBlock">
              Manage Categories
            </button>
            <div class="collapse" id="manageCategoriesBlock">
            <form method="GET" action="{{ route('create') }}" class="mb-3">
              <div class="input-group">
                <input type="search" name="category_q" value="{{ $categoryQuery ?? '' }}" class="form-control" placeholder="{{ __('app.search') }} {{ __('app.category') }}">
                @if(!empty($artistQuery))
                  <input type="hidden" name="artist_q" value="{{ $artistQuery }}">
                @endif
                @if(!empty($musicQuery))
                  <input type="hidden" name="music_q" value="{{ $musicQuery }}">
                @endif
                <button class="btn btn-outline-light" type="submit">{{ __('app.search') }}</button>
                <a class="btn btn-outline-secondary" href="{{ route('create') }}">Reset</a>
              </div>
            </form>
            <div class="table-responsive">
              <table class="table table-dark table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ __('app.category') }}</th>
                    <th>Tracks</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @forelse ($existingCategories ?? collect() as $categoryItem)
                    <tr>
                      <td>{{ $categoryItem->id }}</td>
                      <td>{{ $categoryItem->name }}</td>
                      <td>{{ $categoryItem->musics_count }}</td>
                      <td class="text-end">
                        <a href="{{ route('categories.edit', $categoryItem) }}" class="btn btn-sm btn-outline-light">Edit</a>
                        <form method="POST" action="{{ route('categories.destroy', $categoryItem) }}" class="d-inline" onsubmit="return confirm('Delete this category?');">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                        </form>
                      </td>
                    </tr>
                  @empty
                    <tr>
                      <td colspan="4" class="text-white-50">No categories yet.</td>
                    </tr>
                  @endforelse
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>

        <div class="card bg-dark text-white mt-4">
          <div class="card-body">
            <button class="btn btn-outline-light w-100 text-start mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#manageMusicsBlock" aria-expanded="false" aria-controls="manageMusicsBlock">
              Manage Musics
            </button>
            <div class="collapse" id="manageMusicsBlock">
            <form method="GET" action="{{ route('create') }}" class="mb-3">
              <div class="input-group">
                <input type="search" name="music_q" value="{{ $musicQuery ?? '' }}" class="form-control" placeholder="{{ __('app.search') }} {{ __('app.track') }}">
                @if(!empty($artistQuery))
                  <input type="hidden" name="artist_q" value="{{ $artistQuery }}">
                @endif
                @if(!empty($categoryQuery))
                  <input type="hidden" name="category_q" value="{{ $categoryQuery }}">
                @endif
                <button class="btn btn-outline-light" type="submit">{{ __('app.search') }}</button>
                <a class="btn btn-outline-secondary" href="{{ route('create') }}">Reset</a>
              </div>
            </form>
            <div class="table-responsive">
              <table class="table table-dark table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ __('app.track') }}</th>
                    <th>{{ __('app.artist') }}</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @forelse ($existingMusics ?? collect() as $musicItem)
                    <tr>
                      <td>{{ $musicItem->id }}</td>
                      <td>{{ $musicItem->name }}</td>
                      <td>{{ $musicItem->artists->pluck('name')->join(', ') }}</td>
                      <td class="text-end">
                        <a href="{{ route('musics.edit', $musicItem) }}" class="btn btn-sm btn-outline-light">Edit</a>
                        <form method="POST" action="{{ route('musics.destroy', $musicItem) }}" class="d-inline" onsubmit="return confirm('Delete this music?');">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                        </form>
                      </td>
                    </tr>
                  @empty
                    <tr>
                      <td colspan="4" class="text-white-50">No music yet.</td>
                    </tr>
                  @endforelse
                </tbody>
              </table>
            </div>
            </div>
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
  <script src="{{ asset('/js/app-create.js') }}"></script>
</body>

</html>






