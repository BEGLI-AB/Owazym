<aside class="app-sidebar text-white p-3 d-none d-lg-flex flex-column">
  <form method="GET" action="{{ route('search') }}" class="position-relative mb-3 app-search-form">
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
  @php($sidebarUser = auth()->user())
  @php($isAdminNav = false)
  @if($sidebarUser)
  @if(isset($sidebarUser->is_admin))
  @php($isAdminNav = (bool) $sidebarUser->is_admin)
  @elseif(isset($sidebarUser->role))
  @php($isAdminNav = in_array(strtolower(trim((string) $sidebarUser->role)), ['admin', 'administrator'], true))
  @else
  @php($isAdminNav = strtolower(trim((string) $sidebarUser->name)) === 'admin')
  @endif
  @endif
  <nav class="nav flex-column nav-apple" id="desktopNav">
    <a class="nav-link {{ request()->routeIs('home') ? 'active' : '' }}" href="{{ route('home') }}"><i class="bi bi-house"></i><span class="sidebar-label">{{ __('app.home') }}</span></a>
    @if($isAdminNav)
    <a class="nav-link {{ request()->routeIs('create') ? 'active' : '' }}" href="{{ route('create') }}"><i class="bi bi-plus-lg"></i><span class="sidebar-label">{{ __('app.create') }}</span></a>
    @endif
    <a class="nav-link {{ request()->routeIs('playlist.index') ? 'active' : '' }}" href="{{ route('playlist.index') }}"><i class="bi bi-music-note"></i><span class="sidebar-label">{{ __('app.my_playlist') }}</span></a>
    <a class="nav-link {{ request()->routeIs('search') ? 'active' : '' }}" href="{{ route('search') }}?q=" data-nav="search"><i class="bi bi-search"></i><span class="sidebar-label">{{ __('app.search') }}</span></a>
    <div><i class="bi bi-people"></i> <span class="sidebar-label">{{ __('app.artists') }}</span></div>
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
</aside>






<div class="offcanvas offcanvas-end text-bg-dark app-mobile-drawer" tabindex="-1" id="mobileSidebar"
  aria-labelledby="mobileSidebarLabel" aria-modal="true" style="width: 260px;">
  <div class="offcanvas-header border-bottom" style="border-color: rgba(255,255,255,.08)!important;">
    <h5 class="offcanvas-title brand fw-light" id="mobileSidebarLabel"
      style="font-size: 34px; font-weight: lighter;">
      OWAZYM
    </h5>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"
      aria-label="Close"></button>
  </div>

  <div class="offcanvas-body d-flex flex-column">

    <form method="GET" action="{{ route('search') }}" class="position-relative mb-3 app-search-form">
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
      <nav class="nav flex-column nav-apple">
        @if($isAdminNav)
        <a class="nav-link {{ request()->routeIs('create') ? 'active' : '' }}" href="{{ route('create') }}"><i class="bi bi-plus-lg"></i> {{ __('app.create') }}</a>
        @endif
        <div><i class="bi bi-people"></i> {{ __('app.artists') }}</div>
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
</div>

<nav class="mobile-bottom-nav {{ $isAdminNav ? 'mobile-bottom-nav-admin' : 'mobile-bottom-nav-user' }}" aria-label="Mobile bottom navigation">
  <a class="mobile-bottom-link {{ request()->routeIs('home') ? 'active' : '' }}" href="{{ route('home') }}" data-nav="home">
    <i class="bi bi-house"></i>
    <span>{{ __('app.home') }}</span>
  </a>
  <a class="mobile-bottom-link {{ request()->routeIs('search') ? 'active' : '' }}" href="{{ route('search') }}?q=" aria-label="{{ __('app.search') }}" data-nav="search">
    <i class="bi bi-search"></i>
    <span>{{ __('app.search') }}</span>
  </a>
  @if($isAdminNav)
  <a class="mobile-bottom-link {{ request()->routeIs('create') ? 'active' : '' }}" href="{{ route('create') }}">
    <i class="bi bi-plus-lg"></i>
    <span>{{ __('app.create') }}</span>
  </a>
  @endif
  <a class="mobile-bottom-link {{ request()->routeIs('playlist.index') ? 'active' : '' }}" href="{{ route('playlist.index') }}">
    <i class="bi bi-collection-play"></i>
    <span>{{ __('app.my_playlist') }}</span>
  </a>
</nav>
