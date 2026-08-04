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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Directions
    Route::get('/directions', [DirectionController::class, 'index'])->name('directions.index');
    Route::post('/directions', [DirectionController::class, 'store'])->name('directions.store');
    Route::put('/directions/{direction}', [DirectionController::class, 'update'])->name('directions.update');
    Route::delete('/directions/{direction}', [DirectionController::class, 'destroy'])->name('directions.destroy');

    // Departements
    Route::get('/departements', [DepartementController::class, 'index'])->name('departements.index');
    Route::post('/departements', [DepartementController::class, 'store'])->name('departements.store');
    Route::put('/departements/{departement}', [DepartementController::class, 'update'])->name('departements.update');
    Route::delete('/departements/{departement}', [DepartementController::class, 'destroy'])->name('departements.destroy');

    // Divisions
    Route::get('/divisions', [DivisionController::class, 'index'])->name('divisions.index');
    Route::post('/divisions', [DivisionController::class, 'store'])->name('divisions.store');
    Route::put('/divisions/{division}', [DivisionController::class, 'update'])->name('divisions.update');
    Route::delete('/divisions/{division}', [DivisionController::class, 'destroy'])->name('divisions.destroy');

    // Services
    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
    Route::put('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');

    // Employes
    Route::get('/employes', [EmployeController::class, 'index'])->name('employes.index');
    Route::post('/employes', [EmployeController::class, 'store'])->name('employes.store');
    Route::put('/employes/{employe}', [EmployeController::class, 'update'])->name('employes.update');
    Route::delete('/employes/{employe}', [EmployeController::class, 'destroy'])->name('employes.destroy');

    // Affectations
    Route::get('/affectations', [AffectationMaterielController::class, 'index'])->name('affectations.index');
    Route::post('/affectations', [AffectationMaterielController::class, 'store'])->name('affectations.store');
    Route::put('/affectations/{affectation}', [AffectationMaterielController::class, 'update'])->name('affectations.update');
    Route::put('/affectations/{affectation}/restituer', [AffectationMaterielController::class, 'restituer'])->name('affectations.restituer');
    Route::put('/affectations/{affectation}/cancel-restitution', [AffectationMaterielController::class, 'cancelRestitution'])->name('affectations.cancel-restitution');
    Route::delete('/affectations/{affectation}', [AffectationMaterielController::class, 'destroy'])->name('affectations.destroy');
});

Route::get('/categories', [CategorieController::class, 'index'])->name('categories.index');
Route::post('/categories', [CategorieController::class, 'store'])->name('categories.store');

Route::get('/materiels', [MaterielController::class, 'index'])->name('materiels.index');
Route::post('/materiels', [MaterielController::class, 'store'])->name('materiels.store');

require __DIR__.'/auth.php';