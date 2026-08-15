<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DirectionController;
use App\Http\Controllers\DepartementController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\MaterielController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\AffectationMaterielController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\MarqueModeleController;
use App\Http\Controllers\AchatController;
use App\Http\Controllers\BordereauMaterielController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\LivraisonStockController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Échelle administrative (Structure)
    Route::get('/directions', [DirectionController::class, 'index'])->middleware('permission:voir_directions,gerer_directions,creer_direction,modifier_direction,supprimer_direction,voir_structure,gerer_structure,modifier_structure,supprimer_structure')->name('directions.index');
    Route::post('/directions', [DirectionController::class, 'store'])->middleware('permission:creer_direction,gerer_directions,modifier_structure,gerer_structure')->name('directions.store');
    Route::put('/directions/{direction}', [DirectionController::class, 'update'])->middleware('permission:modifier_direction,gerer_directions,modifier_structure,gerer_structure')->name('directions.update');
    Route::delete('/directions/{direction}', [DirectionController::class, 'destroy'])->middleware('permission:supprimer_direction,gerer_directions,supprimer_structure,gerer_structure')->name('directions.destroy');

    Route::get('/departements', [DepartementController::class, 'index'])->middleware('permission:voir_departements,gerer_departements,creer_departement,modifier_departement,supprimer_departement,voir_structure,gerer_structure,modifier_structure,supprimer_structure')->name('departements.index');
    Route::post('/departements', [DepartementController::class, 'store'])->middleware('permission:creer_departement,gerer_departements,modifier_structure,gerer_structure')->name('departements.store');
    Route::put('/departements/{departement}', [DepartementController::class, 'update'])->middleware('permission:modifier_departement,gerer_departements,modifier_structure,gerer_structure')->name('departements.update');
    Route::delete('/departements/{departement}', [DepartementController::class, 'destroy'])->middleware('permission:supprimer_departement,gerer_departements,supprimer_structure,gerer_structure')->name('departements.destroy');

    Route::get('/divisions', [DivisionController::class, 'index'])->middleware('permission:voir_divisions,gerer_divisions,creer_division,modifier_division,supprimer_division,voir_structure,gerer_structure,modifier_structure,supprimer_structure')->name('divisions.index');
    Route::post('/divisions', [DivisionController::class, 'store'])->middleware('permission:creer_division,gerer_divisions,modifier_structure,gerer_structure')->name('divisions.store');
    Route::put('/divisions/{division}', [DivisionController::class, 'update'])->middleware('permission:modifier_division,gerer_divisions,modifier_structure,gerer_structure')->name('divisions.update');
    Route::delete('/divisions/{division}', [DivisionController::class, 'destroy'])->middleware('permission:supprimer_division,gerer_divisions,supprimer_structure,gerer_structure')->name('divisions.destroy');

    Route::get('/services', [ServiceController::class, 'index'])->middleware('permission:voir_services,gerer_services,creer_service,modifier_service,supprimer_service,voir_structure,gerer_structure,modifier_structure,supprimer_structure')->name('services.index');
    Route::post('/services', [ServiceController::class, 'store'])->middleware('permission:creer_service,gerer_services,modifier_structure,gerer_structure')->name('services.store');
    Route::put('/services/{service}', [ServiceController::class, 'update'])->middleware('permission:modifier_service,gerer_services,modifier_structure,gerer_structure')->name('services.update');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->middleware('permission:supprimer_service,gerer_services,supprimer_structure,gerer_structure')->name('services.destroy');

    // Employes
    Route::get('/employes', [EmployeController::class, 'index'])->middleware('permission:voir_employes,gerer_employes,creer_employe,modifier_employe,supprimer_employe')->name('employes.index');
    Route::post('/employes', [EmployeController::class, 'store'])->middleware('permission:creer_employe,gerer_employes')->name('employes.store');
    Route::put('/employes/{employe}', [EmployeController::class, 'update'])->middleware('permission:modifier_employe,gerer_employes')->name('employes.update');
    Route::delete('/employes/{employe}', [EmployeController::class, 'destroy'])->middleware('permission:supprimer_employe,gerer_employes')->name('employes.destroy');

    // Categories & Materiels
    Route::get('/categories', [CategorieController::class, 'index'])->middleware('permission:voir_materiels,gerer_materiels,creer_materiel,modifier_materiel,supprimer_materiel')->name('categories.index');
    Route::post('/categories', [CategorieController::class, 'store'])->middleware('permission:creer_materiel,gerer_materiels')->name('categories.store');
    Route::put('/categories/{categorie}', [CategorieController::class, 'update'])->middleware('permission:modifier_materiel,gerer_materiels')->name('categories.update');
    Route::delete('/categories/{categorie}', [CategorieController::class, 'destroy'])->middleware('permission:supprimer_materiel,gerer_materiels')->name('categories.destroy');

    Route::get('/materiels', [MaterielController::class, 'index'])->middleware('permission:voir_materiels,gerer_materiels,creer_materiel,modifier_materiel,supprimer_materiel')->name('materiels.index');
    Route::get('/materiels/template', [MaterielController::class, 'downloadTemplate'])->middleware('permission:creer_materiel,gerer_materiels')->name('materiels.template');
    Route::post('/materiels/bulk-import', [MaterielController::class, 'bulkImport'])->middleware('permission:creer_materiel,gerer_materiels')->name('materiels.bulk-import');
    Route::post('/materiels', [MaterielController::class, 'store'])->middleware('permission:creer_materiel,gerer_materiels')->name('materiels.store');
    Route::put('/materiels/{materiel}', [MaterielController::class, 'update'])->middleware('permission:modifier_materiel,gerer_materiels')->name('materiels.update');
    Route::delete('/materiels/{materiel}', [MaterielController::class, 'destroy'])->middleware('permission:supprimer_materiel,gerer_materiels')->name('materiels.destroy');

    // Marques & Modeles
    Route::get('/marques-modeles', [MarqueModeleController::class, 'index'])->middleware('permission:voir_marques_modeles,gerer_marques_modeles,creer_marque_modele,modifier_marque_modele,supprimer_marque_modele')->name('marques-modeles.index');
    Route::post('/marques', [MarqueModeleController::class, 'storeMarque'])->middleware('permission:creer_marque_modele,gerer_marques_modeles')->name('marques.store');
    Route::put('/marques/{marque}', [MarqueModeleController::class, 'updateMarque'])->middleware('permission:modifier_marque_modele,gerer_marques_modeles')->name('marques.update');
    Route::delete('/marques/{marque}', [MarqueModeleController::class, 'destroyMarque'])->middleware('permission:supprimer_marque_modele,gerer_marques_modeles')->name('marques.destroy');
    Route::post('/modeles', [MarqueModeleController::class, 'storeModele'])->middleware('permission:creer_marque_modele,gerer_marques_modeles')->name('modeles.store');
    Route::put('/modeles/{modele}', [MarqueModeleController::class, 'updateModele'])->middleware('permission:modifier_marque_modele,gerer_marques_modeles')->name('modeles.update');
    Route::delete('/modeles/{modele}', [MarqueModeleController::class, 'destroyModele'])->middleware('permission:supprimer_marque_modele,gerer_marques_modeles')->name('modeles.destroy');

    // Fournisseurs
    Route::get('/fournisseurs', [FournisseurController::class, 'index'])->middleware('permission:voir_fournisseurs,gerer_fournisseurs,creer_fournisseur,modifier_fournisseur,supprimer_fournisseur')->name('fournisseurs.index');
    Route::post('/fournisseurs', [FournisseurController::class, 'store'])->middleware('permission:creer_fournisseur,gerer_fournisseurs')->name('fournisseurs.store');
    Route::put('/fournisseurs/{fournisseur}', [FournisseurController::class, 'update'])->middleware('permission:modifier_fournisseur,gerer_fournisseurs')->name('fournisseurs.update');
    Route::delete('/fournisseurs/{fournisseur}', [FournisseurController::class, 'destroy'])->middleware('permission:supprimer_fournisseur,gerer_fournisseurs')->name('fournisseurs.destroy');

    // Achats & Commandes
    Route::get('/achats', [AchatController::class, 'index'])->middleware('permission:voir_achats,gerer_achats,creer_achat,modifier_achat,supprimer_achat')->name('achats.index');
    Route::post('/achats', [AchatController::class, 'store'])->middleware('permission:creer_achat,gerer_achats')->name('achats.store');
    Route::get('/achats/{achat}', [AchatController::class, 'show'])->middleware('permission:voir_achats,gerer_achats,creer_achat,modifier_achat,supprimer_achat')->name('achats.show');
    Route::put('/achats/{achat}', [AchatController::class, 'update'])->middleware('permission:modifier_achat,gerer_achats')->name('achats.update');
    Route::delete('/achats/{achat}', [AchatController::class, 'destroy'])->middleware('permission:supprimer_achat,gerer_achats')->name('achats.destroy');

    // Bordereau Materiel
    Route::post('/achats/{achat}/bordereaux', [BordereauMaterielController::class, 'store'])->middleware('permission:creer_achat,modifier_achat,gerer_achats')->name('bordereaux.store');
    Route::put('/bordereaux/{bordereau}', [BordereauMaterielController::class, 'update'])->middleware('permission:modifier_achat,gerer_achats')->name('bordereaux.update');
    Route::delete('/bordereaux/{bordereau}', [BordereauMaterielController::class, 'destroy'])->middleware('permission:supprimer_achat,gerer_achats')->name('bordereaux.destroy');

    // Factures
    Route::get('/factures', [FactureController::class, 'index'])->middleware('permission:voir_factures,gerer_factures,creer_facture,modifier_facture,supprimer_facture')->name('factures.index');
    Route::post('/factures', [FactureController::class, 'store'])->middleware('permission:creer_facture,gerer_factures')->name('factures.store');
    Route::put('/factures/{facture}', [FactureController::class, 'update'])->middleware('permission:modifier_facture,gerer_factures')->name('factures.update');
    Route::delete('/factures/{facture}', [FactureController::class, 'destroy'])->middleware('permission:supprimer_facture,gerer_factures')->name('factures.destroy');

    // Livraisons & Stocks
    Route::get('/livraisons', [LivraisonStockController::class, 'index'])->middleware('permission:voir_livraisons,gerer_livraisons,creer_livraison,supprimer_livraison')->name('livraisons.index');
    Route::post('/livraisons', [LivraisonStockController::class, 'store'])->middleware('permission:creer_livraison,gerer_livraisons')->name('livraisons.store');
    Route::delete('/livraisons/{livraison}', [LivraisonStockController::class, 'destroy'])->middleware('permission:supprimer_livraison,gerer_livraisons')->name('livraisons.destroy');

    // Affectations
    Route::get('/affectations', [AffectationMaterielController::class, 'index'])->middleware('permission:voir_affectations,gerer_affectations,creer_affectation,modifier_affectation,imprimer_affectation')->name('affectations.index');
    Route::post('/affectations', [AffectationMaterielController::class, 'store'])->middleware('permission:creer_affectation,gerer_affectations')->name('affectations.store');
    Route::put('/affectations/{affectation}', [AffectationMaterielController::class, 'update'])->middleware('permission:modifier_affectation,gerer_affectations')->name('affectations.update');
    Route::put('/affectations/{affectation}/cloturer', [AffectationMaterielController::class, 'cloturer'])->middleware('permission:modifier_affectation,gerer_affectations')->name('affectations.cloturer');
    Route::put('/affectations/{affectation}/annuler-cloture', [AffectationMaterielController::class, 'annulerCloture'])->middleware('permission:modifier_affectation,gerer_affectations')->name('affectations.annuler-cloture');
    Route::get('/affectations/{affectation}/imprimer', [AffectationMaterielController::class, 'print'])->middleware('permission:imprimer_affectation,voir_affectations,gerer_affectations')->name('affectations.print');
    Route::delete('/affectations/{affectation}', [AffectationMaterielController::class, 'destroy'])->middleware('permission:modifier_affectation,gerer_affectations')->name('affectations.destroy');

    // Roles & Utilisateurs (Administration)
    Route::middleware('permission:gerer_structure')->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

        Route::get('/utilisateurs', [UserController::class, 'index'])->name('users.index');
        Route::post('/utilisateurs', [UserController::class, 'store'])->name('users.store');
        Route::put('/utilisateurs/{user}', [UserController::class, 'update'])->name('users.update');
        Route::put('/utilisateurs/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');
        Route::put('/utilisateurs/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::put('/utilisateurs/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::delete('/utilisateurs/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // Exports CSV
    Route::get('/exports/materiels/csv', [\App\Http\Controllers\ExportController::class, 'exportMateriels'])->middleware('permission:voir_materiels,gerer_materiels')->name('exports.materiels.csv');
    Route::get('/exports/affectations/csv', [\App\Http\Controllers\ExportController::class, 'exportAffectations'])->middleware('permission:voir_affectations,gerer_affectations')->name('exports.affectations.csv');
    Route::get('/exports/employes/csv', [\App\Http\Controllers\ExportController::class, 'exportEmployes'])->middleware('permission:voir_employes,gerer_employes')->name('exports.employes.csv');
    Route::get('/exports/audit-logs/csv', [\App\Http\Controllers\ExportController::class, 'exportAuditLogs'])->middleware('permission:voir_audit_logs')->name('exports.audit-logs.csv');

    // Journal d'Audit
    Route::get('/audit-logs', [\App\Http\Controllers\AuditLogController::class, 'index'])
        ->middleware('permission:voir_audit_logs')
        ->name('audit-logs.index');
});

require __DIR__.'/auth.php';