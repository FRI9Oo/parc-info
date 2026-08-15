<?php

namespace Database\Seeders;

use App\Models\AffectationMateriel;
use App\Models\Categorie;
use App\Models\Departement;
use App\Models\Direction;
use App\Models\Division;
use App\Models\Employe;
use App\Models\Materiel;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------------------------------
        // 1. Roles & Permissions
        // ----------------------------------------------------
        $adminRole = Role::create([
            'nom_role' => 'Administrateur',
            'description_role' => 'Accès complet au système de gestion du parc informatique',
        ]);

        $managerRole = Role::create([
            'nom_role' => 'Gestionnaire SI',
            'description_role' => 'Gestion des matériels, affectations et employés',
        ]);

        $viewerRole = Role::create([
            'nom_role' => 'Consultant',
            'description_role' => 'Consultation seule de l\'historique et des tableaux de bord',
        ]);

        $permissions = [
            // 📋 Affectations
            ['nom_permission' => 'gerer_affectations', 'module' => 'Affectations', 'libelle' => 'Gestion Complète des Affectations', 'description_permission' => 'Tout autoriser sur les affectations'],
            ['nom_permission' => 'voir_affectations', 'module' => 'Affectations', 'libelle' => 'Consulter les affectations', 'description_permission' => 'Afficher la liste et les détails des affectations'],
            ['nom_permission' => 'creer_affectation', 'module' => 'Affectations', 'libelle' => 'Affecter un matériel', 'description_permission' => 'Attribuer du matériel aux employés'],
            ['nom_permission' => 'modifier_affectation', 'module' => 'Affectations', 'libelle' => 'Modifier & Clôturer les affectations', 'description_permission' => 'Gérer les clôtures et réactivations'],
            ['nom_permission' => 'imprimer_affectation', 'module' => 'Affectations', 'libelle' => 'Imprimer la fiche d\'affectation', 'description_permission' => 'Générer et imprimer les fiches officielles'],

            // 💻 Matériels
            ['nom_permission' => 'gerer_materiels', 'module' => 'Matériels', 'libelle' => 'Gestion Complète du Parc', 'description_permission' => 'Tout autoriser sur les matériels et catégories'],
            ['nom_permission' => 'voir_materiels', 'module' => 'Matériels', 'libelle' => 'Consulter le parc et catégories', 'description_permission' => 'Afficher l\'inventaire et la disponibilité'],
            ['nom_permission' => 'creer_materiel', 'module' => 'Matériels', 'libelle' => 'Ajouter équipements & catégories', 'description_permission' => 'Enregistrer de nouveaux équipements'],
            ['nom_permission' => 'modifier_materiel', 'module' => 'Matériels', 'libelle' => 'Modifier équipements & catégories', 'description_permission' => 'Éditer les caractéristiques'],
            ['nom_permission' => 'supprimer_materiel', 'module' => 'Matériels', 'libelle' => 'Supprimer des équipements', 'description_permission' => 'Retirer un matériel ou une catégorie'],

            // 👥 Employés
            ['nom_permission' => 'gerer_employes', 'module' => 'Employés', 'libelle' => 'Gestion Complète des Employés', 'description_permission' => 'Tout autoriser sur les fiches du personnel'],
            ['nom_permission' => 'voir_employes', 'module' => 'Employés', 'libelle' => 'Consulter l\'annuaire des employés', 'description_permission' => 'Afficher la liste des employés'],
            ['nom_permission' => 'creer_employe', 'module' => 'Employés', 'libelle' => 'Ajouter un employé', 'description_permission' => 'Créer de nouvelles fiches d\'employés'],
            ['nom_permission' => 'modifier_employe', 'module' => 'Employés', 'libelle' => 'Modifier un employé', 'description_permission' => 'Éditer le profil et l\'affectation de service'],
            ['nom_permission' => 'supprimer_employe', 'module' => 'Employés', 'libelle' => 'Supprimer un employé', 'description_permission' => 'Retirer un employé de la base'],

            // 🏛️ Structure - Global & Per-Layer
            ['nom_permission' => 'gerer_structure', 'module' => 'Structure (Global)', 'libelle' => 'Gestion Complète de la Structure', 'description_permission' => 'Tout autoriser sur toutes les entités de la structure administrative'],
            ['nom_permission' => 'voir_structure', 'module' => 'Structure (Global)', 'libelle' => 'Consulter l\'organigramme', 'description_permission' => 'Afficher Directions, Départements, Divisions et Services'],
            ['nom_permission' => 'modifier_structure', 'module' => 'Structure (Global)', 'libelle' => 'Créer & Modifier la structure', 'description_permission' => 'Gérer toutes les entités administratives'],
            ['nom_permission' => 'supprimer_structure', 'module' => 'Structure (Global)', 'libelle' => 'Supprimer des entités', 'description_permission' => 'Supprimer n\'importe quel élément de l\'organigramme'],

            // 🏢 Layer: Directions
            ['nom_permission' => 'gerer_directions', 'module' => 'Directions', 'libelle' => 'Gestion Complète des Directions', 'description_permission' => 'Tout autoriser sur les directions'],
            ['nom_permission' => 'voir_directions', 'module' => 'Directions', 'libelle' => 'Consulter les directions', 'description_permission' => 'Afficher la liste des directions'],
            ['nom_permission' => 'creer_direction', 'module' => 'Directions', 'libelle' => 'Ajouter une direction', 'description_permission' => 'Créer de nouvelles directions'],
            ['nom_permission' => 'modifier_direction', 'module' => 'Directions', 'libelle' => 'Modifier une direction', 'description_permission' => 'Éditer les noms de directions'],
            ['nom_permission' => 'supprimer_direction', 'module' => 'Directions', 'libelle' => 'Supprimer une direction', 'description_permission' => 'Supprimer des directions'],

            // 🏛️ Layer: Départements
            ['nom_permission' => 'gerer_departements', 'module' => 'Départements', 'libelle' => 'Gestion Complète des Départements', 'description_permission' => 'Tout autoriser sur les départements'],
            ['nom_permission' => 'voir_departements', 'module' => 'Départements', 'libelle' => 'Consulter les départements', 'description_permission' => 'Afficher la liste des départements'],
            ['nom_permission' => 'creer_departement', 'module' => 'Départements', 'libelle' => 'Ajouter un département', 'description_permission' => 'Créer de nouveaux départements'],
            ['nom_permission' => 'modifier_departement', 'module' => 'Départements', 'libelle' => 'Modifier un département', 'description_permission' => 'Éditer les départements'],
            ['nom_permission' => 'supprimer_departement', 'module' => 'Départements', 'libelle' => 'Supprimer un département', 'description_permission' => 'Supprimer des départements'],

            // 🏬 Layer: Divisions
            ['nom_permission' => 'gerer_divisions', 'module' => 'Divisions', 'libelle' => 'Gestion Complète des Divisions', 'description_permission' => 'Tout autoriser sur les divisions'],
            ['nom_permission' => 'voir_divisions', 'module' => 'Divisions', 'libelle' => 'Consulter les divisions', 'description_permission' => 'Afficher la liste des divisions'],
            ['nom_permission' => 'creer_division', 'module' => 'Divisions', 'libelle' => 'Ajouter une division', 'description_permission' => 'Créer de nouvelles divisions'],
            ['nom_permission' => 'modifier_division', 'module' => 'Divisions', 'libelle' => 'Modifier une division', 'description_permission' => 'Éditer les divisions'],
            ['nom_permission' => 'supprimer_division', 'module' => 'Divisions', 'libelle' => 'Supprimer une division', 'description_permission' => 'Supprimer des divisions'],

            // 🛠️ Layer: Services
            ['nom_permission' => 'gerer_services', 'module' => 'Services', 'libelle' => 'Gestion Complète des Services', 'description_permission' => 'Tout autoriser sur les services'],
            ['nom_permission' => 'voir_services', 'module' => 'Services', 'libelle' => 'Consulter les services', 'description_permission' => 'Afficher la liste des services'],
            ['nom_permission' => 'creer_service', 'module' => 'Services', 'libelle' => 'Ajouter un service', 'description_permission' => 'Créer de nouveaux services'],
            ['nom_permission' => 'modifier_service', 'module' => 'Services', 'libelle' => 'Modifier un service', 'description_permission' => 'Éditer les services'],
            ['nom_permission' => 'supprimer_service', 'module' => 'Services', 'libelle' => 'Supprimer un service', 'description_permission' => 'Supprimer des services'],

            // 📜 Journal d'Audit
            ['nom_permission' => 'voir_audit_logs', 'module' => 'Journal d\'Audit', 'libelle' => 'Consulter le journal d\'audit', 'description_permission' => 'Afficher l\'historique détaillé des actions système'],
        ];

        foreach ($permissions as $pData) {
            $perm = Permission::create($pData);
            $adminRole->permissions()->attach($perm->id);

            // Assign Manager permissions
            if (in_array($perm->module, ['Affectations', 'Matériels', 'Employés'])) {
                $managerRole->permissions()->attach($perm->id);
            }

            // Assign Viewer permissions
            if (str_starts_with($perm->nom_permission, 'voir_')) {
                $viewerRole->permissions()->attach($perm->id);
            }
        }

        // ----------------------------------------------------
        // 2. Échelle Administrative
        // ----------------------------------------------------
        $dirSI = Direction::create(['nom_direction' => 'Direction SI et transformation digitale']);
        $dirRH = Direction::create(['nom_direction' => 'Direction des Ressources Humaines']);

        $depInfra = Departement::create([
            'nom_departement' => 'Service Infrastructure et supervision SI',
            'direction_id' => $dirSI->id,
        ]);
        $depDev = Departement::create([
            'nom_departement' => 'Développement & Projets Métiers',
            'direction_id' => $dirSI->id,
        ]);
        $depAdminRH = Departement::create([
            'nom_departement' => 'Gestion du Personnel & Paie',
            'direction_id' => $dirRH->id,
        ]);

        $divReseau = Division::create([
            'nom_division' => 'Division Réseaux & Sécurité',
            'departement_id' => $depInfra->id,
        ]);
        $divSys = Division::create([
            'nom_division' => 'Division Systems & Support',
            'departement_id' => $depInfra->id,
        ]);
        $divRH = Division::create([
            'nom_division' => 'Division Administration RH',
            'departement_id' => $depAdminRH->id,
        ]);

        $srvSupport = Service::create([
            'nom_service' => 'Service Infrastructure et supervision SI',
            'division_id' => $divSys->id,
        ]);
        $srvNet = Service::create([
            'nom_service' => 'Service Réseaux & Télécoms',
            'division_id' => $divReseau->id,
        ]);
        $srvPaie = Service::create([
            'nom_service' => 'Service Paie & Avantages',
            'division_id' => $divRH->id,
        ]);

        // ----------------------------------------------------
        // 3. Information des Personnelles (Employés)
        // ----------------------------------------------------
        $emp1 = Employe::create([
            'matricule' => 'M1001',
            'nom' => 'EL ALAMI',
            'prenom' => 'Youssef',
            'fonction' => 'Ingénieur Réseaux & Sécurité',
            'service_id' => $srvNet->id,
        ]);

        $emp2 = Employe::create([
            'matricule' => 'M1002',
            'nom' => 'BENALI',
            'prenom' => 'Amina',
            'fonction' => 'Administrateur Systèmes',
            'service_id' => $srvSupport->id,
        ]);

        $emp3 = Employe::create([
            'matricule' => 'M1003',
            'nom' => 'CHRAIBI',
            'prenom' => 'Karim',
            'fonction' => 'Technicien Support Helpdesk',
            'service_id' => $srvSupport->id,
        ]);

        $emp4 = Employe::create([
            'matricule' => 'M1004',
            'nom' => 'TAZI',
            'prenom' => 'Fatima-Zohra',
            'fonction' => 'Responsable Paie',
            'service_id' => $srvPaie->id,
        ]);

        $emp5 = Employe::create([
            'matricule' => 'M1005',
            'nom' => 'MANSOURI',
            'prenom' => 'Omar',
            'fonction' => 'Chef de Projet SI',
            'service_id' => $srvSupport->id,
        ]);

        // ----------------------------------------------------
        // 4. Catégories & Matériels
        // ----------------------------------------------------
        $catLaptop = Categorie::create(['nom_categorie' => 'PC Portable']);
        $catDesktop = Categorie::create(['nom_categorie' => 'PC Bureau']);
        $catMonitor = Categorie::create(['nom_categorie' => 'Écran / Moniteur']);
        $catPrinter = Categorie::create(['nom_categorie' => 'Imprimante / Multifonction']);

        $mat1 = Materiel::create([
            'nom' => 'Dell Latitude 5540',
            'marque' => 'Dell',
            'modele' => 'Latitude 5540',
            'numero_serie' => 'SN-DELL-88321',
            'numero_inventaire' => 'INV-2026-001',
            'caracteristique' => 'Intel Core i7-1365U, 16GB RAM, 512GB SSD NVMe',
            'categorie_id' => $catLaptop->id,
        ]);

        $mat2 = Materiel::create([
            'nom' => 'HP EliteBook 840 G10',
            'marque' => 'HP',
            'modele' => 'EliteBook 840 G10',
            'numero_serie' => 'SN-HP-99124',
            'numero_inventaire' => 'INV-2026-002',
            'caracteristique' => 'Intel Core i5-1345U, 16GB RAM, 512GB SSD',
            'categorie_id' => $catLaptop->id,
        ]);

        $mat3 = Materiel::create([
            'nom' => 'Lenovo ThinkPad T14 Gen 4',
            'marque' => 'Lenovo',
            'modele' => 'ThinkPad T14',
            'numero_serie' => 'SN-LNV-33410',
            'numero_inventaire' => 'INV-2026-003',
            'caracteristique' => 'AMD Ryzen 7 Pro, 32GB RAM, 1TB SSD',
            'categorie_id' => $catLaptop->id,
        ]);

        $mat4 = Materiel::create([
            'nom' => 'Dell UltraSharp 27" 4K',
            'marque' => 'Dell',
            'modele' => 'U2723QE',
            'numero_serie' => 'SN-MON-11029',
            'numero_inventaire' => 'INV-2026-004',
            'caracteristique' => '27 Pouces 4K IPS, USB-C Hub',
            'categorie_id' => $catMonitor->id,
        ]);

        $mat5 = Materiel::create([
            'nom' => 'HP LaserJet Pro M404dn',
            'marque' => 'HP',
            'modele' => 'LaserJet Pro M404dn',
            'numero_serie' => 'SN-PRN-55201',
            'numero_inventaire' => 'INV-2026-005',
            'caracteristique' => 'Imprimante Laser Monochrome Réseau',
            'categorie_id' => $catPrinter->id,
        ]);

        // ----------------------------------------------------
        // 5. Affectation Matériels (Actives & Clôturées)
        // ----------------------------------------------------
        // Affectation 1: Active
        AffectationMateriel::create([
            'employe_id' => $emp1->id,
            'materiel_id' => $mat1->id,
            'date_affectation' => '2026-01-15',
            'date_restitution' => null,
        ]);

        // Affectation 2: Active
        AffectationMateriel::create([
            'employe_id' => $emp2->id,
            'materiel_id' => $mat2->id,
            'date_affectation' => '2026-02-01',
            'date_restitution' => null,
        ]);

        // Affectation 3: Ancienne affectation clôturée (snapshot historique)
        AffectationMateriel::create([
            'employe_id' => $emp3->id,
            'materiel_id' => $mat3->id,
            'date_affectation' => '2025-06-01',
            'date_restitution' => '2026-03-31',
        ]);

        // Affectation 4: Réaffectation du matériel 3 à un autre employé après clôture
        AffectationMateriel::create([
            'employe_id' => $emp4->id,
            'materiel_id' => $mat3->id,
            'date_affectation' => '2026-04-01',
            'date_restitution' => null,
        ]);

        // Affectation 5: Active pour écran
        AffectationMateriel::create([
            'employe_id' => $emp5->id,
            'materiel_id' => $mat4->id,
            'date_affectation' => '2026-05-10',
            'date_restitution' => null,
        ]);

        // ----------------------------------------------------
        // 6. Utilisateurs Système
        // ----------------------------------------------------
        User::create([
            'name' => 'Administrateur SI',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'employe_id' => $emp1->id,
        ]);

        User::create([
            'name' => 'Gestionnaire Parc',
            'email' => 'gestionnaire@example.com',
            'password' => Hash::make('password'),
            'role_id' => $managerRole->id,
            'employe_id' => $emp2->id,
        ]);

        User::create([
            'name' => 'Consultant SI',
            'email' => 'consultant@example.com',
            'password' => Hash::make('password'),
            'role_id' => $viewerRole->id,
            'employe_id' => $emp3->id,
        ]);

        User::create([
            'name' => 'Employé Utilisateur',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role_id' => null,
            'employe_id' => $emp4->id,
        ]);
    }
}
