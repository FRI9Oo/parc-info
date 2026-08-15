<?php

namespace App\Http\Controllers;

use App\Models\Direction;
use App\Models\Departement;
use App\Models\Division;
use App\Models\Service;
use App\Models\Employe;
use App\Models\Materiel;
use App\Models\Categorie;
use App\Models\AffectationMateriel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $alertMonths = max(1, (int) $request->input('alert_months', 6));
        $daysThreshold = $alertMonths * 30;

        $affectationsActives = AffectationMateriel::whereNull('date_restitution')->count();
        $affectationsCloturees = AffectationMateriel::whereNotNull('date_restitution')->count();
        $materielsTotal = Materiel::count();

        // Active affectations older than threshold
        $longStandingAffectations = AffectationMateriel::with(['employe', 'materiel.categorie'])
            ->whereNull('date_restitution')
            ->where('date_affectation', '<=', now()->subDays($daysThreshold))
            ->orderBy('date_affectation')
            ->get()
            ->map(function ($a) {
                $days = (int) now()->diffInDays($a->date_affectation);
                $months = floor($days / 30);
                return [
                    'id' => $a->id,
                    'date_affectation' => $a->date_affectation->format('Y-m-d'),
                    'duration_days' => $days,
                    'duration_months' => $months,
                    'employe_nom' => $a->employe ? ($a->employe->nom . ' ' . $a->employe->prenom) : '—',
                    'employe_matricule' => $a->employe?->matricule,
                    'materiel_nom' => $a->materiel?->nom,
                    'materiel_serie' => $a->materiel?->numero_serie,
                    'materiel_categorie' => $a->materiel?->categorie?->nom_categorie,
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'directions' => Direction::count(),
                'departements' => Departement::count(),
                'divisions' => Division::count(),
                'services' => Service::count(),
                'employes' => Employe::count(),
                'materiels' => $materielsTotal,
                'categories' => Categorie::count(),
                'affectations_actives' => $affectationsActives,
                'affectations_cloturees' => $affectationsCloturees,
                'materiels_disponibles' => max(0, $materielsTotal - $affectationsActives),
                'long_standing_count' => $longStandingAffectations->count(),
                'fournisseurs' => \App\Models\Fournisseur::count(),
                'achats' => \App\Models\Achat::count(),
                'factures' => \App\Models\Facture::count(),
                'livraisons' => \App\Models\LivraisonStock::count(),
            ],
            'recentAffectations' => AffectationMateriel::with(['employe', 'materiel'])
                ->orderByDesc('id')
                ->limit(6)
                ->get(),
            'longStandingAffectations' => $longStandingAffectations,
            'alertMonths' => $alertMonths,
        ]);
    }
}