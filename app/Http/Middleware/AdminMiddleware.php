<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        $user = $request->user();
        $isAdmin = false;

        if ($user) {
            if (isset($user->is_admin)) {
                $isAdmin = (bool) $user->is_admin;
            } elseif (isset($user->role)) {
                $role = strtolower(trim((string) $user->role));
                $isAdmin = in_array($role, ['admin', 'administrator'], true);
            } else {
                $isAdmin = strtolower(trim((string) $user->name)) === 'admin';
            }
        }

        if (! $isAdmin) {
            return redirect()->to('/');
        }

        return $next($request);
    }
}
