<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Employe;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::with(['role', 'employe'])->orderBy('name')->get(),
            'roles' => Role::orderBy('nom_role')->get(),
            'employes' => Employe::orderBy('nom')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'role_id' => 'nullable|exists:roles,id',
            'employe_id' => 'nullable|exists:employes,id',
        ]);

        $u = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'] ?? null,
            'employe_id' => $validated['employe_id'] ?? null,
            'is_active' => true,
        ]);

        AuditLog::record('Création', 'Utilisateurs', "Création du compte utilisateur '{$u->name}' ({$u->email})", $u);

        return redirect()->back()->with('success', 'Utilisateur créé avec succès.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', Rules\Password::defaults()],
            'role_id' => 'nullable|exists:roles,id',
            'employe_id' => 'nullable|exists:employes,id',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'] ?? null,
            'employe_id' => $validated['employe_id'] ?? null,
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        AuditLog::record('Modification', 'Utilisateurs', "Modification du compte utilisateur '{$user->name}' ({$user->email})", $user);

        return redirect()->back()->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $user->update(['role_id' => $validated['role_id']]);
        $user->load('role');

        $roleName = $user->role ? $user->role->nom_role : 'Aucun rôle';
        AuditLog::record('Modification', 'Utilisateurs', "Changement du rôle de '{$user->name}' -> {$roleName}", $user);

        return redirect()->back()->with('success', 'Rôle mis à jour avec succès.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors([
                'status' => 'Vous ne pouvez pas désactiver votre propre compte.',
            ]);
        }

        $user->update(['is_active' => ! $user->is_active]);
        $statusStr = $user->is_active ? 'Activé' : 'Désactivé';

        AuditLog::record('Modification', 'Utilisateurs', "Statut du compte '{$user->name}' changé en {$statusStr}", $user);

        return redirect()->back()->with('success', "Statut de l'utilisateur changé en {$statusStr}.");
    }

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        AuditLog::record('Modification', 'Utilisateurs', "Réinitialisation du mot de passe de l'utilisateur '{$user->name}'", $user);

        return redirect()->back()->with('success', 'Mot de passe réinitialisé avec succès.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors([
                'delete' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ]);
        }

        $userName = $user->name;
        $userEmail = $user->email;
        $user->delete();

        AuditLog::record('Suppression', 'Utilisateurs', "Suppression du compte utilisateur '{$userName}' ({$userEmail})");

        return redirect()->back()->with('success', 'Utilisateur supprimé avec succès.');
    }
}