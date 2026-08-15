<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Departement;
use App\Models\Direction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartementController extends Controller
{
    public function index()
    {
        return Inertia::render('Departements/Index', [
            'departements' => Departement::with('direction')->withCount('divisions')->latest()->get(),
            'directions' => Direction::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_departement' => 'required|string|max:255|unique:departements,nom_departement',
            'direction_id' => 'required|exists:directions,id',
        ], [
            'nom_departement.required' => 'Le nom du département est obligatoire.',
            'nom_departement.unique' => 'Un département avec ce nom existe déjà dans l\'organisation.',
            'direction_id.required' => 'Veuillez sélectionner une direction de rattachement.',
        ]);

        $dep = Departement::create($validated);
        $dep->load('direction');

        AuditLog::record('Création', 'Structure', "Ajout du département '{$dep->nom_departement}' (Direction: {$dep->direction?->nom_direction})", $dep);

        return redirect()->back()->with('success', "Département '{$dep->nom_departement}' créé avec succès.");
    }

    public function update(Request $request, Departement $departement)
    {
        $validated = $request->validate([
            'nom_departement' => 'required|string|max:255|unique:departements,nom_departement,' . $departement->id,
            'direction_id' => 'required|exists:directions,id',
        ], [
            'nom_departement.required' => 'Le nom du département est obligatoire.',
            'nom_departement.unique' => 'Un département avec ce nom existe déjà dans l\'organisation.',
            'direction_id.required' => 'Veuillez sélectionner une direction de rattachement.',
        ]);

        $departement->update($validated);
        $departement->load('direction');

        AuditLog::record('Modification', 'Structure', "Mise à jour du département '{$departement->nom_departement}'", $departement);

        return redirect()->back()->with('success', "Département '{$departement->nom_departement}' mis à jour avec succès.");
    }

    public function destroy(Departement $departement)
    {
        if ($departement->divisions()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : ce département contient des divisions.',
            ]);
        }

        $nom = $departement->nom_departement;
        $departement->delete();

        AuditLog::record('Suppression', 'Structure', "Suppression du département '{$nom}'");

        return redirect()->back()->with('success', "Département '{$nom}' supprimé avec succès.");
    }
}