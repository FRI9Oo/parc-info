<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Departement;
use App\Models\Direction;
use App\Models\Division;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Services/Index', [
            'services' => Service::with('division.departement.direction')->withCount('employes')->latest()->get(),
            'divisions' => Division::with('departement.direction')->get(),
            'departements' => Departement::with('direction')->get(),
            'directions' => Direction::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_service' => 'required|string|max:255|unique:services,nom_service',
            'division_id' => 'required|exists:divisions,id',
        ], [
            'nom_service.required' => 'Le nom du service est obligatoire.',
            'nom_service.unique' => 'Un service avec ce nom existe déjà dans l\'organisation.',
            'division_id.required' => 'Veuillez sélectionner une division de rattachement.',
        ]);

        $srv = Service::create($validated);
        $srv->load('division.departement.direction');

        AuditLog::record('Création', 'Structure', "Ajout du service '{$srv->nom_service}' (Division: {$srv->division?->nom_division})", $srv);

        return redirect()->back()->with('success', "Service '{$srv->nom_service}' créé avec succès.");
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'nom_service' => 'required|string|max:255|unique:services,nom_service,' . $service->id,
            'division_id' => 'required|exists:divisions,id',
        ], [
            'nom_service.required' => 'Le nom du service est obligatoire.',
            'nom_service.unique' => 'Un service avec ce nom existe déjà dans l\'organisation.',
            'division_id.required' => 'Veuillez sélectionner une division de rattachement.',
        ]);

        $service->update($validated);
        $service->load('division.departement.direction');

        AuditLog::record('Modification', 'Structure', "Mise à jour du service '{$service->nom_service}'", $service);

        return redirect()->back()->with('success', "Service '{$service->nom_service}' mis à jour avec succès.");
    }

    public function destroy(Service $service)
    {
        if ($service->employes()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : ce service contient des employés.',
            ]);
        }

        $nom = $service->nom_service;
        $service->delete();

        AuditLog::record('Suppression', 'Structure', "Suppression du service '{$nom}'");

        return redirect()->back()->with('success', "Service '{$nom}' supprimé avec succès.");
    }
}