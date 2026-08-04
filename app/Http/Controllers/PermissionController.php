<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index()
    {
        return Inertia::render('Permissions/Index', [
            'permissions' => Permission::withCount('roles')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_permission' => 'required|string|max:255|unique:permissions,nom_permission',
            'description_permission' => 'nullable|string|max:255',
        ]);

        Permission::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'nom_permission' => 'required|string|max:255|unique:permissions,nom_permission,' . $permission->id,
            'description_permission' => 'nullable|string|max:255',
        ]);

        $permission->update($validated);

        return redirect()->back();
    }

    public function destroy(Permission $permission)
    {
        if ($permission->roles()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cette permission est utilisée par un ou plusieurs rôles.',
            ]);
        }

        $permission->delete();

        return redirect()->back();
    }
}