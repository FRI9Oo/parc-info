<?php

namespace Tests\Feature;

use App\Models\AffectationMateriel;
use App\Models\Categorie;
use App\Models\Direction;
use App\Models\Departement;
use App\Models\Division;
use App\Models\Service;
use App\Models\Employe;
use App\Models\Materiel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AffectationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Employe $employe1;
    protected Employe $employe2;
    protected Materiel $materiel1;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $direction = Direction::create(['nom_direction' => 'Direction SI']);
        $dept = Departement::create(['nom_departement' => 'Informatique', 'direction_id' => $direction->id]);
        $division = Division::create(['nom_division' => 'Infrastructure', 'departement_id' => $dept->id]);
        $service = Service::create(['nom_service' => 'Reseaux', 'division_id' => $division->id]);

        $this->employe1 = Employe::create([
            'matricule' => 'EMP001',
            'nom' => 'Benali',
            'prenom' => 'Ahmed',
            'fonction' => 'Ingénieur',
            'service_id' => $service->id,
        ]);

        $this->employe2 = Employe::create([
            'matricule' => 'EMP002',
            'nom' => 'El Amrani',
            'prenom' => 'Sara',
            'fonction' => 'Technicienne',
            'service_id' => $service->id,
        ]);

        $categorie = Categorie::create(['nom_categorie' => 'Ordinables Portables']);

        $this->materiel1 = Materiel::create([
            'nom' => 'Dell Latitude 5540',
            'marque' => 'Dell',
            'modele' => 'Latitude 5540',
            'numero_serie' => 'SN-12345',
            'numero_inventaire' => 'INV-98765',
            'caracteristique' => 'Core i7, 16GB RAM',
            'categorie_id' => $categorie->id,
        ]);
    }

    public function test_can_view_affectations_page(): void
    {
        $response = $this->actingAs($this->user)->get(route('affectations.index'));
        $response->assertStatus(200);
    }

    public function test_can_create_new_affectation(): void
    {
        $response = $this->actingAs($this->user)->post(route('affectations.store'), [
            'employe_id' => $this->employe1->id,
            'materiel_id' => $this->materiel1->id,
            'date_affectation' => '2026-08-01',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('affectation_materiels', [
            'employe_id' => $this->employe1->id,
            'materiel_id' => $this->materiel1->id,
            'date_affectation' => '2026-08-01',
            'date_restitution' => null,
        ]);

        $affectation = AffectationMateriel::first();
        $this->assertEquals('Affecté', $affectation->etat);
    }

    public function test_cannot_assign_already_assigned_equipment_on_overlapping_period(): void
    {
        AffectationMateriel::create([
            'employe_id' => $this->employe1->id,
            'materiel_id' => $this->materiel1->id,
            'date_affectation' => '2026-08-01',
            'date_restitution' => null,
        ]);

        $response = $this->actingAs($this->user)->post(route('affectations.store'), [
            'employe_id' => $this->employe2->id,
            'materiel_id' => $this->materiel1->id,
            'date_affectation' => '2026-08-05',
        ]);

        $response->assertSessionHasErrors('materiel_id');
    }

    public function test_can_cloturer_affectation(): void
    {
        $affectation = AffectationMateriel::create([
            'employe_id' => $this->employe1->id,
            'materiel_id' => $this->materiel1->id,
            'date_affectation' => '2026-08-01',
            'date_restitution' => null,
        ]);

        $response = $this->actingAs($this->user)->put(route('affectations.cloturer', $affectation->id), [
            'date_cloture' => '2026-08-05',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('affectation_materiels', [
            'id' => $affectation->id,
            'date_restitution' => '2026-08-05',
        ]);

        $affectation->refresh();
        $this->assertEquals('Clôturé', $affectation->etat);
    }

    public function test_reassignment_possible_after_cloture(): void
    {
        // 1. Assign to Employe 1 and close on 2026-08-05
        AffectationMateriel::create([
            'employe_id' => $this->employe1->id,
            'materiel_id' => $this->materiel1->id,
            'date_affectation' => '2026-08-01',
            'date_restitution' => '2026-08-05',
        ]);

        // 2. Re-assign same materiel to Employe 2 starting 2026-08-06
        $response = $this->actingAs($this->user)->post(route('affectations.store'), [
            'employe_id' => $this->employe2->id,
            'materiel_id' => $this->materiel1->id,
            'date_affectation' => '2026-08-06',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        $this->assertCount(2, AffectationMateriel::all());
    }
}
