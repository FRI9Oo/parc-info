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

        // Only materiels with no currently-active affectation (as of today) are assignable
        $materielsDisponibles = Materiel::with('categorie')
            ->whereDoesntHave('affectations', function ($q) {
                $q->occupantMateriel();
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

        if ($this->hasOverlap($validated['materiel_id'], $validated['date_affectation'], null)) {
            return redirect()->back()->withErrors([
                'materiel_id' => 'Ce matériel est déjà en possession d\'un autre employé sur cette période.',
            ]);
        }

        AffectationMateriel::create($validated);

        return redirect()->back()->with('success', 'Matériel affecté avec succès.');
    }

    public function update(Request $request, AffectationMateriel $affectation)
    {
        if (! is_null($affectation->date_restitution)) {
            return redirect()->back()->withErrors([
                'modifier' => 'Cette affectation est clôturée. Utilisez "Modifier la clôture" pour corriger la date de restitution.',
            ]);
        }

        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'materiel_id' => 'required|exists:materiels,id',
            'date_affectation' => 'required|date',
        ]);

        if ($this->hasOverlap($validated['materiel_id'], $validated['date_affectation'], null, $affectation->id)) {
            return redirect()->back()->withErrors([
                'materiel_id' => 'Ce matériel est déjà en possession d\'un autre employé sur cette période.',
            ]);
        }

        $affectation->update($validated);

        return redirect()->back()->with('success', 'Affectation modifiée avec succès.');
    }

    /**
     * Close an open affectation, or correct the restitution date of an
     * already-closed one — same endpoint handles both. Either way, the
     * resulting period is checked against every other affectation of the
     * same matériel so two employees can never end up shown as possessing
     * it at the same time.
     */
    public function cloturer(Request $request, AffectationMateriel $affectation)
    {
        $validated = $request->validate([
            'date_cloture' => [
                'required',
                'date',
                'after_or_equal:' . $affectation->date_affectation->format('Y-m-d'),
            ],
        ]);

        if ($this->hasOverlap(
            $affectation->materiel_id,
            $affectation->date_affectation->format('Y-m-d'),
            $validated['date_cloture'],
            $affectation->id
        )) {
            return redirect()->back()->withErrors([
                'cloture' => 'Attention : cette date de clôture chevauche une autre affectation de ce matériel. Cela créerait une contradiction sur qui le possède.',
            ]);
        }

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

        if ($this->hasOverlap(
            $affectation->materiel_id,
            $affectation->date_affectation->format('Y-m-d'),
            null,
            $affectation->id
        )) {
            return redirect()->back()->withErrors([
                'cloture' => 'Impossible d\'annuler la clôture : ce matériel est actuellement en possession d\'un autre employé.',
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

    /**
     * Does the given [date_affectation, date_restitution] period for a
     * matériel overlap any other affectation of that same matériel?
     * A null date_restitution is treated as "still ongoing" (open-ended).
     */
    private function hasOverlap(int $materielId, string $dateAffectation, ?string $dateRestitution, ?int $excludeId = null): bool
    {
        $newStart = $dateAffectation;
        $newEnd = $dateRestitution ?? '9999-12-31';

        $others = AffectationMateriel::where('materiel_id', $materielId)
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->get();

        foreach ($others as $other) {
            $otherStart = $other->date_affectation->format('Y-m-d');
            $otherEnd = $other->date_restitution?->format('Y-m-d') ?? '9999-12-31';

            if ($newStart <= $otherEnd && $otherStart <= $newEnd) {
                return true;
            }
        }

        return false;
    }
}