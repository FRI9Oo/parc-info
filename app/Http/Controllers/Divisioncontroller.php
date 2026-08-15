<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Departement;
use App\Models\Direction;
use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    public function index()
    {
        return Inertia::render('Divisions/Index', [
            'divisions' => Division::with('departement.direction')->withCount('services')->latest()->get(),
            'departements' => Departement::with('direction')->get(),
            'directions' => Direction::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_division' => 'required|string|max:255|unique:divisions,nom_division',
            'departement_id' => 'required|exists:departements,id',
        ], [
            'nom_division.required' => 'Le nom de la division est obligatoire.',
            'nom_division.unique' => 'Une division avec ce nom existe déjà dans l\'organisation.',
            'departement_id.required' => 'Veuillez sélectionner un département de rattachement.',
        ]);

        $div = Division::create($validated);
        $div->load('departement.direction');

        AuditLog::record('Création', 'Structure', "Ajout de la division '{$div->nom_division}' (Département: {$div->departement?->nom_departement})", $div);

        return redirect()->back()->with('success', "Division '{$div->nom_division}' créée avec succès.");
    }

    public function update(Request $request, Division $division)
    {
        $validated = $request->validate([
            'nom_division' => 'required|string|max:255|unique:divisions,nom_division,' . $division->id,
            'departement_id' => 'required|exists:departements,id',
        ], [
            'nom_division.required' => 'Le nom de la division est obligatoire.',
            'nom_division.unique' => 'Une division avec ce nom existe déjà dans l\'organisation.',
            'departement_id.required' => 'Veuillez sélectionner un département de rattachement.',
        ]);

        $division->update($validated);
        $division->load('departement.direction');

        AuditLog::record('Modification', 'Structure', "Mise à jour de la division '{$division->nom_division}'", $division);

        return redirect()->back()->with('success', "Division '{$division->nom_division}' mise à jour avec succès.");
    }

    public function destroy(Division $division)
    {
        if ($division->services()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cette division contient des services.',
            ]);
        }

        $nom = $division->nom_division;
        $division->delete();

        AuditLog::record('Suppression', 'Structure', "Suppression de la division '{$nom}'");

        return redirect()->back()->with('success', "Division '{$nom}' supprimée avec succès.");
    }
}