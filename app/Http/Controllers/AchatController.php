<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AuditLog;
use App\Models\Categorie;
use App\Models\Fournisseur;
use App\Models\Marque;
use App\Models\Modele;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AchatController extends Controller
{
    public function index()
    {
        $achats = Achat::with(['fournisseur', 'bordereaux.livraisons.materiels.affectations', 'factures'])
            ->orderByDesc('date_achat')
            ->orderByDesc('id')
            ->get()
            ->map(function ($achat) {
                $totalHt = $achat->bordereaux->sum(fn($b) => $b->prix_unitaire_ht * $b->quantite_materiel);
                $totalLignes = $achat->bordereaux->count();
                $totalQuantite = $achat->bordereaux->sum('quantite_materiel');
                $totalLivree = $achat->bordereaux->sum(fn($b) => $b->livraisons->sum('quantite_livraison'));
                $totalFacturesTtc = $achat->factures->sum('montant_ttc');

                $allMateriels = $achat->bordereaux->flatMap(fn($b) => $b->livraisons->flatMap(fn($l) => $l->materiels));
                $totalAffectee = $allMateriels->filter(fn($m) => $m->affectations->whereNull('date_restitution')->isNotEmpty())->count();
                $canBeValide = ($totalQuantite > 0 && $totalLivree >= $totalQuantite && $totalAffectee >= $totalQuantite);

                return array_merge($achat->toArray(), [
                    'total_ht' => $totalHt,
                    'total_lignes' => $totalLignes,
                    'total_quantite' => $totalQuantite,
                    'total_livree' => $totalLivree,
                    'total_affectee' => $totalAffectee,
                    'can_be_valide' => $canBeValide,
                    'total_factures_ttc' => $totalFacturesTtc,
                ]);
            });

        return Inertia::render('Achats/Index', [
            'achats' => $achats,
            'fournisseurs' => Fournisseur::orderBy('nom_fournisseur')->get(),
        ]);
    }

    public function show(Achat $achat)
    {
        $achat->load([
            'fournisseur',
            'bordereaux.categorie',
            'bordereaux.modele.marque',
            'bordereaux.livraisons.materiels.affectations.employe',
            'factures',
        ]);

        $totalQuantite = $achat->bordereaux->sum('quantite_materiel');
        $totalLivree = $achat->bordereaux->sum(fn($b) => $b->livraisons->sum('quantite_livraison'));
        $allMateriels = $achat->bordereaux->flatMap(fn($b) => $b->livraisons->flatMap(fn($l) => $l->materiels));
        $totalAffectee = $allMateriels->filter(fn($m) => $m->affectations->whereNull('date_restitution')->isNotEmpty())->count();
        $canBeValide = ($totalQuantite > 0 && $totalLivree >= $totalQuantite && $totalAffectee >= $totalQuantite);

        $achatData = array_merge($achat->toArray(), [
            'total_quantite' => $totalQuantite,
            'total_livree' => $totalLivree,
            'total_affectee' => $totalAffectee,
            'can_be_valide' => $canBeValide,
        ]);

        return Inertia::render('Achats/Show', [
            'achat' => $achatData,
            'categories' => Categorie::orderBy('nom_categorie')->get(),
            'marques' => Marque::with('modeles')->orderBy('nom_marque')->get(),
            'modeles' => Modele::with('marque')->orderBy('nom_modele')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'objet_achat' => 'required|string|max:255',
            'numero_achat' => 'required|string|max:100|unique:achats,numero_achat',
            'type_achat' => 'required|string|max:100',
            'date_achat' => 'required|date',
            'statut' => 'required|string|max:50',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
        ], [
            'numero_achat.unique' => 'Ce numéro d\'achat/marché existe déjà.',
            'numero_achat.required' => 'Le numéro d\'achat est obligatoire.',
            'objet_achat.required' => 'L\'objet de l\'achat est obligatoire.',
            'fournisseur_id.required' => 'Veuillez sélectionner un fournisseur.',
        ]);

        if ($validated['statut'] === 'Validé') {
            return redirect()->back()->withErrors([
                'statut' => "Un achat ne peut pas être initialisé avec le statut 'Validé'. Il doit d'abord être réceptionné et tous ses matériels affectés aux collaborateurs.",
            ]);
        }

        $achat = Achat::create($validated);
        $achat->load('fournisseur');

        AuditLog::record(
            'Création',
            'Achats',
            "Création de l'achat/marché '{$achat->numero_achat}' - '{$achat->objet_achat}' (Fournisseur: {$achat->fournisseur->nom_fournisseur})",
            $achat
        );

        return redirect()->route('achats.show', $achat->id)->with('success', 'Achat/Marché créé avec succès.');
    }

    public function update(Request $request, Achat $achat)
    {
        $validated = $request->validate([
            'objet_achat' => 'required|string|max:255',
            'numero_achat' => 'required|string|max:100|unique:achats,numero_achat,' . $achat->id,
            'type_achat' => 'required|string|max:100',
            'date_achat' => 'required|date',
            'statut' => 'required|string|max:50',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
        ], [
            'numero_achat.unique' => 'Ce numéro d\'achat/marché existe déjà.',
            'numero_achat.required' => 'Le numéro d\'achat est obligatoire.',
            'objet_achat.required' => 'L\'objet de l\'achat est obligatoire.',
            'fournisseur_id.required' => 'Veuillez sélectionner un fournisseur.',
        ]);

        // Strict Business Logic: An Achat cannot become 'Validé' until ALL materials are delivered & assigned to employees
        if ($validated['statut'] === 'Validé') {
            $achat->load(['bordereaux.livraisons.materiels.affectations']);

            $totalCommandee = $achat->bordereaux->sum('quantite_materiel');
            if ($totalCommandee === 0) {
                return redirect()->back()->withErrors([
                    'statut' => "Impossible de valider cet achat : aucune ligne de matériel n'est encore définie dans le bordereau.",
                ]);
            }

            $totalLivree = $achat->bordereaux->sum(fn($b) => $b->livraisons->sum('quantite_livraison'));
            if ($totalLivree < $totalCommandee) {
                $reste = $totalCommandee - $totalLivree;
                return redirect()->back()->withErrors([
                    'statut' => "Impossible de valider cet achat : la livraison est incomplète ({$totalLivree} / {$totalCommandee} livrés, {$reste} restant(s)). Tous les matériels doivent être réceptionnés.",
                ]);
            }

            $allMateriels = $achat->bordereaux->flatMap(fn($b) => $b->livraisons->flatMap(fn($l) => $l->materiels));
            if ($allMateriels->count() < $totalCommandee) {
                $manquants = $totalCommandee - $allMateriels->count();
                return redirect()->back()->withErrors([
                    'statut' => "Impossible de valider cet achat : {$manquants} matériel(s) n'ont pas encore été enregistrés en inventaire physique.",
                ]);
            }

            $assignedCount = $allMateriels->filter(function ($m) {
                return $m->affectations->whereNull('date_restitution')->isNotEmpty();
            })->count();

            if ($assignedCount < $totalCommandee) {
                $nonAffectes = $totalCommandee - $assignedCount;
                return redirect()->back()->withErrors([
                    'statut' => "Impossible de valider cet achat : tous les matériels doivent être affectés aux collaborateurs ({$assignedCount} / {$totalCommandee} affectés, {$nonAffectes} restant(s) à affecter).",
                ]);
            }
        }

        $achat->update($validated);

        AuditLog::record(
            'Modification',
            'Achats',
            "Mise à jour de l'achat/marché '{$achat->numero_achat}' (Statut: {$achat->statut})",
            $achat
        );

        return redirect()->back()->with('success', 'Achat mis à jour avec succès.');
    }

    public function destroy(Achat $achat)
    {
        if ($achat->bordereaux()->whereHas('livraisons')->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer cet achat : des réceptions de stock (bons de livraison) y sont déjà associées. Veuillez d\'abord supprimer les livraisons correspondantes.',
            ]);
        }

        $numero = $achat->numero_achat;
        $achat->delete();

        AuditLog::record('Suppression', 'Achats', "Suppression de l'achat/marché '{$numero}'");

        return redirect()->route('achats.index')->with('success', 'Achat/Marché supprimé avec succès.');
    }
}
