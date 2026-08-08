<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_export_materiels_csv(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'voir_materiels',
            'module' => 'Matériels',
            'libelle' => 'Consulter le parc',
        ]);
        $role = Role::create(['nom_role' => 'Manager']);
        $role->permissions()->attach($perm->id);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user)->get(route('exports.materiels.csv'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_authorized_user_can_export_affectations_csv(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'voir_affectations',
            'module' => 'Affectations',
            'libelle' => 'Consulter affectations',
        ]);
        $role = Role::create(['nom_role' => 'Manager']);
        $role->permissions()->attach($perm->id);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user)->get(route('exports.affectations.csv'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_authorized_user_can_export_employes_csv(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'voir_employes',
            'module' => 'Employés',
            'libelle' => 'Consulter employés',
        ]);
        $role = Role::create(['nom_role' => 'Manager']);
        $role->permissions()->attach($perm->id);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user)->get(route('exports.employes.csv'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_authorized_user_can_export_audit_logs_csv(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'voir_audit_logs',
            'module' => 'Journal d\'Audit',
            'libelle' => 'Consulter journal d\'audit',
        ]);
        $role = Role::create(['nom_role' => 'Auditeur']);
        $role->permissions()->attach($perm->id);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user)->get(route('exports.audit-logs.csv'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_unauthorized_user_cannot_export_csv(): void
    {
        $role = Role::create(['nom_role' => 'User Sans Perm']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user)->get(route('exports.materiels.csv'));

        $response->assertStatus(403);
    }
}
