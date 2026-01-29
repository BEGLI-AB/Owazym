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
      <section id="home" class="mb-4">
        <h1 class="h4">Главная</h1>
        <p class="text-white-50">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iusto nemo autem fugit distinctio consequuntur beatae odit sequi maiores? Explicabo totam quam consectetur autem eum voluptate rem ducimus, rerum ut eius temporibus quod consequuntur nisi facilis asperiores? Aliquid at voluptatibus placeat reiciendis autem. Nulla harum repudiandae sapiente laudantium nam pariatur vel sequi! Praesentium dicta nulla quo suscipit similique earum, fugit rerum unde aut, mollitia aliquid explicabo molestiae totam tempora quas modi. Impedit commodi, cumque aperiam, atque nemo reprehenderit maiores enim aliquid suscipit odit nostrum hic natus. Velit et voluptatibus nihil officia ex ducimus laudantium, esse veritatis laborum odit ad minus possimus!</p>
      </section>

      <section id="actors" class="mb-4">
        <h2 class="h5">Актёры</h2>
        <p class="text-white-50">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iusto nemo autem fugit distinctio consequuntur beatae odit sequi maiores? Explicabo totam quam consectetur autem eum voluptate rem ducimus, rerum ut eius temporibus quod consequuntur nisi facilis asperiores? Aliquid at voluptatibus placeat reiciendis autem. Nulla harum repudiandae sapiente laudantium nam pariatur vel sequi! Praesentium dicta nulla quo suscipit similique earum, fugit rerum unde aut, mollitia aliquid explicabo molestiae totam tempora quas modi. Impedit commodi, cumque aperiam, atque nemo reprehenderit maiores enim aliquid suscipit odit nostrum hic natus. Velit et voluptatibus nihil officia ex ducimus laudantium, esse veritatis laborum odit ad minus possimus!</p>
      </section>

      <section id="playlist" class="mb-4">
        <h2 class="h5">Мой плейлист</h2>
        <p class="text-white-50">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iusto nemo autem fugit distinctio consequuntur beatae odit sequi maiores? Explicabo totam quam consectetur autem eum voluptate rem ducimus, rerum ut eius temporibus quod consequuntur nisi facilis asperiores? Aliquid at voluptatibus placeat reiciendis autem. Nulla harum repudiandae sapiente laudantium nam pariatur vel sequi! Praesentium dicta nulla quo suscipit similique earum, fugit rerum unde aut, mollitia aliquid explicabo molestiae totam tempora quas modi. Impedit commodi, cumque aperiam, atque nemo reprehenderit maiores enim aliquid suscipit odit nostrum hic natus. Velit et voluptatibus nihil officia ex ducimus laudantium, esse veritatis laborum odit ad minus possimus!</p>
      </section>
      <img src="./img/image.png" class="owazym-bg-logo" alt="">
    </main>

  </div>

  <script src="{{asset("/js/bootstrap.bundle.min.js")}}"></script>
  <script src="{{asset("/js/owazym.js")}}"></script>

</body>

</html>