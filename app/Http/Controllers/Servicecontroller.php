<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Services/Index', [
            'services' => Service::with('division.departement.direction')->withCount('employes')->get(),
            'divisions' => Division::with('departement')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_service' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        Service::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'nom_service' => 'required|string|max:255',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $service->update($validated);

        return redirect()->back();
    }

    public function destroy(Service $service)
    {
        if ($service->employes()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : ce service contient des employés.',
            ]);
        }

        $service->delete();

        return redirect()->back();
    }
}