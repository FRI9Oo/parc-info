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
                ->latest()
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
            'fonction' => 'nullable|string|max:255',
            'service_id' => 'required|exists:services,id',
        ], [
            'matricule.unique' => 'Ce matricule est déjà attribué à un autre employé.',
            'matricule.required' => 'Le matricule est obligatoire.',
            'nom.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'service_id.required' => 'Veuillez sélectionner un service de rattachement.',
        ]);

        $e = Employe::create($validated);

        AuditLog::record('Création', 'Employés', "Ajout de l'employé '{$e->nom} {$e->prenom}' (Matricule: {$e->matricule})", $e);

        return redirect()->back()->with('success', "Employé '{$e->nom} {$e->prenom}' ajouté avec succès.");
    }

    public function update(Request $request, Employe $employe)
    {
        $validated = $request->validate([
            'matricule' => 'required|string|max:255|unique:employes,matricule,' . $employe->id,
            'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'fonction' => 'nullable|string|max:255',
            'service_id' => 'required|exists:services,id',
        ], [
            'matricule.unique' => 'Ce matricule est déjà attribué à un autre employé.',
            'matricule.required' => 'Le matricule est obligatoire.',
            'nom.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'service_id.required' => 'Veuillez sélectionner un service de rattachement.',
        ]);

        $employe->update($validated);

        AuditLog::record('Modification', 'Employés', "Modification de la fiche employé '{$employe->nom} {$employe->prenom}' (Matricule: {$employe->matricule})", $employe);

        return redirect()->back()->with('success', "Fiche employé mise à jour avec succès.");
    }

    public function destroy(Employe $employe)
    {
        if ($employe->affectations()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cet employé a des affectations de matériel.',
            ]);
        }

        if (\App\Models\User::where('employe_id', $employe->id)->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : cet employé est lié à un compte utilisateur système.',
            ]);
        }

        $desc = "Suppression de l'employé '{$employe->nom} {$employe->prenom}' (Matricule: {$employe->matricule})";
        $employe->delete();

        AuditLog::record('Suppression', 'Employés', $desc);

        return redirect()->back()->with('success', 'Employé supprimé avec succès.');
    }
}