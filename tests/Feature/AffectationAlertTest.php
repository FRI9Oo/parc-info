<?php

namespace Tests\Feature;

use App\Models\AffectationMateriel;
use App\Models\Categorie;
use App\Models\Departement;
use App\Models\Direction;
use App\Models\Division;
use App\Models\Employe;
use App\Models\Materiel;
use App\Models\Role;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AffectationAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_identifies_long_standing_affectations(): void
    {
        $role = Role::create(['nom_role' => 'Admin']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $dir = Direction::create(['nom_direction' => 'DIR']);
        $dep = Departement::create(['nom_departement' => 'DEP', 'direction_id' => $dir->id]);
        $div = Division::create(['nom_division' => 'DIV', 'departement_id' => $dep->id]);
        $srv = Service::create(['nom_service' => 'SRV', 'division_id' => $div->id]);

        $cat = Categorie::create(['nom_categorie' => 'PC']);
        $mat = Materiel::create([
            'nom' => 'Old Laptop',
            'marque' => 'Dell',
            'modele' => 'Latitude 5540',
            'numero_serie' => 'SN-OLD-001',
            'numero_inventaire' => 'INV-OLD-001',
            'categorie_id' => $cat->id,
        ]);
        $emp = Employe::create([
            'matricule' => 'M9999',
            'nom' => 'Test',
            'prenom' => 'User',
            'fonction' => 'Technicien',
            'service_id' => $srv->id,
        ]);

        // Long-standing affectation created 200 days ago
        AffectationMateriel::create([
            'employe_id' => $emp->id,
            'materiel_id' => $mat->id,
            'date_affectation' => now()->subDays(200)->format('Y-m-d'),
            'date_restitution' => null,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('longStandingAffectations', 1)
            ->where('stats.long_standing_count', 1)
        );
    }
}
