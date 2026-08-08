<?php

namespace Tests\Feature;

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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AffectationPrintTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_access_printable_fiche_de_prise_en_charge(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'imprimer_affectation',
            'module' => 'Affectations',
            'libelle' => 'Imprimer fiches de prise en charge',
        ]);
        $role = Role::create(['nom_role' => 'Manager']);
        $role->permissions()->attach($perm->id);
        $user = User::factory()->create(['role_id' => $role->id]);

        $dir = Direction::create(['nom_direction' => 'DIR']);
        $dep = Departement::create(['nom_departement' => 'DEP', 'direction_id' => $dir->id]);
        $div = Division::create(['nom_division' => 'DIV', 'departement_id' => $dep->id]);
        $srv = Service::create(['nom_service' => 'SRV', 'division_id' => $div->id]);

        $cat = Categorie::create(['nom_categorie' => 'PC']);
        $mat = Materiel::create([
            'nom' => 'Dell Laptop',
            'marque' => 'Dell',
            'modele' => 'Latitude 5540',
            'numero_serie' => 'SN-PRINT-001',
            'numero_inventaire' => 'INV-PRINT-001',
            'categorie_id' => $cat->id,
        ]);
        $emp = Employe::create([
            'matricule' => 'M1234',
            'nom' => 'Benali',
            'prenom' => 'Ahmed',
            'fonction' => 'Ingénieur',
            'service_id' => $srv->id,
        ]);

        $aff = AffectationMateriel::create([
            'employe_id' => $emp->id,
            'materiel_id' => $mat->id,
            'date_affectation' => now()->format('Y-m-d'),
        ]);

        $response = $this->actingAs($user)->get(route('affectations.print', $aff->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Affectations/Print')
            ->where('affectation.id', $aff->id)
        );

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'Affectations',
            'action' => 'Impression',
        ]);
    }
}
