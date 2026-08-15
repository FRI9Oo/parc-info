<?php

namespace App\Http\Controllers;

use App\Models\AffectationMateriel;
use App\Models\AuditLog;
use App\Models\Employe;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AffectationMaterielController extends Controller
{
    public function index()
    {
        $affectations = AffectationMateriel::with(['employe.service.division.departement', 'materiel.categorie'])
            ->orderByDesc('date_affectation')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Affectations/Index', [
            'affectations' => $affectations,
            'employes' => Employe::with('service.division.departement')->orderBy('nom')->get(),
            'materiels' => Materiel::with('categorie')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'materiel_id' => 'required|exists:materiels,id',
            'date_affectation' => [
                'required',
                'date',
                'after_or_equal:2020-01-01',
                'before_or_equal:' . now()->addYears(1)->format('Y-m-d'),
            ],
        ]);

        if ($this->hasOverlap($validated['materiel_id'], $validated['date_affectation'], null)) {
            return redirect()->back()->withErrors([
                'materiel_id' => 'Ce matériel est déjà en possession d\'un autre employé sur cette période ou réservé ultérieurement.',
            ]);
        }

        $emp = Employe::with('service.division.departement.direction')->find($validated['employe_id']);
        if ($emp && $emp->service) {
            $validated['service_id'] = $emp->service_id;
            $validated['division_id'] = $emp->service->division_id ?? null;
            $validated['departement_id'] = $emp->service->division->departement_id ?? null;
            $validated['direction_id'] = $emp->service->division->departement->direction_id ?? null;
        }

        $aff = AffectationMateriel::create($validated);
        $aff->load(['employe', 'materiel']);

        AuditLog::record(
            'Création',
            'Affectations',
            "Affectation du matériel '{$aff->materiel->nom}' à l'employé '{$aff->employe->nom} {$aff->employe->prenom}' (Code: AFF-" . str_pad($aff->id, 5, '0', STR_PAD_LEFT) . ")",
            $aff
        );

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
            'date_affectation' => [
                'required',
                'date',
                'after_or_equal:2020-01-01',
                'before_or_equal:' . now()->addYears(1)->format('Y-m-d'),
            ],
        ]);

        if ($this->hasOverlap($validated['materiel_id'], $validated['date_affectation'], null, $affectation->id)) {
            return redirect()->back()->withErrors([
                'materiel_id' => 'Ce matériel est déjà en possession d\'un autre employé sur cette période.',
            ]);
        }

        $emp = Employe::with('service.division.departement.direction')->find($validated['employe_id']);
        if ($emp && $emp->service) {
            $validated['service_id'] = $emp->service_id;
            $validated['division_id'] = $emp->service->division_id ?? null;
            $validated['departement_id'] = $emp->service->division->departement_id ?? null;
            $validated['direction_id'] = $emp->service->division->departement->direction_id ?? null;
        }

        $affectation->update($validated);
        $affectation->load(['employe', 'materiel']);

        AuditLog::record(
            'Modification',
            'Affectations',
            "Modification de l'affectation AFF-" . str_pad($affectation->id, 5, '0', STR_PAD_LEFT) . " ({$affectation->materiel->nom} -> {$affectation->employe->nom} {$affectation->employe->prenom})",
            $affectation
        );

        return redirect()->back()->with('success', 'Affectation modifiée avec succès.');
    }

    public function cloturer(Request $request, AffectationMateriel $affectation)
    {
        $validated = $request->validate([
            'date_cloture' => [
                'required',
                'date',
                'after_or_equal:' . $affectation->date_affectation->format('Y-m-d'),
                'before_or_equal:' . now()->addYears(2)->format('Y-m-d'),
            ],
        ]);

        if ($this->hasOverlap(
            $affectation->materiel_id,
            $affectation->date_affectation->format('Y-m-d'),
            $validated['date_cloture'],
            $affectation->id
        )) {
            return redirect()->back()->withErrors([
                'cloture' => 'Attention : cette date de clôture chevauche une autre affectation de ce matériel.',
            ]);
        }

        $affectation->update([
            'date_restitution' => $validated['date_cloture'],
        ]);
        $affectation->load(['employe', 'materiel']);

        AuditLog::record(
            'Clôture',
            'Affectations',
            "Clôture de l'affectation AFF-" . str_pad($affectation->id, 5, '0', STR_PAD_LEFT) . " ({$affectation->materiel->nom}) au {$validated['date_cloture']}",
            $affectation
        );

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
        $affectation->load(['employe', 'materiel']);

        AuditLog::record(
            'Annulation clôture',
            'Affectations',
            "Annulation de la clôture de l'affectation AFF-" . str_pad($affectation->id, 5, '0', STR_PAD_LEFT) . " ({$affectation->materiel->nom})",
            $affectation
        );

        return redirect()->back()->with('success', 'Clôture annulée, affectation réactivée.');
    }

    public function print(AffectationMateriel $affectation)
    {
        $affectation->load([
            'employe.service.division.departement.direction',
            'materiel.categorie',
        ]);

        AuditLog::record(
            'Impression',
            'Affectations',
            "Impression de la fiche de prise en charge AFF-" . str_pad($affectation->id, 5, '0', STR_PAD_LEFT),
            $affectation
        );

        return Inertia::render('Affectations/Print', [
            'affectation' => $affectation,
        ]);
    }

    public function destroy(AffectationMateriel $affectation)
    {
        $affectation->load(['employe', 'materiel']);
        $code = "AFF-" . str_pad($affectation->id, 5, '0', STR_PAD_LEFT);
        $desc = "Suppression de l'affectation {$code} ({$affectation->materiel?->nom} - {$affectation->employe?->nom})";

        $affectation->delete();

        AuditLog::record('Suppression', 'Affectations', $desc);

        return redirect()->back()->with('success', 'Affectation supprimée avec succès.');
    }

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

            if ($newStart < $otherEnd && $otherStart < $newEnd) {
                return true;
            }
        }

        return false;
    }
}