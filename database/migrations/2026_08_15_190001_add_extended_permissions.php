<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $newPermissions = [
            // 📋 Affectations - Clôture
            [
                'nom_permission' => 'cloturer_affectation',
                'module' => 'Affectations',
                'libelle' => 'Clôturer & Restituer une affectation',
                'description_permission' => 'Enregistrer la restitution d\'un matériel et sa remise en stock',
            ],
            // 💻 Matériels - Importation
            [
                'nom_permission' => 'importer_materiels',
                'module' => 'Matériels',
                'libelle' => 'Importer en masse (Excel / CSV)',
                'description_permission' => 'Téléverser des fichiers de données pour insertion massive d\'équipements',
            ],
            // 🛒 Achats - Validation & Clôture
            [
                'nom_permission' => 'valider_achat',
                'module' => 'Achats & Marchés',
                'libelle' => 'Valider & Clôturer un Marché',
                'description_permission' => 'Passer le statut d\'un achat à Validé une fois 100% des livraisons et affectations terminées',
            ],
            // 📥 Exports & Rapports
            [
                'nom_permission' => 'exporter_donnees',
                'module' => 'Exports & Rapports',
                'libelle' => 'Exporter les données (CSV / Excel)',
                'description_permission' => 'Télécharger les exports CSV des matériels, affectations, employés et achats',
            ],
            // 👤 Utilisateurs & Accès
            [
                'nom_permission' => 'gerer_utilisateurs',
                'module' => 'Utilisateurs & Accès',
                'libelle' => 'Gérer les comptes utilisateurs',
                'description_permission' => 'Créer, modifier, réinitialiser mots de passe et bloquer des comptes',
            ],
            [
                'nom_permission' => 'voir_utilisateurs',
                'module' => 'Utilisateurs & Accès',
                'libelle' => 'Consulter les utilisateurs',
                'description_permission' => 'Afficher la liste des comptes utilisateurs et leurs rôles',
            ],
            // 🛡️ Rôles & Permissions
            [
                'nom_permission' => 'gerer_roles',
                'module' => 'Rôles & Permissions',
                'libelle' => 'Gérer les rôles et permissions',
                'description_permission' => 'Créer des rôles et configurer la matrice des permissions RBAC',
            ],
            [
                'nom_permission' => 'voir_roles',
                'module' => 'Rôles & Permissions',
                'libelle' => 'Consulter les rôles système',
                'description_permission' => 'Afficher la liste des rôles et les permissions associées',
            ],
        ];

        $adminRole = Role::where('nom_role', 'Administrateur')->first();
        $managerRole = Role::where('nom_role', 'Gestionnaire SI')->first();
        $viewerRole = Role::where('nom_role', 'Consultant')->first();

        foreach ($newPermissions as $pData) {
            $perm = Permission::firstOrCreate(
                ['nom_permission' => $pData['nom_permission']],
                $pData
            );

            if ($adminRole && !$adminRole->permissions()->where('permission_id', $perm->id)->exists()) {
                $adminRole->permissions()->attach($perm->id);
            }

            if ($managerRole && in_array($perm->module, ['Affectations', 'Matériels', 'Achats & Marchés', 'Exports & Rapports'])) {
                if (!$managerRole->permissions()->where('permission_id', $perm->id)->exists()) {
                    $managerRole->permissions()->attach($perm->id);
                }
            }

            if ($viewerRole && str_starts_with($perm->nom_permission, 'voir_')) {
                if (!$viewerRole->permissions()->where('permission_id', $perm->id)->exists()) {
                    $viewerRole->permissions()->attach($perm->id);
                }
            }
        }
    }

    public function down(): void
    {
        Permission::whereIn('nom_permission', [
            'cloturer_affectation',
            'importer_materiels',
            'valider_achat',
            'exporter_donnees',
            'gerer_utilisateurs',
            'voir_utilisateurs',
            'gerer_roles',
            'voir_roles',
        ])->delete();
    }
};
