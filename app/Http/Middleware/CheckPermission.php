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
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Non authentifié.');
        }

        // Super-admin bypass
        if ($user->hasRole('Administrateur')) {
            return $next($request);
        }

        // Expand comma-separated permission strings if passed as 'voir_X,gerer_X'
        $allPermissions = [];
        foreach ($permissions as $p) {
            foreach (explode(',', $p) as $subP) {
                $trimmed = trim($subP);
                if ($trimmed !== '') {
                    $allPermissions[] = $trimmed;
                }
            }
        }

        foreach ($allPermissions as $perm) {
            if ($user->hasPermission($perm)) {
                return $next($request);
            }
        }

        $permsList = implode(', ', $allPermissions);
        abort(403, "Accès non autorisé : l'une des permissions [{$permsList}] est requise.");
    }
}
