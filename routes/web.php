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

    // Échelle administrative (permission: gerer_structure)
    Route::middleware('permission:gerer_structure')->group(function () {
        Route::get('/directions', [DirectionController::class, 'index'])->name('directions.index');
        Route::post('/directions', [DirectionController::class, 'store'])->name('directions.store');
        Route::put('/directions/{direction}', [DirectionController::class, 'update'])->name('directions.update');
        Route::delete('/directions/{direction}', [DirectionController::class, 'destroy'])->name('directions.destroy');

        Route::get('/departements', [DepartementController::class, 'index'])->name('departements.index');
        Route::post('/departements', [DepartementController::class, 'store'])->name('departements.store');
        Route::put('/departements/{departement}', [DepartementController::class, 'update'])->name('departements.update');
        Route::delete('/departements/{departement}', [DepartementController::class, 'destroy'])->name('departements.destroy');

        Route::get('/divisions', [DivisionController::class, 'index'])->name('divisions.index');
        Route::post('/divisions', [DivisionController::class, 'store'])->name('divisions.store');
        Route::put('/divisions/{division}', [DivisionController::class, 'update'])->name('divisions.update');
        Route::delete('/divisions/{division}', [DivisionController::class, 'destroy'])->name('divisions.destroy');

        Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
        Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
        Route::put('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
        Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
    });

    // Employes (permission: gerer_employes)
    Route::middleware('permission:gerer_employes')->group(function () {
        Route::get('/employes', [EmployeController::class, 'index'])->name('employes.index');
        Route::post('/employes', [EmployeController::class, 'store'])->name('employes.store');
        Route::put('/employes/{employe}', [EmployeController::class, 'update'])->name('employes.update');
        Route::delete('/employes/{employe}', [EmployeController::class, 'destroy'])->name('employes.destroy');
    });

    // Categories & Materiels (permission: gerer_materiels)
    Route::middleware('permission:gerer_materiels')->group(function () {
        Route::get('/categories', [CategorieController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategorieController::class, 'store'])->name('categories.store');
        Route::put('/categories/{categorie}', [CategorieController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{categorie}', [CategorieController::class, 'destroy'])->name('categories.destroy');

        Route::get('/materiels', [MaterielController::class, 'index'])->name('materiels.index');
        Route::post('/materiels', [MaterielController::class, 'store'])->name('materiels.store');
        Route::put('/materiels/{materiel}', [MaterielController::class, 'update'])->name('materiels.update');
        Route::delete('/materiels/{materiel}', [MaterielController::class, 'destroy'])->name('materiels.destroy');
    });

    // Affectations (permission: gerer_affectations)
    Route::middleware('permission:gerer_affectations')->group(function () {
        Route::get('/affectations', [AffectationMaterielController::class, 'index'])->name('affectations.index');
        Route::post('/affectations', [AffectationMaterielController::class, 'store'])->name('affectations.store');
        Route::put('/affectations/{affectation}', [AffectationMaterielController::class, 'update'])->name('affectations.update');
        Route::put('/affectations/{affectation}/cloturer', [AffectationMaterielController::class, 'cloturer'])->name('affectations.cloturer');
        Route::put('/affectations/{affectation}/annuler-cloture', [AffectationMaterielController::class, 'annulerCloture'])->name('affectations.annuler-cloture');
        Route::delete('/affectations/{affectation}', [AffectationMaterielController::class, 'destroy'])->name('affectations.destroy');
    });

    // Roles, Permissions & Utilisateurs (permission: gerer_structure)
    Route::middleware('permission:gerer_structure')->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

        Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
        Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
        Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
        Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

        Route::get('/utilisateurs', [UserController::class, 'index'])->name('users.index');
        Route::post('/utilisateurs', [UserController::class, 'store'])->name('users.store');
        Route::put('/utilisateurs/{user}', [UserController::class, 'update'])->name('users.update');
        Route::put('/utilisateurs/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');
        Route::delete('/utilisateurs/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/auth.php';