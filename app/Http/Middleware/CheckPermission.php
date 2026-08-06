<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Non authentifié.');
        }

        // Super-admin bypass
        if ($user->hasRole('Administrateur')) {
            return $next($request);
        }

        // Check if user's assigned role possesses the requested permission
        if ($user->hasPermission($permission)) {
            return $next($request);
        }

        abort(403, "Accès non autorisé : la permission '{$permission}' est requise.");
    }
}
