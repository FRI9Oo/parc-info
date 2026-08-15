<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AuditLog;
use App\Models\BordereauMateriel;
use Illuminate\Http\Request;

class BordereauMaterielController extends Controller
{
    public function store(Request $request, Achat $achat)
    {
        $validated = $request->validate([
            'nom_materiel' => 'required|string|max:255',
            'caracteristiques' => 'nullable|string',
            'quantite_materiel' => 'required|integer|min:1',
            'garantie_materiel' => 'required|integer|min:0',
            'prix_unitaire_ht' => 'required|numeric|min:0',
            'categorie_id' => 'nullable|exists:categories,id',
            'modele_id' => 'nullable|exists:modeles,id',
        ], [
            'nom_materiel.required' => 'La désignation du matériel est obligatoire.',
            'quantite_materiel.required' => 'La quantité commandée est obligatoire.',
            'prix_unitaire_ht.required' => 'Le prix unitaire HT est obligatoire.',
        ]);

        $validated['achat_id'] = $achat->id;
        $bordereau = BordereauMateriel::create($validated);

        AuditLog::record(
            'Création',
            'Bordereaux',
            "Ajout de la ligne bordereau '{$bordereau->nom_materiel}' (Qté: {$bordereau->quantite_materiel}) dans l'achat '{$achat->numero_achat}'",
            $bordereau
        );

        return redirect()->back()->with('success', 'Ligne bordereau ajoutée avec succès.');
    }

    public function update(Request $request, BordereauMateriel $bordereau)
    {
        $validated = $request->validate([
            'nom_materiel' => 'required|string|max:255',
            'caracteristiques' => 'nullable|string',
            'quantite_materiel' => 'required|integer|min:1',
            'garantie_materiel' => 'required|integer|min:0',
            'prix_unitaire_ht' => 'required|numeric|min:0',
            'categorie_id' => 'nullable|exists:categories,id',
            'modele_id' => 'nullable|exists:modeles,id',
        ]);

        $dejaLivre = $bordereau->livraisons()->sum('quantite_livraison');
        if ($validated['quantite_materiel'] < $dejaLivre) {
            return redirect()->back()->withErrors([
                'quantite_materiel' => "La quantité commandée ({$validated['quantite_materiel']}) ne peut pas être inférieure à la quantité déjà livrée ({$dejaLivre}) pour cette ligne.",
            ]);
        }

        $bordereau->update($validated);

        AuditLog::record(
            'Modification',
            'Bordereaux',
            "Mise à jour de la ligne bordereau '{$bordereau->nom_materiel}'",
            $bordereau
        );

        return redirect()->back()->with('success', 'Ligne bordereau mise à jour avec succès.');
    }

    public function destroy(BordereauMateriel $bordereau)
    {
        if ($bordereau->livraisons()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer cette ligne car des réceptions/livraisons de stock y sont déjà attachées.',
            ]);
        }

        $nom = $bordereau->nom_materiel;
        $bordereau->delete();

        AuditLog::record('Suppression', 'Bordereaux', "Suppression de la ligne '{$nom}'");

        return redirect()->back()->with('success', 'Ligne bordereau supprimée avec succès.');
    }
}
