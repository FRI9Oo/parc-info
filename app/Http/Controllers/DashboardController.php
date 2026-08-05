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
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $affectationsActives = AffectationMateriel::whereNull('date_restitution')->count();
        $affectationsCloturees = AffectationMateriel::whereNotNull('date_restitution')->count();
        $materielsTotal = Materiel::count();

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
                'materiels_disponibles' => $materielsTotal - $affectationsActives,
            ],
            'recentAffectations' => AffectationMateriel::with(['employe', 'materiel'])
                ->orderByDesc('id')
                ->limit(6)
                ->get(),
        ]);
    }
}