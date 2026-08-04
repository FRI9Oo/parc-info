<?php

namespace App\Http\Controllers;

use App\Models\AffectationMateriel;
use App\Models\Employe;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AffectationMaterielController extends Controller
{
    public function index()
    {
        $affectations = AffectationMateriel::with(['employe.service', 'materiel.categorie'])
            ->orderByDesc('date_affectation')
            ->get();

        // Add status to each affectation
        $affectations->each(function ($affectation) {
            $affectation->status = $affectation->getStatusAttribute();
            $affectation->status_color = $affectation->getStatusColorAttribute();
        });

        // Get available materials - only those not currently affected
        $materiels = Materiel::whereDoesntHave('affectations', function ($q) {
            $q->whereNull('date_restitution')
                ->orWhere('date_restitution', '>', Carbon::today()->toDateString());
        })->get();

        return Inertia::render('Affectations/Index', [
            'affectations' => $affectations,
            'employes' => Employe::orderBy('nom')->get(),
            'materiels' => $materiels,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'materiel_id' => 'required|exists:materiels,id',
            'date_affectation' => 'required|date',
        ]);

        // Check if material is already affected (no restitution date or future restitution date)
        $dejaAffecte = AffectationMateriel::where('materiel_id', $validated['materiel_id'])
            ->where(function ($q) {
                $q->whereNull('date_restitution')
                    ->orWhere('date_restitution', '>', Carbon::today()->toDateString());
            })
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
        $validated = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'materiel_id' => 'required|exists:materiels,id',
            'date_affectation' => 'required|date',
        ]);

        // Check if the material is already affected by another affectation
        // (excluding the current one)
        $dejaAffecte = AffectationMateriel::where('materiel_id', $validated['materiel_id'])
            ->where('id', '!=', $affectation->id)
            ->where(function ($q) {
                $q->whereNull('date_restitution')
                    ->orWhere('date_restitution', '>', Carbon::today()->toDateString());
            })
            ->exists();

        if ($dejaAffecte) {
            return redirect()->back()->withErrors([
                'materiel_id' => 'Ce matériel est déjà affecté à un autre employé.',
            ]);
        }

        // If the restitution date is set and is before the new affectation date, it's invalid
        if ($affectation->date_restitution && $affectation->date_restitution < $validated['date_affectation']) {
            return redirect()->back()->withErrors([
                'date_affectation' => 'La date d\'affectation ne peut pas être après la date de restitution.',
            ]);
        }

        $affectation->update($validated);

        return redirect()->back()->with('success', 'Affectation modifiée avec succès.');
    }

    public function restituer(Request $request, AffectationMateriel $affectation)
    {
        // Calculate minimum date (affectation date + 1 day)
        $minDate = Carbon::parse($affectation->date_affectation)->addDay()->toDateString();
        
        $validated = $request->validate([
            'date_restitution' => [
                'required',
                'date',
                'after_or_equal:' . $minDate,
            ],
        ]);

        $affectation->update($validated);

        return redirect()->back()->with('success', 'Date de restitution planifiée avec succès.');
    }

    public function cancelRestitution(Request $request, AffectationMateriel $affectation)
    {
        if ($affectation->date_restitution) {
            $affectation->update(['date_restitution' => null]);
            return redirect()->back()->with('success', 'Planification de restitution annulée.');
        }

        return redirect()->back()->withErrors([
            'cancel' => 'Aucune restitution à annuler.',
        ]);
    }

    public function destroy(AffectationMateriel $affectation)
    {
        $affectation->delete();
        return redirect()->back()->with('success', 'Affectation supprimée avec succès.');
    }
}