<aside class="app-sidebar text-white p-3 d-none d-lg-flex flex-column">
  <form class="position-relative mb-3">
    <input type="search" class="form-control form-control-sm search-input pe-5" placeholder="Search">
    <button type="submit"
      class="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-white-50"
      aria-label="Search">
      <i class="bi bi-search"></i>
    </button>
  </form>
  <nav class="nav flex-column nav-apple" id="desktopNav">
    <a class="nav-link active" href="#home"><i class="bi bi-house"></i> Home</a>
    <a class="nav-link" href="#playlist"><i class="bi bi-music-note"></i> My Playlist</a>
    <div><i class="bi bi-people"></i> Artists</div>
  </nav>
  <div class="artists-scrollable" style="max-height: 400px; overflow-y: auto;">
    <nav class="nav flex-column">
       @foreach($artists as $artist)
        <a class="nav-link text-white">
          <i class="bi bi-person-circle"></i> {{ $artist->name }}
        </a>
        @endforeach
    </nav>
  </div>
  <div class="mt-auto pt-3 border-top" style="border-color: rgba(255,255,255,.10)!important;">
    <div class="dropdown">
      <a class="nav-link nav-apple d-flex align-items-center justify-content-between px-2 py-2" href="#"
        role="button" data-bs-toggle="dropdown" aria-expanded="false"
        style="text-decoration:none; border-radius:12px;">
        <span><i class="bi bi-person-circle me-2"></i> My Account</span>
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

    <form class="position-relative mb-3">
      <input type="search" class="form-control form-control-sm search-input pe-5" placeholder="Search">
      <button type="submit"
        class="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-white-50"
        aria-label="Search">
        <i class="bi bi-search"></i>
      </button>
    </form>
    <div class="menu-static">
      <form></form>
      <nav class="nav flex-column nav-apple">
        <a class="nav-link active" href="#home"><i class="bi bi-house"></i> Home</a>
        <a class="nav-link" href="#playlist"><i class="bi bi-music-note"></i> My Playlist</a>
        <div><i class="bi bi-people"></i> Artists</div>
      </nav>
    </div>

    <div class="artists-scrollable" style="max-height: 400px; overflow-y: auto;">
      <nav class="nav flex-column">
        <!-- vot eto dolzno prihodit s databazy imya artista -->
        @foreach($artists as $artist)
        <a class="nav-link text-white">
          <i class="bi bi-person-circle"></i> {{ $artist->name }}
        </a>
        @endforeach
      </nav>
    </div>
  </div>

  <div class="mt-auto pt-3 border-top" style="border-color: rgba(255,255,255,.10)!important;">
    <div class="dropdown">
      <a class="nav-link nav-apple d-flex align-items-center justify-content-between px-2 py-2" href="#"
        role="button" data-bs-toggle="dropdown" aria-expanded="false"
        style="text-decoration:none; border-radius:12px;">
        <span><i class="bi bi-person-circle me-2"></i> My Account</span>
        <span class="text-white-50">▾</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-dark w-100" id="accountMenuMobile"></ul>
    </div>
  </div>

</div>
</div>