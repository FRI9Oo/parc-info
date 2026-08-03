<?php

namespace App\Http\Controllers;

use App\Models\Direction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DirectionController extends Controller
{
    public function index()
    {
        return Inertia::render('Directions/Index', [
            'directions' => Direction::withCount('departements')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_direction' => 'required|string|max:255',
        ]);

        Direction::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Direction $direction)
    {
        $validated = $request->validate([
            'nom_direction' => 'required|string|max:255',
        ]);

        $direction->update($validated);

        return redirect()->back();
    }

    public function destroy(Direction $direction)
    {
        if ($direction->departements()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cette direction contient des départements.',
            ]);
        }

        $direction->delete();

        return redirect()->back();
    }
}