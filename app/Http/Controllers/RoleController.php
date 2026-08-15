<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('Roles/Index', [
            'roles' => Role::with('permissions')->withCount('users')->get(),
            'permissions' => Permission::orderBy('module')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_role' => 'required|string|max:255|unique:roles,nom_role',
            'description_role' => 'nullable|string|max:255',
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id',
        ], [
            'nom_role.required' => 'Le nom du rôle est obligatoire.',
            'nom_role.unique' => 'Un rôle avec cette désignation existe déjà.',
        ]);

        $role = Role::create([
            'nom_role' => $validated['nom_role'],
            'description_role' => $validated['description_role'] ?? null,
        ]);

        $role->permissions()->sync($validated['permission_ids'] ?? []);

        AuditLog::record('Création', 'Rôles', "Création du rôle '{$role->nom_role}' avec " . count($validated['permission_ids'] ?? []) . " permission(s)", $role);

        return redirect()->back()->with('success', "Rôle '{$role->nom_role}' créé avec succès.");
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'nom_role' => 'required|string|max:255|unique:roles,nom_role,' . $role->id,
            'description_role' => 'nullable|string|max:255',
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id',
        ], [
            'nom_role.required' => 'Le nom du rôle est obligatoire.',
            'nom_role.unique' => 'Un rôle avec cette désignation existe déjà.',
        ]);

        $role->update([
            'nom_role' => $validated['nom_role'],
            'description_role' => $validated['description_role'] ?? null,
        ]);

        $role->permissions()->sync($validated['permission_ids'] ?? []);

        AuditLog::record('Modification', 'Rôles', "Mise à jour du rôle '{$role->nom_role}' (Permissions: " . count($validated['permission_ids'] ?? []) . ")", $role);

        return redirect()->back()->with('success', "Rôle '{$role->nom_role}' mis à jour avec succès.");
    }

    public function destroy(Role $role)
    {
        if ($role->users()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : ce rôle est assigné à des utilisateurs.',
            ]);
        }

        $nom = $role->nom_role;
        $desc = "Suppression du rôle '{$nom}'";
        $role->delete();

        AuditLog::record('Suppression', 'Rôles', $desc);

        return redirect()->back()->with('success', "Rôle '{$nom}' supprimé avec succès.");
    }
}