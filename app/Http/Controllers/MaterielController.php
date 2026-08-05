<?php

namespace App\Http\Controllers;

use App\Models\Materiel;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterielController extends Controller
{
    public function index()
    {
        return Inertia::render('Materiels/Index', [
            'materiels' => Materiel::with('categorie')->withCount('affectations')->get(),
            'categories' => Categorie::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'modele' => 'required|string|max:255',
            'numero_serie' => 'required|string|unique:materiels,numero_serie',
            'numero_inventaire' => 'required|string|unique:materiels,numero_inventaire',
            'caracteristique' => 'nullable|string',
            'categorie_id' => 'required|exists:categories,id',
        ]);

        Materiel::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Materiel $materiel)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'modele' => 'required|string|max:255',
            'numero_serie' => 'required|string|unique:materiels,numero_serie,' . $materiel->id,
            'numero_inventaire' => 'required|string|unique:materiels,numero_inventaire,' . $materiel->id,
            'caracteristique' => 'nullable|string',
            'categorie_id' => 'required|exists:categories,id',
        ]);

        $materiel->update($validated);

        return redirect()->back();
    }

    public function destroy(Materiel $materiel)
    {
        if ($materiel->affectations()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : ce matériel a des affectations enregistrées.',
            ]);
        }

        $materiel->delete();

        return redirect()->back();
    }
}