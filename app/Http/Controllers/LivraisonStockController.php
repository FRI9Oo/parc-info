<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AuditLog;
use App\Models\BordereauMateriel;
use App\Models\LivraisonStock;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LivraisonStockController extends Controller
{
    public function index()
    {
        $livraisons = LivraisonStock::with([
            'bordereau.achat.fournisseur',
            'bordereau.categorie',
            'bordereau.modele.marque',
            'materiels',
        ])
        ->orderByDesc('date_livraison')
        ->orderByDesc('id')
        ->get();

        $bordereaux = BordereauMateriel::with(['achat.fournisseur', 'categorie', 'modele.marque', 'livraisons'])
            ->orderByDesc('id')
            ->get();

        $achats = Achat::with('fournisseur')->orderBy('numero_achat')->get();

        return Inertia::render('Livraisons/Index', [
            'livraisons' => $livraisons,
            'bordereaux' => $bordereaux,
            'achats' => $achats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bordereau_materiel_id' => 'required|exists:bordereau_materiels,id',
            'reference_livraison' => 'required|string|max:100',
            'date_livraison' => 'required|date',
            'quantite_livraison' => 'required|integer|min:1',
            'auto_generate_materiels' => 'nullable|boolean',
            'prefix_inventaire' => 'nullable|string|max:20',
        ], [
            'reference_livraison.required' => 'Le numéro/référence du bon de livraison (BL) est obligatoire.',
            'quantite_livraison.required' => 'La quantité livrée est obligatoire.',
            'bordereau_materiel_id.required' => 'Veuillez sélectionner la ligne de commande.',
        ]);

        $bordereau = BordereauMateriel::with(['achat.bordereaux.livraisons', 'categorie', 'modele.marque', 'livraisons'])->findOrFail($validated['bordereau_materiel_id']);

        $dejaLivre = $bordereau->livraisons->sum('quantite_livraison');
        $resteALivrer = max(0, $bordereau->quantite_materiel - $dejaLivre);

        if ($validated['quantite_livraison'] > $resteALivrer) {
            return redirect()->back()->withErrors([
                'quantite_livraison' => "La quantité livrée ({$validated['quantite_livraison']}) dépasse la quantité restante à livrer ({$resteALivrer}) pour cette ligne de commande.",
            ]);
        }

        $livraison = LivraisonStock::create([
            'bordereau_materiel_id' => $bordereau->id,
            'reference_livraison' => $validated['reference_livraison'],
            'date_livraison' => $validated['date_livraison'],
            'quantite_livraison' => $validated['quantite_livraison'],
        ]);

        // Automatically adjust the parent Achat status if applicable
        if ($bordereau->achat) {
            $achat = $bordereau->achat;
            $achat->load('bordereaux.livraisons');
            $totalCommandee = $achat->bordereaux->sum('quantite_materiel');
            $totalLivree = $achat->bordereaux->sum(fn($b) => $b->livraisons->sum('quantite_livraison'));

            if ($totalLivree >= $totalCommandee && $totalCommandee > 0) {
                $achat->update(['statut' => 'Soldé']);
            } elseif ($totalLivree > 0 && $achat->statut === 'En cours') {
                $achat->update(['statut' => 'Livré partiellement']);
            }
        }

        // Auto-generate inventory assets (Materiels / Immobilisations) if requested
        if (!empty($validated['auto_generate_materiels'])) {
            $prefix = !empty($validated['prefix_inventaire']) ? trim($validated['prefix_inventaire']) : 'INV';
            $qty = intval($validated['quantite_livraison']);
            $nom = $bordereau->nom_materiel;
            $marque = $bordereau->modele?->marque?->nom_marque ?? '';
            $modele = $bordereau->modele?->nom_modele ?? '';

            for ($i = 1; $i <= $qty; $i++) {
                $uniqueSuffix = strtoupper(substr(uniqid(), -5)) . '-' . $i;
                $serial = 'SN-' . date('Y') . '-' . $uniqueSuffix;
                $inv = $prefix . '-' . date('y') . '-' . str_pad(rand(1000, 99999), 5, '0', STR_PAD_LEFT);

                Materiel::create([
                    'nom' => $nom,
                    'marque' => $marque,
                    'modele' => $modele,
                    'numero_serie' => $serial,
                    'numero_inventaire' => $inv,
                    'caracteristique' => $bordereau->caracteristiques,
                    'categorie_id' => $bordereau->categorie_id,
                    'achat_id' => $bordereau->achat_id,
                    'livraison_stock_id' => $livraison->id,
                    'modele_id' => $bordereau->modele_id,
                    'marque_id' => $bordereau->modele?->marque_id,
                ]);
            }
        }

        AuditLog::record(
            'Création',
            'Livraisons',
            "Réception de stock BL '{$livraison->reference_livraison}' ({$livraison->quantite_livraison} unité(s) de {$bordereau->nom_materiel}) pour l'achat '{$bordereau->achat->numero_achat}'",
            $livraison
        );

        return redirect()->back()->with('success', 'Livraison et réception de stock enregistrées avec succès.');
    }

    public function destroy(LivraisonStock $livraison)
    {
        $ref = $livraison->reference_livraison;
        $livraison->delete();

        AuditLog::record('Suppression', 'Livraisons', "Suppression du bon de livraison '{$ref}'");

        return redirect()->back()->with('success', 'Bon de livraison supprimé avec succès.');
    }
}
