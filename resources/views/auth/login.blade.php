<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ __('app.login') }} - OWAZYM</title>
  <link rel="icon" type="image/x-icon" href="{{ asset('/img/logo.ico') }}">

    <link rel="stylesheet" href="{{ asset('/css/bootstrap.css') }}">
    <link rel="stylesheet" href="{{ asset('/css/bootstrap-icons.min.css') }}">
    <link rel="stylesheet" href="{{ asset('/css/owazym-2.css') }}">
    <style>
        .auth-card .auth-input,
        .auth-card .auth-input[type="password"] {
            background: #ffffff !important;
            color: #111827 !important;
            -webkit-text-fill-color: #111827 !important;
            caret-color: #111827 !important;
            border: 1px solid #cfd4dc !important;
        }
        .auth-theme-toggle {
            position: fixed;
            top: 14px;
            right: 14px;
            z-index: 30;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,.2);
            background: rgba(0,0,0,.3);
            color: #fff;
            font-size: .8rem;
        }
        body.light .auth-theme-toggle {
            background: rgba(255,255,255,.9);
            color: #111827;
            border-color: rgba(0,0,0,.15);
        }
    </style>
</head>
<body class="font-Ambassador d-flex align-items-center justify-content-center min-vh-100">
<button type="button" class="auth-theme-toggle" id="authThemeToggle" aria-label="{{ __('app.toggle_theme') }}">
    <i class="bi bi-circle-half"></i>
    <span id="authThemeLabel">{{ __('app.night_mode') }}</span>
</button>
<div class="card bg-dark text-white shadow auth-card" style="max-width:420px;width:100%;border-radius:16px;">
    <div class="card-body p-4">
        <h3 class="mb-2">{{ __('app.login') }}</h3>
        <p class="text-white-50 mb-4">{{ __('app.login_required_message') }}</p>

        @if ($errors->any())
            <div class="alert alert-danger py-2">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('login.perform') }}">
            @csrf
            <div class="mb-3">
                <label class="form-label">{{ __('app.username') }}</label>
                <input type="text" name="name" value="{{ old('name') }}" class="form-control auth-input" required autofocus autocomplete="username" style="background:#fff !important;color:#111827 !important;-webkit-text-fill-color:#111827 !important;caret-color:#111827 !important;font-family:Arial,Helvetica,sans-serif !important;">
            </div>
            <div class="mb-3">
                <label class="form-label">{{ __('app.password') }}</label>
                <input type="password" name="password" class="form-control auth-input" required autocomplete="current-password" style="background:#fff !important;color:#111827 !important;-webkit-text-fill-color:#111827 !important;caret-color:#111827 !important;text-shadow:0 0 0 #111827 !important;font-family:Arial,Helvetica,sans-serif !important;">
            </div>
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" value="1" id="remember" name="remember" {{ old('remember') ? 'checked' : '' }}>
                <label class="form-check-label" for="remember">
                    {{ __('app.remember_me') }}
                </label>
            </div>
            <button type="submit" class="btn btn-danger w-100">{{ __('app.login') }}</button>
        </form>

        <div class="text-center mt-3">
            <a class="text-white-50" href="{{ route('register') }}">{{ __('app.no_account_register') }}</a>
        </div>
    </div>
</div>
<script>
(() => {
    const key = 'theme';
    const btn = document.getElementById('authThemeToggle');
    const label = document.getElementById('authThemeLabel');
    const dayText = @json(__('app.day_mode'));
    const nightText = @json(__('app.night_mode'));
    const applyTheme = (theme) => {
        document.body.classList.toggle('light', theme === 'light');
        localStorage.setItem(key, theme);
        if (label) label.textContent = theme === 'light' ? dayText : nightText;
    };
    applyTheme(localStorage.getItem(key) || 'dark');
    btn?.addEventListener('click', () => {
        applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
    });
})();
</script>
</body>
</html>


