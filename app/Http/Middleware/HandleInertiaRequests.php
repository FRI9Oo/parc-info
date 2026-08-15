<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $userPermissions = [];
        if ($user) {
            if ($user->hasRole('Administrateur')) {
                $userPermissions = \App\Models\Permission::pluck('nom_permission')->toArray();
            } elseif ($user->role) {
                $allPerms = \App\Models\Permission::pluck('nom_permission');
                $userPermissions = $allPerms->filter(fn ($p) => $user->hasPermission($p))->values()->toArray();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'role' => $user?->role?->nom_role,
                'permissions' => $userPermissions,
                'isAdmin' => $user?->hasRole('Administrateur') ?? false,
            ],
        ];
    }
}
