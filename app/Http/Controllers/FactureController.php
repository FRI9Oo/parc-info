<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AuditLog;
use App\Models\Facture;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FactureController extends Controller
{
    public function index()
    {
        $factures = Facture::with('achat.fournisseur')
            ->orderByDesc('date_facture')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Factures/Index', [
            'factures' => $factures,
            'achats' => Achat::with('fournisseur')->orderBy('numero_achat')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_facture' => 'required|string|max:100|unique:factures,numero_facture',
            'date_facture' => 'required|date',
            'montant_ht' => 'required|numeric|min:0',
            'taux_tva' => 'required|integer|min:0|max:100',
            'achat_id' => 'required|exists:achats,id',
        ], [
            'numero_facture.unique' => 'Ce numéro de facture existe déjà.',
            'numero_facture.required' => 'Le numéro de facture est obligatoire.',
            'achat_id.required' => 'Veuillez associer un achat/marché.',
        ]);

        $montantHt = floatval($validated['montant_ht']);
        $tauxTva = intval($validated['taux_tva']);
        $validated['montant_ttc'] = round($montantHt * (1 + ($tauxTva / 100)), 2);

        $facture = Facture::create($validated);
        $facture->load('achat');

        AuditLog::record(
            'Création',
            'Factures',
            "Enregistrement de la facture '{$facture->numero_facture}' pour le marché '{$facture->achat->numero_achat}' (Montant TTC: {$facture->montant_ttc} DH)",
            $facture
        );

        return redirect()->back()->with('success', 'Facture enregistrée avec succès.');
    }

    public function update(Request $request, Facture $facture)
    {
        $validated = $request->validate([
            'numero_facture' => 'required|string|max:100|unique:factures,numero_facture,' . $facture->id,
            'date_facture' => 'required|date',
            'montant_ht' => 'required|numeric|min:0',
            'taux_tva' => 'required|integer|min:0|max:100',
            'achat_id' => 'required|exists:achats,id',
        ], [
            'numero_facture.unique' => 'Ce numéro de facture existe déjà.',
            'numero_facture.required' => 'Le numéro de facture est obligatoire.',
        ]);

        $montantHt = floatval($validated['montant_ht']);
        $tauxTva = intval($validated['taux_tva']);
        $validated['montant_ttc'] = round($montantHt * (1 + ($tauxTva / 100)), 2);

        $facture->update($validated);

        AuditLog::record(
            'Modification',
            'Factures',
            "Mise à jour de la facture '{$facture->numero_facture}'",
            $facture
        );

        return redirect()->back()->with('success', 'Facture mise à jour avec succès.');
    }

    public function destroy(Facture $facture)
    {
        $numero = $facture->numero_facture;
        $facture->delete();

        AuditLog::record('Suppression', 'Factures', "Suppression de la facture '{$numero}'");

        return redirect()->back()->with('success', 'Facture supprimée avec succès.');
    }
}
