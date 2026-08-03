<?php

namespace App\Http\Controllers;

use App\Models\Departement;
use App\Models\Direction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartementController extends Controller
{
    public function index()
    {
        return Inertia::render('Departements/Index', [
            'departements' => Departement::with('direction')->withCount('divisions')->get(),
            'directions' => Direction::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_departement' => 'required|string|max:255',
            'direction_id' => 'required|exists:directions,id',
        ]);

        Departement::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Departement $departement)
    {
        $validated = $request->validate([
            'nom_departement' => 'required|string|max:255',
            'direction_id' => 'required|exists:directions,id',
        ]);

        $departement->update($validated);

        return redirect()->back();
    }

    public function destroy(Departement $departement)
    {
        if ($departement->divisions()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : ce département contient des divisions.',
            ]);
        }

        $departement->delete();

        return redirect()->back();
    }
}