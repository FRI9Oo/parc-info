<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FournisseurController extends Controller
{
    public function index()
    {
        $fournisseurs = Fournisseur::withCount('achats')
            ->latest()
            ->get();

        return Inertia::render('Fournisseurs/Index', [
            'fournisseurs' => $fournisseurs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_fournisseur' => 'required|string|max:255|unique:fournisseurs,nom_fournisseur',
            'adresse_fournisseur' => 'nullable|string|max:255',
            'telephone_fournisseur' => 'nullable|string|max:50',
            'contact_personne' => 'nullable|string|max:255',
        ], [
            'nom_fournisseur.unique' => 'Ce nom de fournisseur existe déjà dans le système.',
            'nom_fournisseur.required' => 'Le nom du fournisseur est obligatoire.',
        ]);

        $fournisseur = Fournisseur::create($validated);

        AuditLog::record(
            'Création',
            'Fournisseurs',
            "Ajout du fournisseur '{$fournisseur->nom_fournisseur}'",
            $fournisseur
        );

        return redirect()->back()->with('success', 'Fournisseur enregistré avec succès.');
    }

    public function update(Request $request, Fournisseur $fournisseur)
    {
        $validated = $request->validate([
            'nom_fournisseur' => 'required|string|max:255|unique:fournisseurs,nom_fournisseur,' . $fournisseur->id,
            'adresse_fournisseur' => 'nullable|string|max:255',
            'telephone_fournisseur' => 'nullable|string|max:50',
            'contact_personne' => 'nullable|string|max:255',
        ], [
            'nom_fournisseur.unique' => 'Ce nom de fournisseur est déjà utilisé.',
            'nom_fournisseur.required' => 'Le nom du fournisseur est obligatoire.',
        ]);

        $fournisseur->update($validated);

        AuditLog::record(
            'Modification',
            'Fournisseurs',
            "Modification des informations du fournisseur '{$fournisseur->nom_fournisseur}'",
            $fournisseur
        );

        return redirect()->back()->with('success', 'Fournisseur mis à jour avec succès.');
    }

    public function destroy(Fournisseur $fournisseur)
    {
        if ($fournisseur->achats()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer ce fournisseur car des achats/marchés y sont associés.',
            ]);
        }

        $nom = $fournisseur->nom_fournisseur;
        $fournisseur->delete();

        AuditLog::record(
            'Suppression',
            'Fournisseurs',
            "Suppression du fournisseur '{$nom}'"
        );

        return redirect()->back()->with('success', 'Fournisseur supprimé avec succès.');
    }
}
