<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategorieController extends Controller
{
    public function index()
    {
        return Inertia::render('Categories/Index', [
            'categories' => Categorie::withCount('materiels')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_categorie' => 'required|string|max:255',
        ]);

        Categorie::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Categorie $categorie)
    {
        $validated = $request->validate([
            'nom_categorie' => 'required|string|max:255',
        ]);

        $categorie->update($validated);

        return redirect()->back();
    }

    public function destroy(Categorie $categorie)
    {
        if ($categorie->materiels()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cette catégorie contient des matériels.',
            ]);
        }

        $categorie->delete();

        return redirect()->back();
    }
}