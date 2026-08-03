<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Departement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    public function index()
    {
        return Inertia::render('Divisions/Index', [
            'divisions' => Division::with('departement.direction')->withCount('services')->get(),
            'departements' => Departement::with('direction')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_division' => 'required|string|max:255',
            'departement_id' => 'required|exists:departements,id',
        ]);

        Division::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Division $division)
    {
        $validated = $request->validate([
            'nom_division' => 'required|string|max:255',
            'departement_id' => 'required|exists:departements,id',
        ]);

        $division->update($validated);

        return redirect()->back();
    }

    public function destroy(Division $division)
    {
        if ($division->services()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cette division contient des services.',
            ]);
        }

        $division->delete();

        return redirect()->back();
    }
}