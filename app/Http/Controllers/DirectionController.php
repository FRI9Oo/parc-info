<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Direction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DirectionController extends Controller
{
    public function index()
    {
        return Inertia::render('Directions/Index', [
            'directions' => Direction::withCount('departements')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_direction' => 'required|string|max:255|unique:directions,nom_direction',
        ], [
            'nom_direction.required' => 'Le nom de la direction est obligatoire.',
            'nom_direction.unique' => 'Une direction portant ce nom existe déjà dans l\'organisation.',
        ]);

        $dir = Direction::create($validated);

        AuditLog::record('Création', 'Structure', "Ajout de la direction '{$dir->nom_direction}'", $dir);

        return redirect()->back()->with('success', "Direction '{$dir->nom_direction}' créée avec succès.");
    }

    public function update(Request $request, Direction $direction)
    {
        $validated = $request->validate([
            'nom_direction' => 'required|string|max:255|unique:directions,nom_direction,' . $direction->id,
        ], [
            'nom_direction.required' => 'Le nom de la direction est obligatoire.',
            'nom_direction.unique' => 'Une direction portant ce nom existe déjà dans l\'organisation.',
        ]);

        $direction->update($validated);

        AuditLog::record('Modification', 'Structure', "Mise à jour de la direction '{$direction->nom_direction}'", $direction);

        return redirect()->back()->with('success', "Direction '{$direction->nom_direction}' mise à jour avec succès.");
    }

    public function destroy(Direction $direction)
    {
        if ($direction->departements()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cette direction contient des départements.',
            ]);
        }

        $nom = $direction->nom_direction;
        $direction->delete();

        AuditLog::record('Suppression', 'Structure', "Suppression de la direction '{$nom}'");

        return redirect()->back()->with('success', "Direction '{$nom}' supprimée avec succès.");
    }
}