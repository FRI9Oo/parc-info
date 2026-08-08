<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Employe;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeController extends Controller
{
    public function index()
    {
        return Inertia::render('Employes/Index', [
            'employes' => Employe::with('service.division.departement.direction')
                ->withCount('affectations')
                ->get(),
            'services' => Service::with('division.departement')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule' => 'required|string|max:255|unique:employes,matricule',
            'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'fonction' => 'required|string|max:255',
            'service_id' => 'required|exists:services,id',
        ]);

        $e = Employe::create($validated);

        AuditLog::record('Création', 'Employés', "Ajout de l'employé '{$e->nom} {$e->prenom}' (Matricule: {$e->matricule})", $e);

        return redirect()->back();
    }

    public function update(Request $request, Employe $employe)
    {
        $validated = $request->validate([
            'matricule' => 'required|string|max:255|unique:employes,matricule,' . $employe->id,
            'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'fonction' => 'required|string|max:255',
            'service_id' => 'required|exists:services,id',
        ]);

        $employe->update($validated);

        AuditLog::record('Modification', 'Employés', "Modification de la fiche employé '{$employe->nom} {$employe->prenom}' (Matricule: {$employe->matricule})", $employe);

        return redirect()->back();
    }

    public function destroy(Employe $employe)
    {
        if ($employe->affectations()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cet employé a des affectations de matériel.',
            ]);
        }

        $desc = "Suppression de l'employé '{$employe->nom} {$employe->prenom}' (Matricule: {$employe->matricule})";
        $employe->delete();

        AuditLog::record('Suppression', 'Employés', $desc);

        return redirect()->back();
    }
}