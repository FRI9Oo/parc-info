<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategorieController extends Controller
{
    public function index()
    {
        return Inertia::render('Categories/Index', [
            'categories' => Categorie::withCount('materiels')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_categorie' => 'required|string|max:255|unique:categories,nom_categorie',
        ], [
            'nom_categorie.required' => 'Le nom de la catégorie est obligatoire.',
            'nom_categorie.unique' => 'Une catégorie portant ce nom existe déjà.',
        ]);

        $cat = Categorie::create($validated);

        AuditLog::record('Création', 'Catégories', "Ajout de la catégorie '{$cat->nom_categorie}'", $cat);

        return redirect()->back()->with('success', "Catégorie '{$cat->nom_categorie}' créée avec succès.");
    }

    public function update(Request $request, Categorie $categorie)
    {
        $validated = $request->validate([
            'nom_categorie' => 'required|string|max:255|unique:categories,nom_categorie,' . $categorie->id,
        ], [
            'nom_categorie.required' => 'Le nom de la catégorie est obligatoire.',
            'nom_categorie.unique' => 'Une catégorie portant ce nom existe déjà.',
        ]);

        $categorie->update($validated);

        AuditLog::record('Modification', 'Catégories', "Mise à jour de la catégorie '{$categorie->nom_categorie}'", $categorie);

        return redirect()->back()->with('success', "Catégorie '{$categorie->nom_categorie}' mise à jour avec succès.");
    }

    public function destroy(Categorie $categorie)
    {
        if ($categorie->materiels()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cette catégorie contient des matériels.',
            ]);
        }

        $nom = $categorie->nom_categorie;
        $categorie->delete();

        AuditLog::record('Suppression', 'Catégories', "Suppression de la catégorie '{$nom}'");

        return redirect()->back()->with('success', "Catégorie '{$nom}' supprimée avec succès.");
    }
}