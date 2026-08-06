<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterielController extends Controller
{
    public function index()
    {
        $materiels = Materiel::with(['categorie', 'affectations' => function ($q) {
            $q->occupantMateriel()->with('employe');
        }])->withCount('affectations')->get()->map(function ($m) {
            $currentAffectation = $m->affectations->first();

            return [
                'id' => $m->id,
                'nom' => $m->nom,
                'marque' => $m->marque,
                'modele' => $m->modele,
                'numero_serie' => $m->numero_serie,
                'numero_inventaire' => $m->numero_inventaire,
                'caracteristique' => $m->caracteristique,
                'categorie_id' => $m->categorie_id,
                'categorie' => $m->categorie,
                'affectations_count' => $m->affectations_count,
                'is_disponible' => is_null($currentAffectation),
                'occupant' => $currentAffectation && $currentAffectation->employe
                    ? ($currentAffectation->employe->nom . ' ' . $currentAffectation->employe->prenom)
                    : null,
            ];
        });

        return Inertia::render('Materiels/Index', [
            'materiels' => $materiels,
            'categories' => Categorie::orderBy('nom_categorie')->get(),
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

        return redirect()->back()->with('success', 'Matériel créé avec succès.');
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

        return redirect()->back()->with('success', 'Matériel mis à jour avec succès.');
    }

    public function destroy(Materiel $materiel)
    {
        if ($materiel->affectations()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : ce matériel a des affectations enregistrées.',
            ]);
        }

        $materiel->delete();

        return redirect()->back()->with('success', 'Matériel supprimé avec succès.');
    }
}