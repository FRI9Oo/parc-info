<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $newPermissions = [
            // 🏢 Fournisseurs
            ['nom_permission' => 'gerer_fournisseurs', 'module' => 'Fournisseurs', 'libelle' => 'Gestion Complète des Fournisseurs', 'description_permission' => 'Tout autoriser sur les fiches fournisseurs'],
            ['nom_permission' => 'voir_fournisseurs', 'module' => 'Fournisseurs', 'libelle' => 'Consulter les fournisseurs', 'description_permission' => 'Afficher l\'annuaire et les coordonnées des fournisseurs'],
            ['nom_permission' => 'creer_fournisseur', 'module' => 'Fournisseurs', 'libelle' => 'Ajouter un fournisseur', 'description_permission' => 'Créer de nouvelles fiches fournisseurs'],
            ['nom_permission' => 'modifier_fournisseur', 'module' => 'Fournisseurs', 'libelle' => 'Modifier un fournisseur', 'description_permission' => 'Éditer les informations d\'un fournisseur'],
            ['nom_permission' => 'supprimer_fournisseur', 'module' => 'Fournisseurs', 'libelle' => 'Supprimer un fournisseur', 'description_permission' => 'Supprimer un fournisseur de l\'annuaire'],

            // 🛒 Achats & Marchés
            ['nom_permission' => 'gerer_achats', 'module' => 'Achats & Marchés', 'libelle' => 'Gestion Complète des Achats', 'description_permission' => 'Tout autoriser sur les achats, marchés et bordereaux'],
            ['nom_permission' => 'voir_achats', 'module' => 'Achats & Marchés', 'libelle' => 'Consulter les achats & marchés', 'description_permission' => 'Afficher la liste et le détail des commandes et bordereaux'],
            ['nom_permission' => 'creer_achat', 'module' => 'Achats & Marchés', 'libelle' => 'Créer un achat / bordereau', 'description_permission' => 'Enregistrer de nouveaux marchés ou lignes de commande'],
            ['nom_permission' => 'modifier_achat', 'module' => 'Achats & Marchés', 'libelle' => 'Modifier un achat / bordereau', 'description_permission' => 'Éditer les statuts, montants et lignes de commande'],
            ['nom_permission' => 'supprimer_achat', 'module' => 'Achats & Marchés', 'libelle' => 'Supprimer un achat', 'description_permission' => 'Supprimer un achat ou une ligne de bordereau'],

            // 🧾 Factures
            ['nom_permission' => 'gerer_factures', 'module' => 'Factures', 'libelle' => 'Gestion Complète des Factures', 'description_permission' => 'Tout autoriser sur les factures fournisseurs'],
            ['nom_permission' => 'voir_factures', 'module' => 'Factures', 'libelle' => 'Consulter les factures', 'description_permission' => 'Afficher les factures et les détails comptables'],
            ['nom_permission' => 'creer_facture', 'module' => 'Factures', 'libelle' => 'Enregistrer une facture', 'description_permission' => 'Ajouter des factures rattachées aux achats'],
            ['nom_permission' => 'modifier_facture', 'module' => 'Factures', 'libelle' => 'Modifier une facture', 'description_permission' => 'Éditer les montants ou numéros de facture'],
            ['nom_permission' => 'supprimer_facture', 'module' => 'Factures', 'libelle' => 'Supprimer une facture', 'description_permission' => 'Supprimer une facture du système'],

            // 📦 Livraisons & Stocks
            ['nom_permission' => 'gerer_livraisons', 'module' => 'Livraisons & Stocks', 'libelle' => 'Gestion Complète des Livraisons', 'description_permission' => 'Tout autoriser sur les réceptions de stock'],
            ['nom_permission' => 'voir_livraisons', 'module' => 'Livraisons & Stocks', 'libelle' => 'Consulter les livraisons', 'description_permission' => 'Afficher les bons de livraison et réceptions'],
            ['nom_permission' => 'creer_livraison', 'module' => 'Livraisons & Stocks', 'libelle' => 'Enregistrer une livraison (BL)', 'description_permission' => 'Réceptionner du stock et générer des immobilisations'],
            ['nom_permission' => 'supprimer_livraison', 'module' => 'Livraisons & Stocks', 'libelle' => 'Supprimer une livraison', 'description_permission' => 'Supprimer un bon de livraison'],

            // 🏷️ Marques & Modèles
            ['nom_permission' => 'gerer_marques_modeles', 'module' => 'Marques & Modèles', 'libelle' => 'Gestion Complète Marques & Modèles', 'description_permission' => 'Tout autoriser sur le catalogue des marques et modèles'],
            ['nom_permission' => 'voir_marques_modeles', 'module' => 'Marques & Modèles', 'libelle' => 'Consulter le catalogue', 'description_permission' => 'Afficher les marques et modèles de matériels'],
            ['nom_permission' => 'creer_marque_modele', 'module' => 'Marques & Modèles', 'libelle' => 'Ajouter marque / modèle', 'description_permission' => 'Créer de nouvelles marques et modèles'],
            ['nom_permission' => 'modifier_marque_modele', 'module' => 'Marques & Modèles', 'libelle' => 'Modifier marque / modèle', 'description_permission' => 'Éditer les noms de marques et modèles'],
            ['nom_permission' => 'supprimer_marque_modele', 'module' => 'Marques & Modèles', 'libelle' => 'Supprimer marque / modèle', 'description_permission' => 'Supprimer des marques ou modèles'],
        ];

        $adminRole = Role::where('nom_role', 'Administrateur')->first();
        $managerRole = Role::where('nom_role', 'Gestionnaire SI')->first();
        $viewerRole = Role::where('nom_role', 'Consultant')->first();

        foreach ($newPermissions as $pData) {
            $perm = Permission::firstOrCreate(
                ['nom_permission' => $pData['nom_permission']],
                $pData
            );

            if ($adminRole && !$adminRole->permissions()->where('permissions.id', $perm->id)->exists()) {
                $adminRole->permissions()->attach($perm->id);
            }

            if ($managerRole && !$managerRole->permissions()->where('permissions.id', $perm->id)->exists()) {
                $managerRole->permissions()->attach($perm->id);
            }

            if ($viewerRole && str_starts_with($perm->nom_permission, 'voir_') && !$viewerRole->permissions()->where('permissions.id', $perm->id)->exists()) {
                $viewerRole->permissions()->attach($perm->id);
            }
        }
    }

    public function down(): void
    {
        $permissions = [
            'gerer_fournisseurs', 'voir_fournisseurs', 'creer_fournisseur', 'modifier_fournisseur', 'supprimer_fournisseur',
            'gerer_achats', 'voir_achats', 'creer_achat', 'modifier_achat', 'supprimer_achat',
            'gerer_factures', 'voir_factures', 'creer_facture', 'modifier_facture', 'supprimer_facture',
            'gerer_livraisons', 'voir_livraisons', 'creer_livraison', 'supprimer_livraison',
            'gerer_marques_modeles', 'voir_marques_modeles', 'creer_marque_modele', 'modifier_marque_modele', 'supprimer_marque_modele',
        ];

        Permission::whereIn('nom_permission', $permissions)->delete();
    }
};
