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
            ['nom_permission' => 'gerer_affectations', 'description_permission' => 'Créer, modifier, clôturer et imprimer les affectations'],
            ['nom_permission' => 'gerer_materiels', 'description_permission' => 'Ajouter, éditer et supprimer des équipements'],
            ['nom_permission' => 'gerer_employes', 'description_permission' => 'Gérer les fiches des employés'],
            ['nom_permission' => 'gerer_structure', 'description_permission' => 'Gérer la structure administrative (Directions, Services)'],
        ];

        foreach ($permissions as $pData) {
            $perm = Permission::create($pData);
            $adminRole->permissions()->attach($perm->id);
            if ($perm->nom_permission !== 'gerer_structure') {
                $managerRole->permissions()->attach($perm->id);
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
    }
}
