<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Inertia\Inertia;


class CategorieController extends Controller
{
    public function index()
    {
        return Inertia::render('Categories/Index', [
            'categories' => Categorie::withCount('materiels')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_categorie' => 'required|string|max:255',
        ]);

        Categorie::create($validated);

        return redirect()->back();
    }
}