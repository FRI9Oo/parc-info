<?php

namespace App\Http\Controllers;

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

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'] ?? null,
            'employe_id' => $validated['employe_id'] ?? null,
        ]);

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

        return redirect()->back()->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $user->update(['role_id' => $validated['role_id']]);

        return redirect()->back()->with('success', 'Rôle mis à jour avec succès.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors([
                'delete' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ]);
        }

        $user->delete();

        return redirect()->back()->with('success', 'Utilisateur supprimé avec succès.');
    }
}