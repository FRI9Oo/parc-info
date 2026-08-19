<?php

namespace Tests\Feature;

use App\Models\Achat;
use App\Models\AffectationMateriel;
use App\Models\BordereauMateriel;
use App\Models\Categorie;
use App\Models\Employe;
use App\Models\Fournisseur;
use App\Models\LivraisonStock;
use App\Models\Materiel;
use App\Models\Role;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AchatValidationRuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Fournisseur $fournisseur;
    protected Categorie $categorie;
    protected Employe $employe;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['nom_role' => 'Administrateur']);
        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);

        $this->fournisseur = Fournisseur::create([
            'nom_fournisseur' => 'Dell Technologies Maroc',
        ]);

        $this->categorie = Categorie::create(['nom_categorie' => 'PC Portables']);

        $direction = \App\Models\Direction::create(['nom_direction' => 'Direction SI']);
        $departement = \App\Models\Departement::create(['nom_departement' => 'Département Infra', 'direction_id' => $direction->id]);
        $division = \App\Models\Division::create(['nom_division' => 'Division Support', 'departement_id' => $departement->id]);
        $service = Service::create(['nom_service' => 'Support SI', 'division_id' => $division->id]);

        $this->employe = Employe::create([
            'matricule' => 'EMP-TEST-01',
            'nom' => 'Alami',
            'prenom' => 'Karim',
            'fonction' => 'Technicien SI',
            'service_id' => $service->id,
        ]);
    }

    public function test_newly_created_achat_is_automatically_set_to_en_cours_status(): void
    {
        $response = $this->actingAs($this->admin)->post(route('achats.store'), [
            'numero_achat' => 'ACH-2026-NEW',
            'objet_achat' => 'Acquisition PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('achats', [
            'numero_achat' => 'ACH-2026-NEW',
            'statut' => 'En cours',
        ]);
    }

    public function test_cannot_validate_achat_without_bordereaux(): void
    {
        $achat = Achat::create([
            'numero_achat' => 'ACH-2026-001',
            'objet_achat' => 'Acquisition PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $response = $this->actingAs($this->admin)->put(route('achats.update', $achat->id), [
            'numero_achat' => 'ACH-2026-001',
            'objet_achat' => 'Acquisition PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'Validé',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $response->assertSessionHasErrors(['statut']);
        $this->assertEquals('En cours', $achat->fresh()->statut);
    }

    public function test_cannot_validate_achat_when_delivery_is_incomplete(): void
    {
        $achat = Achat::create([
            'numero_achat' => 'ACH-2026-002',
            'objet_achat' => 'Acquisition 2 PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $bordereau = BordereauMateriel::create([
            'achat_id' => $achat->id,
            'nom_materiel' => 'Dell Latitude 5520',
            'quantite_materiel' => 2,
            'garantie_materiel' => 24,
            'prix_unitaire_ht' => 9000,
            'categorie_id' => $this->categorie->id,
        ]);

        // Deliver only 1 out of 2
        LivraisonStock::create([
            'bordereau_materiel_id' => $bordereau->id,
            'reference_livraison' => 'BL-001',
            'date_livraison' => '2026-08-15',
            'quantite_livraison' => 1,
        ]);

        $response = $this->actingAs($this->admin)->put(route('achats.update', $achat->id), [
            'numero_achat' => 'ACH-2026-002',
            'objet_achat' => 'Acquisition 2 PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'Validé',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $response->assertSessionHasErrors(['statut']);
        $this->assertEquals('En cours', $achat->fresh()->statut);
    }

    public function test_cannot_validate_achat_when_materiels_are_not_assigned(): void
    {
        $achat = Achat::create([
            'numero_achat' => 'ACH-2026-003',
            'objet_achat' => 'Acquisition 1 PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $bordereau = BordereauMateriel::create([
            'achat_id' => $achat->id,
            'nom_materiel' => 'Dell Latitude 5520',
            'quantite_materiel' => 1,
            'garantie_materiel' => 24,
            'prix_unitaire_ht' => 9000,
            'categorie_id' => $this->categorie->id,
        ]);

        $livraison = LivraisonStock::create([
            'bordereau_materiel_id' => $bordereau->id,
            'reference_livraison' => 'BL-002',
            'date_livraison' => '2026-08-15',
            'quantite_livraison' => 1,
        ]);

        // Create the physical materiel in stock (not assigned yet)
        Materiel::create([
            'nom' => 'Dell Latitude 5520',
            'marque' => 'Dell',
            'modele' => 'Latitude 5520',
            'numero_serie' => 'SN-DELL-001',
            'numero_inventaire' => 'INV-26-0001',
            'categorie_id' => $this->categorie->id,
            'livraison_stock_id' => $livraison->id,
        ]);

        $response = $this->actingAs($this->admin)->put(route('achats.update', $achat->id), [
            'numero_achat' => 'ACH-2026-003',
            'objet_achat' => 'Acquisition 1 PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'Validé',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $response->assertSessionHasErrors(['statut']);
        $this->assertEquals('En cours', $achat->fresh()->statut);
    }

    public function test_can_validate_achat_when_all_materiels_are_delivered_and_assigned(): void
    {
        $achat = Achat::create([
            'numero_achat' => 'ACH-2026-004',
            'objet_achat' => 'Acquisition 1 PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $bordereau = BordereauMateriel::create([
            'achat_id' => $achat->id,
            'nom_materiel' => 'Dell Latitude 5520',
            'quantite_materiel' => 1,
            'garantie_materiel' => 24,
            'prix_unitaire_ht' => 9000,
            'categorie_id' => $this->categorie->id,
        ]);

        $livraison = LivraisonStock::create([
            'bordereau_materiel_id' => $bordereau->id,
            'reference_livraison' => 'BL-003',
            'date_livraison' => '2026-08-15',
            'quantite_livraison' => 1,
        ]);

        $materiel = Materiel::create([
            'nom' => 'Dell Latitude 5520',
            'marque' => 'Dell',
            'modele' => 'Latitude 5520',
            'numero_serie' => 'SN-DELL-002',
            'numero_inventaire' => 'INV-26-0002',
            'categorie_id' => $this->categorie->id,
            'livraison_stock_id' => $livraison->id,
        ]);

        // Assign the materiel to employee
        AffectationMateriel::create([
            'employe_id' => $this->employe->id,
            'materiel_id' => $materiel->id,
            'date_affectation' => '2026-08-15',
        ]);

        // Now validation must succeed!
        $response = $this->actingAs($this->admin)->put(route('achats.update', $achat->id), [
            'numero_achat' => 'ACH-2026-004',
            'objet_achat' => 'Acquisition 1 PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'Validé',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals('Validé', $achat->fresh()->statut);
    }

    public function test_can_create_achat_with_valid_type_achat_options(): void
    {
        // 1. Test "Marché"
        $resp1 = $this->actingAs($this->admin)->post(route('achats.store'), [
            'numero_achat' => 'ACH-TYPE-MARCHE',
            'objet_achat' => 'Achat Marché Test',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);
        $resp1->assertSessionHasNoErrors();
        $this->assertDatabaseHas('achats', ['numero_achat' => 'ACH-TYPE-MARCHE', 'type_achat' => 'Marché']);

        // 2. Test "Bon de commande"
        $resp2 = $this->actingAs($this->admin)->post(route('achats.store'), [
            'numero_achat' => 'ACH-TYPE-BC',
            'objet_achat' => 'Achat Bon de commande Test',
            'type_achat' => 'Bon de commande',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);
        $resp2->assertSessionHasNoErrors();
        $this->assertDatabaseHas('achats', ['numero_achat' => 'ACH-TYPE-BC', 'type_achat' => 'Bon de commande']);
    }

    public function test_cannot_create_or_update_achat_with_invalid_type_achat(): void
    {
        // Create attempt with invalid type
        $respCreate = $this->actingAs($this->admin)->post(route('achats.store'), [
            'numero_achat' => 'ACH-INVALID-TYPE',
            'objet_achat' => 'Achat Invalide',
            'type_achat' => 'Consultation',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);
        $respCreate->assertSessionHasErrors(['type_achat']);
        $this->assertDatabaseMissing('achats', ['numero_achat' => 'ACH-INVALID-TYPE']);

        // Update attempt with invalid type
        $achat = Achat::create([
            'numero_achat' => 'ACH-VALID-01',
            'objet_achat' => 'Achat Valide',
            'type_achat' => 'Marché',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $respUpdate = $this->actingAs($this->admin)->put(route('achats.update', $achat->id), [
            'numero_achat' => 'ACH-VALID-01',
            'objet_achat' => 'Achat Valide',
            'type_achat' => 'Contrat cadre',
            'date_achat' => '2026-08-15',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);
        $respUpdate->assertSessionHasErrors(['type_achat']);
        $this->assertEquals('Marché', $achat->fresh()->type_achat);
    }
}

