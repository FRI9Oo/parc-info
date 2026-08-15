<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AffectationMateriel;
use App\Models\AuditLog;
use App\Models\BordereauMateriel;
use App\Models\Categorie;
use App\Models\Departement;
use App\Models\Direction;
use App\Models\Division;
use App\Models\Employe;
use App\Models\Facture;
use App\Models\Fournisseur;
use App\Models\LivraisonStock;
use App\Models\Materiel;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // Financial KPIs from Purchasing & Invoicing
        $totalBudgetHT = (float) BordereauMateriel::sum(DB::raw('quantite_materiel * prix_unitaire_ht'));
        $totalFacturesTTC = (float) Facture::sum('montant_ttc');
        $totalCommandee = (int) BordereauMateriel::sum('quantite_materiel');
        $totalLivree = (int) LivraisonStock::sum('quantite_livraison');
        $tauxLivraisonGlobal = $totalCommandee > 0 ? round(min(100, ($totalLivree / $totalCommandee) * 100)) : 100;

        // Categories Distribution Breakdown
        $categoriesBreakdown = Categorie::withCount('materiels')
            ->get()
            ->map(function ($cat) {
                $total = $cat->materiels_count;
                $affectes = Materiel::where('categorie_id', $cat->id)
                    ->whereHas('affectations', fn($q) => $q->whereNull('date_restitution'))
                    ->count();
                return [
                    'id' => $cat->id,
                    'nom_categorie' => $cat->nom_categorie,
                    'total' => $total,
                    'affectes' => $affectes,
                    'disponibles' => max(0, $total - $affectes),
                    'taux_utilisation' => $total > 0 ? round(($affectes / $total) * 100) : 0,
                ];
            })
            ->filter(fn($c) => $c['total'] > 0)
            ->sortByDesc('total')
            ->values();

        // Recent Audit Activity Feed (Security)
        $recentAudits = AuditLog::with('user')
            ->latest()
            ->limit(5)
            ->get();

        // Top Available Hardware Ready for Assignment
        $availableMateriels = Materiel::whereDoesntHave('affectations', fn($q) => $q->whereNull('date_restitution'))
            ->with(['categorie', 'achat.fournisseur'])
            ->latest()
            ->limit(5)
            ->get();

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
                'fournisseurs' => Fournisseur::count(),
                'achats' => Achat::count(),
                'achats_en_cours' => Achat::whereIn('statut', ['En cours', 'Livré partiellement'])->count(),
                'achats_valides' => Achat::where('statut', 'Validé')->count(),
                'factures' => Facture::count(),
                'livraisons' => LivraisonStock::count(),
                'total_budget_ht' => $totalBudgetHT,
                'total_factures_ttc' => $totalFacturesTTC,
                'taux_livraison_global' => $tauxLivraisonGlobal,
            ],
            'recentAffectations' => AffectationMateriel::with(['employe.service', 'materiel.categorie'])
                ->orderByDesc('id')
                ->limit(6)
                ->get(),
            'categoriesBreakdown' => $categoriesBreakdown,
            'longStandingAffectations' => $longStandingAffectations,
            'recentAudits' => $recentAudits,
            'availableMateriels' => $availableMateriels,
            'alertMonths' => $alertMonths,
        ]);
    }
}