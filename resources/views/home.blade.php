<!doctype html>
<html lang="ru">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OWAZYM</title>

  <link rel="stylesheet" href={{ asset("/css/bootstrap.css") }} />
  <link rel="stylesheet" href={{ asset("/css/bootstrap-icons.min.css") }} />
  <link rel="stylesheet" href={{ asset("/css/owazym-2.css") }} />
</head>

<body class="font-Ambassador">
  @include('app.navbar')
  <div class="d-flex">
    @include('app.sidebar')

    <!-- MAIN -->
    <main class="app-content flex-grow-1 p-3 text-white">


      <section class="spotify-section">
        <div>
          <h3>Популярные</h3>
        </div>

        <div class="viewport">
          <button class="overlay-arrow right" id="nextBtn" onclick="slide(1)">></button>
          <button class="overlay-arrow left" id="prevBtn" onclick="slide(-1)"><</button>
          <div class="scroll-row" id="row">
            @foreach ($musics as $music)
              <div class="music-card">
                <img src="{{ asset('/img/1.jpg') }}">
                <div class="title">{{ $music->name }}</div>
                <div class="artist">{{ $music->artist->name }}</div>
              </div>
            @endforeach
          </div>
        </div>
      </section>

      <img src="./img/image.png" class="owazym-bg-logo" alt="">
    </main>

  </div>
  <script>
    const user = {
      firstName: "{{ $firstName }}",
      plan: "{{ $plan }}"
    };
  </script>
  <script src="{{asset("/js/bootstrap.bundle.min.js")}}"></script>
  <script src="{{asset("/js/owazym.js")}}"></script>

</body>

</html>