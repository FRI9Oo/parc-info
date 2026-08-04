<?php

namespace App\Http\Controllers;

use App\Models\AffectationMateriel;
use App\Models\Employe;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AffectationMaterielController extends Controller
{
    public function index()
    {
        $affectations = AffectationMateriel::with(['employe', 'materiel.categorie'])
            ->orderByDesc('date_affectation')
            ->orderByDesc('id')
            ->get();

        // Only materiels with no open (non-clôturé) affectation are assignable
        $materielsDisponibles = Materiel::with('categorie')
            ->whereDoesntHave('affectations', function ($q) {
                $q->whereNull('date_restitution');
            })
            ->get();

        return Inertia::render('Affectations/Index', [
            'affectations' => $affectations,
            'employes' => Employe::orderBy('nom')->get(),
            'materiels' => $materielsDisponibles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'materiel_id' => 'required|exists:materiels,id',
            'date_affectation' => 'required|date',
        ]);

        $dejaAffecte = AffectationMateriel::where('materiel_id', $validated['materiel_id'])
            ->whereNull('date_restitution')
            ->exists();

        if ($dejaAffecte) {
            return redirect()->back()->withErrors([
                'materiel_id' => 'Ce matériel est déjà affecté.',
            ]);
        }

        AffectationMateriel::create($validated);

        return redirect()->back()->with('success', 'Matériel affecté avec succès.');
    }

    public function update(Request $request, AffectationMateriel $affectation)
    {
        if (! is_null($affectation->date_restitution)) {
            return redirect()->back()->withErrors([
                'modifier' => 'Cette affectation est clôturée et ne peut plus être modifiée.',
            ]);
        }

        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'materiel_id' => 'required|exists:materiels,id',
            'date_affectation' => 'required|date',
        ]);

        $dejaAffecte = AffectationMateriel::where('materiel_id', $validated['materiel_id'])
            ->where('id', '!=', $affectation->id)
            ->whereNull('date_restitution')
            ->exists();

        if ($dejaAffecte) {
            return redirect()->back()->withErrors([
                'materiel_id' => 'Ce matériel est déjà affecté à un autre employé.',
            ]);
        }

        $affectation->update($validated);

        return redirect()->back()->with('success', 'Affectation modifiée avec succès.');
    }

    public function cloturer(Request $request, AffectationMateriel $affectation)
    {
        if (! is_null($affectation->date_restitution)) {
            return redirect()->back()->withErrors([
                'cloture' => 'Cette affectation est déjà clôturée.',
            ]);
        }

        $validated = $request->validate([
            'date_cloture' => [
                'required',
                'date',
                'after_or_equal:' . $affectation->date_affectation->format('Y-m-d'),
            ],
        ]);

        $affectation->update([
            'date_restitution' => $validated['date_cloture'],
        ]);

        return redirect()->back()->with('success', 'Affectation clôturée avec succès.');
    }

    public function annulerCloture(AffectationMateriel $affectation)
    {
        if (is_null($affectation->date_restitution)) {
            return redirect()->back()->withErrors([
                'cloture' => "Cette affectation n'est pas clôturée.",
            ]);
        }

        $affectation->update(['date_restitution' => null]);

        return redirect()->back()->with('success', 'Clôture annulée, affectation réactivée.');
    }

    public function destroy(AffectationMateriel $affectation)
    {
        $affectation->delete();

        return redirect()->back()->with('success', 'Affectation supprimée avec succès.');
    }
}