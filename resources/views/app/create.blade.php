<!doctype html>
<html lang="ru">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM — Create</title>

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
        <h2 class="mb-3">Create</h2>

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
            <h5 class="card-title">Add Artist</h5>
            <form method="POST" action="{{ route('artists.store') }}">
              @csrf
              <div class="mb-3">
                <label class="form-label">Artist Name</label>
                <input type="text" name="name" class="form-control" value="{{ old('name') }}" required>
              </div>
              <button type="submit" class="btn btn-light">Create Artist</button>
            </form>
          </div>
        </div>

        <div class="card bg-dark text-white">
          <div class="card-body">
            <h5 class="card-title">Add Music</h5>
            <form method="POST" action="{{ route('musics.store') }}" enctype="multipart/form-data">
              @csrf
              <div class="mb-3">
                <label class="form-label">Music Name</label>
                <input type="text" name="name" class="form-control" value="{{ old('name') }}" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Artist</label>
                <div id="artistFields" class="d-grid gap-2">
                  @php($oldArtistIds = collect(old('artist_ids', []))->filter())
                  @if ($oldArtistIds->isEmpty())
                    <div class="d-flex gap-2 align-items-center artist-row">
                      <select name="artist_ids[]" class="form-select" required>
                        <option value="" disabled selected>Select artist</option>
                        @foreach ($artists as $artist)
                          <option value="{{ $artist->id }}">{{ $artist->name }}</option>
                        @endforeach
                      </select>
                      <button type="button" class="btn btn-outline-light btn-sm remove-artist" aria-label="Remove artist" disabled>Remove</button>
                    </div>
                  @else
                    @foreach ($oldArtistIds as $aid)
                      <div class="d-flex gap-2 align-items-center artist-row">
                        <select name="artist_ids[]" class="form-select" required>
                          <option value="" disabled>Select artist</option>
                          @foreach ($artists as $artist)
                            <option value="{{ $artist->id }}" @selected((int)$aid === $artist->id)>{{ $artist->name }}</option>
                          @endforeach
                        </select>
                        <button type="button" class="btn btn-outline-light btn-sm remove-artist" aria-label="Remove artist" {{ $loop->first ? 'disabled' : '' }}>Remove</button>
                      </div>
                    @endforeach
                  @endif
                </div>
                <button type="button" class="btn btn-outline-light btn-sm mt-2" id="addArtistBtn">
                  + Add artist
                </button>
              </div>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Year</label>
                  <select name="year_id" class="form-select" required>
                    <option value="" disabled selected>Select year</option>
                    @foreach ($years as $year)
                      <option value="{{ $year->id }}" @selected(old('year_id') == $year->id)>{{ $year->date }}</option>
                    @endforeach
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Language</label>
                  <select name="language_id" class="form-select" required>
                    <option value="" disabled selected>Select language</option>
                    @foreach ($languages as $language)
                      <option value="{{ $language->id }}" @selected(old('language_id') == $language->id)>{{ $language->name }}</option>
                    @endforeach
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Category</label>
                  <select name="category_id" class="form-select" required>
                    <option value="" disabled selected>Select category</option>
                    @foreach ($categories as $category)
                      <option value="{{ $category->id }}" @selected(old('category_id') == $category->id)>{{ $category->name }}</option>
                    @endforeach
                  </select>
                </div>
              </div>
              <div class="row g-3 mt-1">
                <div class="col-md-6">
                  <label class="form-label">Audio File</label>
                  <input type="file" name="audio" class="form-control" accept=".mp3,.wav,.ogg,.flac,.m4a" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Cover Image</label>
                  <input type="file" name="cover" class="form-control" accept=".jpg,.jpeg,.png,.webp" required>
                </div>
              </div>
              <button type="submit" class="btn btn-light mt-3">Create Music</button>
            </form>
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
  <script>
    (function () {
      const container = document.getElementById('artistFields');
      const addBtn = document.getElementById('addArtistBtn');
      if (!container || !addBtn) return;

      function updateRemoveState() {
        const rows = container.querySelectorAll('.artist-row');
        rows.forEach((row, idx) => {
          const btn = row.querySelector('.remove-artist');
          if (btn) btn.disabled = rows.length === 1 || idx === 0;
        });
      }

      addBtn.addEventListener('click', () => {
        const templateRow = container.querySelector('.artist-row');
        if (!templateRow) return;
        const clone = templateRow.cloneNode(true);
        const select = clone.querySelector('select');
        if (select) select.value = '';
        const btn = clone.querySelector('.remove-artist');
        if (btn) btn.disabled = false;
        container.appendChild(clone);
        updateRemoveState();
      });

      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-artist');
        if (!btn) return;
        const row = btn.closest('.artist-row');
        if (!row) return;
        row.remove();
        updateRemoveState();
      });

      updateRemoveState();
    })();
  </script>
  <script src="{{ asset('/js/bootstrap.bundle.min.js') }}"></script>
  <script src="{{ asset('/js/owazym.js') }}"></script>
</body>

</html>
