<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Marque;
use App\Models\Modele;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarqueModeleController extends Controller
{
    public function index()
    {
        $marques = Marque::with(['modeles' => function ($q) {
            $q->withCount('materiels')->latest();
        }])
        ->withCount('modeles')
        ->latest()
        ->get();

        return Inertia::render('MarquesModeles/Index', [
            'marques' => $marques,
        ]);
    }

    public function storeMarque(Request $request)
    {
        $validated = $request->validate([
            'nom_marque' => 'required|string|max:255|unique:marques,nom_marque',
        ], [
            'nom_marque.unique' => 'Cette marque existe déjà.',
            'nom_marque.required' => 'Le nom de la marque est obligatoire.',
        ]);

        $marque = Marque::create($validated);

        AuditLog::record(
            'Création',
            'Marques',
            "Ajout de la marque '{$marque->nom_marque}'",
            $marque
        );

        return redirect()->back()->with('success', 'Marque ajoutée avec succès.');
    }

    public function updateMarque(Request $request, Marque $marque)
    {
        $validated = $request->validate([
            'nom_marque' => 'required|string|max:255|unique:marques,nom_marque,' . $marque->id,
        ], [
            'nom_marque.unique' => 'Cette marque existe déjà.',
            'nom_marque.required' => 'Le nom de la marque est obligatoire.',
        ]);

        $marque->update($validated);

        AuditLog::record(
            'Modification',
            'Marques',
            "Modification de la marque '{$marque->nom_marque}'",
            $marque
        );

        return redirect()->back()->with('success', 'Marque mise à jour.');
    }

    public function destroyMarque(Marque $marque)
    {
        if ($marque->modeles()->exists() || $marque->materiels()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer cette marque car des modèles ou matériels y sont associés.',
            ]);
        }

        $nom = $marque->nom_marque;
        $marque->delete();

        AuditLog::record('Suppression', 'Marques', "Suppression de la marque '{$nom}'");

        return redirect()->back()->with('success', 'Marque supprimée avec succès.');
    }

    public function storeModele(Request $request)
    {
        $validated = $request->validate([
            'nom_modele' => 'required|string|max:255',
            'marque_id' => 'required|exists:marques,id',
        ], [
            'nom_modele.required' => 'Le nom du modèle est obligatoire.',
            'marque_id.required' => 'Veuillez sélectionner la marque.',
        ]);

        $modele = Modele::create($validated);
        $modele->load('marque');

        AuditLog::record(
            'Création',
            'Modèles',
            "Ajout du modèle '{$modele->nom_modele}' pour la marque '{$modele->marque->nom_marque}'",
            $modele
        );

        return redirect()->back()->with('success', 'Modèle ajouté avec succès.');
    }

    public function updateModele(Request $request, Modele $modele)
    {
        $validated = $request->validate([
            'nom_modele' => 'required|string|max:255',
            'marque_id' => 'required|exists:marques,id',
        ], [
            'nom_modele.required' => 'Le nom du modèle est obligatoire.',
            'marque_id.required' => 'Veuillez sélectionner la marque.',
        ]);

        $modele->update($validated);
        $modele->load('marque');

        AuditLog::record(
            'Modification',
            'Modèles',
            "Mise à jour du modèle '{$modele->nom_modele}' ({$modele->marque->nom_marque})",
            $modele
        );

        return redirect()->back()->with('success', 'Modèle mis à jour avec succès.');
    }

    public function destroyModele(Modele $modele)
    {
        if ($modele->materiels()->exists() || $modele->bordereaux()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer ce modèle car des matériels ou bordereaux y sont associés.',
            ]);
        }

        $nom = $modele->nom_modele;
        $modele->delete();

        AuditLog::record('Suppression', 'Modèles', "Suppression du modèle '{$nom}'");

        return redirect()->back()->with('success', 'Modèle supprimé avec succès.');
    }
}
