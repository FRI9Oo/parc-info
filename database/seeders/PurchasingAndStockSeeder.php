<?php

namespace Database\Seeders;

use App\Models\Achat;
use App\Models\AffectationMateriel;
use App\Models\BordereauMateriel;
use App\Models\Categorie;
use App\Models\Employe;
use App\Models\Facture;
use App\Models\Fournisseur;
use App\Models\LivraisonStock;
use App\Models\Marque;
use App\Models\Materiel;
use App\Models\Modele;
use Illuminate\Database\Seeder;

class PurchasingAndStockSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------------------------------
        // 1. Marques & Modèles
        // ----------------------------------------------------
        $marqueDell = Marque::firstOrCreate(['nom_marque' => 'Dell']);
        $marqueHp = Marque::firstOrCreate(['nom_marque' => 'HP']);
        $marqueLenovo = Marque::firstOrCreate(['nom_marque' => 'Lenovo']);
        $marqueApple = Marque::firstOrCreate(['nom_marque' => 'Apple']);
        $marqueCisco = Marque::firstOrCreate(['nom_marque' => 'Cisco']);
        $marqueLogitech = Marque::firstOrCreate(['nom_marque' => 'Logitech']);

        $modLatitude5540 = Modele::firstOrCreate(['nom_modele' => 'Latitude 5540', 'marque_id' => $marqueDell->id]);
        $modLatitude7440 = Modele::firstOrCreate(['nom_modele' => 'Latitude 7440 Ultrabook', 'marque_id' => $marqueDell->id]);
        $modOptiplex7010 = Modele::firstOrCreate(['nom_modele' => 'OptiPlex 7010 Micro', 'marque_id' => $marqueDell->id]);
        $modUltrasharp27 = Modele::firstOrCreate(['nom_modele' => 'UltraSharp U2723QE 4K', 'marque_id' => $marqueDell->id]);

        $modElitebook840 = Modele::firstOrCreate(['nom_modele' => 'EliteBook 840 G10', 'marque_id' => $marqueHp->id]);
        $modProdesk400 = Modele::firstOrCreate(['nom_modele' => 'ProDesk 400 G9', 'marque_id' => $marqueHp->id]);
        $modLaserjetM404 = Modele::firstOrCreate(['nom_modele' => 'LaserJet Pro M404dn', 'marque_id' => $marqueHp->id]);

        $modThinkpadT14 = Modele::firstOrCreate(['nom_modele' => 'ThinkPad T14 Gen 4', 'marque_id' => $marqueLenovo->id]);
        $modThinkpadX1 = Modele::firstOrCreate(['nom_modele' => 'ThinkPad X1 Carbon Gen 11', 'marque_id' => $marqueLenovo->id]);

        $modMacbookPro16 = Modele::firstOrCreate(['nom_modele' => 'MacBook Pro 16" M3 Max', 'marque_id' => $marqueApple->id]);
        $modCatalyst2960 = Modele::firstOrCreate(['nom_modele' => 'Catalyst 2960-X 24P PoE', 'marque_id' => $marqueCisco->id]);
        $modBrio4k = Modele::firstOrCreate(['nom_modele' => 'Brio 4K Ultra HD', 'marque_id' => $marqueLogitech->id]);

        // ----------------------------------------------------
        // 2. Fournisseurs
        // ----------------------------------------------------
        $fournDisway = Fournisseur::firstOrCreate(
            ['nom_fournisseur' => 'Disway Maroc SA'],
            [
                'adresse_fournisseur' => '142 Boulevard Zerktouni, Casablanca',
                'telephone_fournisseur' => '+212 522 95 60 00',
                'contact_personne' => 'M. Amine Benjelloun (Directeur Commercial)',
            ]
        );

        $fournDisty = Fournisseur::firstOrCreate(
            ['nom_fournisseur' => 'Disty Technologies'],
            [
                'adresse_fournisseur' => 'Sidi Maarouf, Parc d\'Activités, Casablanca',
                'telephone_fournisseur' => '+212 522 78 90 00',
                'contact_personne' => 'Mme Sara Kadiri (Key Account Manager)',
            ]
        );

        $fournOmnidata = Fournisseur::firstOrCreate(
            ['nom_fournisseur' => 'Omnidata Solutions SI'],
            [
                'adresse_fournisseur' => 'Avenue Allal Ben Abdellah, Rabat',
                'telephone_fournisseur' => '+212 537 77 45 12',
                'contact_personne' => 'M. Mehdi Tazi (Chef de Projet)',
            ]
        );

        $fournSybios = Fournisseur::firstOrCreate(
            ['nom_fournisseur' => 'Sybios Informatique & Réseaux'],
            [
                'adresse_fournisseur' => 'Zone Franche de Tanger, Tanger',
                'telephone_fournisseur' => '+212 539 32 10 44',
                'contact_personne' => 'M. Nabil Bennani (Responsable Ventes)',
            ]
        );

        // Fetch categories & employes
        $catLaptop = Categorie::firstOrCreate(['nom_categorie' => 'PC Portable']);
        $catDesktop = Categorie::firstOrCreate(['nom_categorie' => 'PC Bureau']);
        $catMonitor = Categorie::firstOrCreate(['nom_categorie' => 'Écran / Moniteur']);
        $catPrinter = Categorie::firstOrCreate(['nom_categorie' => 'Imprimante / Multifonction']);
        $catReseau = Categorie::firstOrCreate(['nom_categorie' => 'Équipements Réseaux & Télécoms']);
        $catAccessoire = Categorie::firstOrCreate(['nom_categorie' => 'Accessoires & Périphériques']);

        $employes = Employe::with('service.division.departement.direction')->get();
        $emp1 = $employes->get(0);
        $emp2 = $employes->get(1);
        $emp3 = $employes->get(2);
        $emp4 = $employes->get(3);
        $emp5 = $employes->get(4);

        // ------------------------------------------------------------------
        // DOSSIER ACHAT 1 : Marché M-2026/01 (100% Livré & 100% Affecté -> VALIDÉ)
        // ------------------------------------------------------------------
        $achat1 = Achat::firstOrCreate(
            ['numero_achat' => 'M-2026/01'],
            [
                'objet_achat' => 'Acquisition de stations de travail mobiles Dell et écrans haute définition',
                'type_achat' => 'Marché',
                'date_achat' => '2026-01-10',
                'statut' => 'En cours', // will transition to Validé after full delivery & assignment
                'fournisseur_id' => $fournDisway->id,
            ]
        );

        // Bordereau Ligne 1: 3 PC Portables Dell Latitude 5540
        $b1_1 = BordereauMateriel::firstOrCreate(
            ['achat_id' => $achat1->id, 'nom_materiel' => 'Dell Latitude 5540 Core i7'],
            [
                'caracteristiques' => 'Intel Core i7-1365U, 16GB RAM, 512GB SSD NVMe, Écran 15.6" FHD IPS',
                'quantite_materiel' => 3,
                'garantie_materiel' => 36,
                'prix_unitaire_ht' => 11500.00,
                'categorie_id' => $catLaptop->id,
                'modele_id' => $modLatitude5540->id,
            ]
        );

        // Bordereau Ligne 2: 2 Écrans Dell UltraSharp 27"
        $b1_2 = BordereauMateriel::firstOrCreate(
            ['achat_id' => $achat1->id, 'nom_materiel' => 'Écran Dell UltraSharp 27" 4K'],
            [
                'caracteristiques' => '27 Pouces 4K UHD IPS, USB-C 90W Power Delivery, RJ45 Hub',
                'quantite_materiel' => 2,
                'garantie_materiel' => 24,
                'prix_unitaire_ht' => 4200.00,
                'categorie_id' => $catMonitor->id,
                'modele_id' => $modUltrasharp27->id,
            ]
        );

        // Livraisons Stock BL pour Achat 1 (Livraison intégrale 3 + 2 = 5 unités)
        $liv1_1 = LivraisonStock::firstOrCreate(
            ['reference_livraison' => 'BL-DIS-2026-001'],
            [
                'bordereau_materiel_id' => $b1_1->id,
                'date_livraison' => '2026-01-20',
                'quantite_livraison' => 3,
            ]
        );

        $liv1_2 = LivraisonStock::firstOrCreate(
            ['reference_livraison' => 'BL-DIS-2026-002'],
            [
                'bordereau_materiel_id' => $b1_2->id,
                'date_livraison' => '2026-01-25',
                'quantite_livraison' => 2,
            ]
        );

        // Matériels générés & Immobilisations pour Achat 1
        $matA1_1 = Materiel::firstOrCreate(
            ['numero_serie' => 'SN-DELL-5540-01'],
            [
                'nom' => 'Dell Latitude 5540 Core i7',
                'marque' => 'Dell',
                'modele' => 'Latitude 5540',
                'numero_inventaire' => 'INV-26-1001',
                'caracteristique' => $b1_1->caracteristiques,
                'categorie_id' => $catLaptop->id,
                'livraison_stock_id' => $liv1_1->id,
                'modele_id' => $modLatitude5540->id,
                'marque_id' => $marqueDell->id,
            ]
        );

        $matA1_2 = Materiel::firstOrCreate(
            ['numero_serie' => 'SN-DELL-5540-02'],
            [
                'nom' => 'Dell Latitude 5540 Core i7',
                'marque' => 'Dell',
                'modele' => 'Latitude 5540',
                'numero_inventaire' => 'INV-26-1002',
                'caracteristique' => $b1_1->caracteristiques,
                'categorie_id' => $catLaptop->id,
                'livraison_stock_id' => $liv1_1->id,
                'modele_id' => $modLatitude5540->id,
                'marque_id' => $marqueDell->id,
            ]
        );

        $matA1_3 = Materiel::firstOrCreate(
            ['numero_serie' => 'SN-DELL-5540-03'],
            [
                'nom' => 'Dell Latitude 5540 Core i7',
                'marque' => 'Dell',
                'modele' => 'Latitude 5540',
                'numero_inventaire' => 'INV-26-1003',
                'caracteristique' => $b1_1->caracteristiques,
                'categorie_id' => $catLaptop->id,
                'livraison_stock_id' => $liv1_1->id,
                'modele_id' => $modLatitude5540->id,
                'marque_id' => $marqueDell->id,
            ]
        );

        $matA1_4 = Materiel::firstOrCreate(
            ['numero_serie' => 'SN-MON-U27-01'],
            [
                'nom' => 'Écran Dell UltraSharp 27" 4K',
                'marque' => 'Dell',
                'modele' => 'UltraSharp U2723QE 4K',
                'numero_inventaire' => 'INV-26-1004',
                'caracteristique' => $b1_2->caracteristiques,
                'categorie_id' => $catMonitor->id,
                'livraison_stock_id' => $liv1_2->id,
                'modele_id' => $modUltrasharp27->id,
                'marque_id' => $marqueDell->id,
            ]
        );

        $matA1_5 = Materiel::firstOrCreate(
            ['numero_serie' => 'SN-MON-U27-02'],
            [
                'nom' => 'Écran Dell UltraSharp 27" 4K',
                'marque' => 'Dell',
                'modele' => 'UltraSharp U2723QE 4K',
                'numero_inventaire' => 'INV-26-1005',
                'caracteristique' => $b1_2->caracteristiques,
                'categorie_id' => $catMonitor->id,
                'livraison_stock_id' => $liv1_2->id,
                'modele_id' => $modUltrasharp27->id,
                'marque_id' => $marqueDell->id,
            ]
        );

        // Affectations pour Achat 1 (Affecter tous les 5 matériels)
        if ($emp1) {
            AffectationMateriel::firstOrCreate(
                ['materiel_id' => $matA1_1->id, 'employe_id' => $emp1->id],
                [
                    'date_affectation' => '2026-02-01',
                    'date_restitution' => null,
                    'service_id' => $emp1->service_id,
                    'division_id' => $emp1->service?->division_id,
                    'departement_id' => $emp1->service?->division?->departement_id,
                    'direction_id' => $emp1->service?->division?->departement?->direction_id,
                ]
            );
            AffectationMateriel::firstOrCreate(
                ['materiel_id' => $matA1_4->id, 'employe_id' => $emp1->id],
                [
                    'date_affectation' => '2026-02-01',
                    'date_restitution' => null,
                    'service_id' => $emp1->service_id,
                    'division_id' => $emp1->service?->division_id,
                    'departement_id' => $emp1->service?->division?->departement_id,
                    'direction_id' => $emp1->service?->division?->departement?->direction_id,
                ]
            );
        }

        if ($emp2) {
            AffectationMateriel::firstOrCreate(
                ['materiel_id' => $matA1_2->id, 'employe_id' => $emp2->id],
                [
                    'date_affectation' => '2026-02-05',
                    'date_restitution' => null,
                    'service_id' => $emp2->service_id,
                    'division_id' => $emp2->service?->division_id,
                    'departement_id' => $emp2->service?->division?->departement_id,
                    'direction_id' => $emp2->service?->division?->departement?->direction_id,
                ]
            );
            AffectationMateriel::firstOrCreate(
                ['materiel_id' => $matA1_5->id, 'employe_id' => $emp2->id],
                [
                    'date_affectation' => '2026-02-05',
                    'date_restitution' => null,
                    'service_id' => $emp2->service_id,
                    'division_id' => $emp2->service?->division_id,
                    'departement_id' => $emp2->service?->division?->departement_id,
                    'direction_id' => $emp2->service?->division?->departement?->direction_id,
                ]
            );
        }

        if ($emp3) {
            AffectationMateriel::firstOrCreate(
                ['materiel_id' => $matA1_3->id, 'employe_id' => $emp3->id],
                [
                    'date_affectation' => '2026-02-10',
                    'date_restitution' => null,
                    'service_id' => $emp3->service_id,
                    'division_id' => $emp3->service?->division_id,
                    'departement_id' => $emp3->service?->division?->departement_id,
                    'direction_id' => $emp3->service?->division?->departement?->direction_id,
                ]
            );
        }

        // Factures pour Achat 1
        Facture::firstOrCreate(
            ['numero_facture' => 'FACT-DIS-2026-0911'],
            [
                'achat_id' => $achat1->id,
                'date_facture' => '2026-02-15',
                'montant_ht' => 42900.00,
                'taux_tva' => 20,
                'montant_ttc' => 51480.00,
            ]
        );

        // Achat 1 is 100% delivered and 100% assigned -> Can transition to Validé
        $achat1->update(['statut' => 'Validé']);

        // ------------------------------------------------------------------
        // DOSSIER ACHAT 2 : Marché M-2026/02 (Livré Partiellement)
        // ------------------------------------------------------------------
        $achat2 = Achat::firstOrCreate(
            ['numero_achat' => 'M-2026/02'],
            [
                'objet_achat' => 'Renouvellement du parc informatique portable HP EliteBook et imprimantes de réseau',
                'type_achat' => 'Marché',
                'date_achat' => '2026-03-05',
                'statut' => 'Livré partiellement',
                'fournisseur_id' => $fournDisty->id,
            ]
        );

        $b2_1 = BordereauMateriel::firstOrCreate(
            ['achat_id' => $achat2->id, 'nom_materiel' => 'HP EliteBook 840 G10 Core i5'],
            [
                'caracteristiques' => 'Intel Core i5-1345U, 16GB RAM, 512GB SSD, Clavier Rétroéclairé, Windows 11 Pro',
                'quantite_materiel' => 4,
                'garantie_materiel' => 36,
                'prix_unitaire_ht' => 12800.00,
                'categorie_id' => $catLaptop->id,
                'modele_id' => $modElitebook840->id,
            ]
        );

        $b2_2 = BordereauMateriel::firstOrCreate(
            ['achat_id' => $achat2->id, 'nom_materiel' => 'HP LaserJet Pro M404dn'],
            [
                'caracteristiques' => 'Imprimante Laser Monochrome 38 ppm, Recto-Verso Automatique, Gigabit Ethernet',
                'quantite_materiel' => 2,
                'garantie_materiel' => 12,
                'prix_unitaire_ht' => 3800.00,
                'categorie_id' => $catPrinter->id,
                'modele_id' => $modLaserjetM404->id,
            ]
        );

        // Livraisons partielles (2 sur 4 PC portables et 1 sur 2 imprimantes)
        $liv2_1 = LivraisonStock::firstOrCreate(
            ['reference_livraison' => 'BL-DST-2026-018'],
            [
                'bordereau_materiel_id' => $b2_1->id,
                'date_livraison' => '2026-03-20',
                'quantite_livraison' => 2,
            ]
        );

        $liv2_2 = LivraisonStock::firstOrCreate(
            ['reference_livraison' => 'BL-DST-2026-022'],
            [
                'bordereau_materiel_id' => $b2_2->id,
                'date_livraison' => '2026-03-25',
                'quantite_livraison' => 1,
            ]
        );

        // Matériels générés pour Achat 2
        $matA2_1 = Materiel::firstOrCreate(
            ['numero_serie' => 'SN-HP-840-01'],
            [
                'nom' => 'HP EliteBook 840 G10 Core i5',
                'marque' => 'HP',
                'modele' => 'EliteBook 840 G10',
                'numero_inventaire' => 'INV-26-2001',
                'caracteristique' => $b2_1->caracteristiques,
                'categorie_id' => $catLaptop->id,
                'livraison_stock_id' => $liv2_1->id,
                'modele_id' => $modElitebook840->id,
                'marque_id' => $marqueHp->id,
            ]
        );

        $matA2_2 = Materiel::firstOrCreate(
            ['numero_serie' => 'SN-HP-840-02'],
            [
                'nom' => 'HP EliteBook 840 G10 Core i5',
                'marque' => 'HP',
                'modele' => 'EliteBook 840 G10',
                'numero_inventaire' => 'INV-26-2002',
                'caracteristique' => $b2_1->caracteristiques,
                'categorie_id' => $catLaptop->id,
                'livraison_stock_id' => $liv2_1->id,
                'modele_id' => $modElitebook840->id,
                'marque_id' => $marqueHp->id,
            ]
        );

        $matA2_3 = Materiel::firstOrCreate(
            ['numero_serie' => 'SN-PRN-M404-01'],
            [
                'nom' => 'HP LaserJet Pro M404dn',
                'marque' => 'HP',
                'modele' => 'LaserJet Pro M404dn',
                'numero_inventaire' => 'INV-26-2003',
                'caracteristique' => $b2_2->caracteristiques,
                'categorie_id' => $catPrinter->id,
                'livraison_stock_id' => $liv2_2->id,
                'modele_id' => $modLaserjetM404->id,
                'marque_id' => $marqueHp->id,
            ]
        );

        // Affecter seulement un matériel sur les 3 livrés (les autres restent en stock)
        if ($emp4) {
            AffectationMateriel::firstOrCreate(
                ['materiel_id' => $matA2_1->id, 'employe_id' => $emp4->id],
                [
                    'date_affectation' => '2026-04-01',
                    'date_restitution' => null,
                    'service_id' => $emp4->service_id,
                    'division_id' => $emp4->service?->division_id,
                    'departement_id' => $emp4->service?->division?->departement_id,
                    'direction_id' => $emp4->service?->division?->departement?->direction_id,
                ]
            );
        }

        // Facture pour livraison partielle
        Facture::firstOrCreate(
            ['numero_facture' => 'FACT-DST-2026-044'],
            [
                'achat_id' => $achat2->id,
                'date_facture' => '2026-04-05',
                'montant_ht' => 29400.00,
                'taux_tva' => 20,
                'montant_ttc' => 35280.00,
            ]
        );

        // ------------------------------------------------------------------
        // DOSSIER ACHAT 3 : Bon de Commande BC-2026/08 (En cours)
        // ------------------------------------------------------------------
        $achat3 = Achat::firstOrCreate(
            ['numero_achat' => 'BC-2026/08'],
            [
                'objet_achat' => 'Équipements réseau d\'interconnexion Cisco et webcams de visioconférence 4K',
                'type_achat' => 'Bon de commande',
                'date_achat' => '2026-07-20',
                'statut' => 'En cours',
                'fournisseur_id' => $fournOmnidata->id,
            ]
        );

        BordereauMateriel::firstOrCreate(
            ['achat_id' => $achat3->id, 'nom_materiel' => 'Switch Cisco Catalyst 2960-X 24 Ports'],
            [
                'caracteristiques' => '24 Ports Gigabit Ethernet PoE+ 370W, 4 SFP 1G, Layer 2+',
                'quantite_materiel' => 2,
                'garantie_materiel' => 60,
                'prix_unitaire_ht' => 18500.00,
                'categorie_id' => $catReseau->id,
                'modele_id' => $modCatalyst2960->id,
            ]
        );

        BordereauMateriel::firstOrCreate(
            ['achat_id' => $achat3->id, 'nom_materiel' => 'Webcam Logitech Brio 4K Ultra HD'],
            [
                'caracteristiques' => 'Capteur 4K Ultra HD avec HDR, Reconnaissance faciale Windows Hello, Double micro stéréo',
                'quantite_materiel' => 6,
                'garantie_materiel' => 24,
                'prix_unitaire_ht' => 1950.00,
                'categorie_id' => $catAccessoire->id,
                'modele_id' => $modBrio4k->id,
            ]
        );

        Facture::firstOrCreate(
            ['numero_facture' => 'FACT-OMN-2026-102'],
            [
                'achat_id' => $achat3->id,
                'date_facture' => '2026-07-25',
                'montant_ht' => 14610.00,
                'taux_tva' => 20,
                'montant_ttc' => 17532.00,
            ]
        );

        // ------------------------------------------------------------------
        // DOSSIER ACHAT 4 : Consultation C-2026/03 (Ordinateurs ThinkPad & Apple)
        // ------------------------------------------------------------------
        $achat4 = Achat::firstOrCreate(
            ['numero_achat' => 'C-2026/03'],
            [
                'objet_achat' => 'Fourniture de laptops ultraportables pour la direction et développeurs',
                'type_achat' => 'Consultation',
                'date_achat' => '2026-08-01',
                'statut' => 'En cours',
                'fournisseur_id' => $fournSybios->id,
            ]
        );

        BordereauMateriel::firstOrCreate(
            ['achat_id' => $achat4->id, 'nom_materiel' => 'Lenovo ThinkPad X1 Carbon Gen 11'],
            [
                'caracteristiques' => 'Intel Core i7-1370P vPro, 32GB LPDDR5, 1TB SSD NVMe, 14" 2.8K OLED',
                'quantite_materiel' => 2,
                'garantie_materiel' => 36,
                'prix_unitaire_ht' => 22000.00,
                'categorie_id' => $catLaptop->id,
                'modele_id' => $modThinkpadX1->id,
            ]
        );

        BordereauMateriel::firstOrCreate(
            ['achat_id' => $achat4->id, 'nom_materiel' => 'MacBook Pro 16" M3 Max'],
            [
                'caracteristiques' => 'Puce Apple M3 Max (CPU 16 cœurs, GPU 40 cœurs), 36GB Mémoire Unifiée, 1TB SSD',
                'quantite_materiel' => 1,
                'garantie_materiel' => 24,
                'prix_unitaire_ht' => 38500.00,
                'categorie_id' => $catLaptop->id,
                'modele_id' => $modMacbookPro16->id,
            ]
        );
    }
}
