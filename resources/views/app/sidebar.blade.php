<aside class="app-sidebar text-white p-3 d-none d-lg-flex flex-column">
  <form method="GET" action="/" class="position-relative mb-3">
    <input
      type="search"
      name="q"
      value="{{ request('q') }}"
      class="form-control form-control-sm search-input pe-5"
      placeholder="{{ __('app.search') }}">
    <button type="button"
      class="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-white-50 search-toggle"
      aria-label="{{ __('app.search') }}">
      <i class="bi bi-search"></i>
    </button>
  </form>
  <div class="d-flex align-items-center justify-content-between mb-3 px-1">
    <span class="small text-white-50">{{ __('app.theme') }}</span>
    <label class="theme-icon-toggle" title="{{ __('app.theme') }}">
      <input id="themeToggleDesktop" type="checkbox" aria-label="{{ __('app.toggle_theme') }}">
      <span class="theme-icon">
        <i class="bi bi-sun-fill theme-icon-sun"></i>
        <i class="bi bi-moon-stars-fill theme-icon-moon"></i>
      </span>
    </label>
  </div>
  @php($currentLocale = app()->getLocale())
  <div class="d-flex align-items-center justify-content-between mb-3 px-1">
    <span class="small text-white-50">{{ __('app.language') }}</span>
    <div class="btn-group btn-group-sm lang-toggle" role="group" aria-label="{{ __('app.language') }}">
      <a href="{{ route('locale', 'ru') }}"
        class="btn btn-outline-light {{ $currentLocale === 'ru' ? 'active' : '' }}">RU</a>
      <a href="{{ route('locale', 'tm') }}"
        class="btn btn-outline-light {{ $currentLocale === 'tm' ? 'active' : '' }}">TM</a>
      <a href="{{ route('locale', 'en') }}"
        class="btn btn-outline-light {{ $currentLocale === 'en' ? 'active' : '' }}">EN</a>
    </div>
  </div>
  <nav class="nav flex-column nav-apple" id="desktopNav">
    <a class="nav-link {{ request()->is('/') ? 'active' : '' }}" href="{{ url('/') }}"><i class="bi bi-house"></i> {{ __('app.home') }}</a>
    <a class="nav-link {{ request()->is('playlist') ? 'active' : '' }}" href="{{ route('playlist.index') }}"><i class="bi bi-music-note"></i> {{ __('app.my_playlist') }}</a>
    <div><i class="bi bi-people"></i> Artist</a>
  </nav>
  <div class="artists-scrollable" style="max-height: 400px; overflow-y: auto;">
    <nav class="nav flex-column">
      @foreach($artists as $artist)
      <a class="nav-link text-white artist-item"
        data-name="{{ strtolower($artist->name) }}"
        href="{{ url('/').'?artist_id='.$artist->id.'#album' }}"
        aria-current="{{ (int) request('artist_id') === (int) $artist->id ? 'page' : 'false' }}">
        @if (!empty($artist->photo_path))
          <img src="{{ asset('storage/'.$artist->photo_path) }}" alt="{{ $artist->name }}" class="rounded-circle me-1" style="width:22px; height:22px; object-fit:cover;">
        @else
          <i class="bi bi-person-circle"></i>
        @endif
        {{ $artist->name }}
      </a>
      @endforeach

      @if($hasMore)
      <div class="text-white-50 mt-2">{{ __('app.and_other') }}</div>
      @endif
    </nav>
  </div>
  <div class="mt-auto pt-3 border-top" style="border-color: rgba(255,255,255,.10)!important;">
    <div class="dropdown">
      <a class="nav-link nav-apple d-flex align-items-center justify-content-between px-2 py-2" href="#"
        role="button" data-bs-toggle="dropdown" aria-expanded="false"
        style="text-decoration:none; border-radius:12px;">
        <span><i class="bi bi-person-circle me-2"></i> {{ __('app.my_account') }}</span>
        <span class="text-white-50">▾</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-dark w-100" id="accountMenuDesktop"></ul>
    </div>
  </div>
</aside>
<div class="offcanvas offcanvas-end text-bg-dark d-lg-none" tabindex="-1" id="mobileSidebar"
  aria-labelledby="mobileSidebarLabel" style="width: 260px;">
  <div class="offcanvas-header border-bottom" style="border-color: rgba(255,255,255,.08)!important;">
    <h5 class="offcanvas-title brand" id="mobileSidebarLabel" class="fw-light"
      style="font-size: 34px; font-weight: lighter;">
      OWAZYM
    </h5>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"
      aria-label="Закрыть"></button>
  </div>

  <div class="offcanvas-body d-flex flex-column">

    <form method="GET" action="/" class="position-relative mb-3">
      <input
        type="search"
      name="q"
      value="{{ request('q') }}"
      class="form-control form-control-sm search-input pe-5"
      placeholder="{{ __('app.search') }}">
      <button type="button"
      class="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-white-50 search-toggle"
      aria-label="{{ __('app.search') }}">
      <i class="bi bi-search"></i>
    </button>
    </form>

    @php($currentLocale = app()->getLocale())
    <div class="d-flex align-items-center justify-content-between mb-3 px-1">
      <span class="small text-white-50">{{ __('app.language') }}</span>
      <div class="btn-group btn-group-sm lang-toggle" role="group" aria-label="{{ __('app.language') }}">
        <a href="{{ route('locale', 'ru') }}"
          class="btn btn-outline-light {{ $currentLocale === 'ru' ? 'active' : '' }}">RU</a>
        <a href="{{ route('locale', 'tm') }}"
          class="btn btn-outline-light {{ $currentLocale === 'tm' ? 'active' : '' }}">TM</a>
        <a href="{{ route('locale', 'en') }}"
          class="btn btn-outline-light {{ $currentLocale === 'en' ? 'active' : '' }}">EN</a>
      </div>
    </div>
    
    <div class="menu-static">
      <form></form>
      <nav class="nav flex-column nav-apple">
        <a class="nav-link {{ request()->is('/') ? 'active' : '' }}" href="{{ url('/') }}"><i class="bi bi-house"></i> {{ __('app.home') }}</a>
        <a class="nav-link {{ request()->is('playlist') ? 'active' : '' }}" href="{{ route('playlist.index') }}"><i class="bi bi-music-note"></i> {{ __('app.my_playlist') }}</a>
        <a class="nav-link {{ request()->is('artists') ? 'active' : '' }}" href="{{ route('artists.index') }}"><i class="bi bi-people"></i> {{ __('app.artists') }}</a>
      </nav>
    </div>

    <div class="artists-scrollable" style="max-height: 400px; overflow-y: auto;">
      <nav class="nav flex-column">
        <!-- vot eto dolzno prihodit s databazy imya artista -->
        @foreach($artists as $artist)
        <a class="nav-link text-white artist-item"
          data-name="{{ strtolower($artist->name) }}"
          href="{{ url('/').'?artist_id='.$artist->id.'#album' }}"
          aria-current="{{ (int) request('artist_id') === (int) $artist->id ? 'page' : 'false' }}">
          @if (!empty($artist->photo_path))
            <img src="{{ asset('storage/'.$artist->photo_path) }}" alt="{{ $artist->name }}" class="rounded-circle me-1" style="width:22px; height:22px; object-fit:cover;">
          @else
            <i class="bi bi-person-circle"></i>
          @endif
          {{ $artist->name }}
        </a>
        @endforeach

        @if($hasMore)
        <div class="text-white-50 mt-2">{{ __('app.and_other') }}</div>
        @endif
      </nav>
    </div>
  </div>

  <div class="mt-auto pt-3 border-top" style="border-color: rgba(255,255,255,.10)!important;">
    <div class="dropdown">
      <a class="nav-link nav-apple d-flex align-items-center justify-content-between px-2 py-2" href="#"
        role="button" data-bs-toggle="dropdown" aria-expanded="false"
        style="text-decoration:none; border-radius:12px;">
        <span><i class="bi bi-person-circle me-2"></i> {{ __('app.my_account') }}</span>
        <span class="text-white-50">▾</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-dark w-100" id="accountMenuMobile"></ul>
    </div>
  </div>

</div>
</div>
