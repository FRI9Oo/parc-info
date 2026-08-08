<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Categorie;
use App\Models\Employe;
use App\Models\Materiel;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_materiel_records_audit_log(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'creer_materiel',
            'module' => 'Matériels',
            'libelle' => 'Ajouter équipements & catégories',
        ]);
        $role = Role::create(['nom_role' => 'Admin']);
        $role->permissions()->attach($perm->id);

        $user = User::factory()->create(['role_id' => $role->id]);
        $cat = Categorie::create(['nom_categorie' => 'PC']);

        $response = $this->actingAs($user)->post(route('materiels.store'), [
            'nom' => 'Test Laptop',
            'marque' => 'Dell',
            'modele' => 'Latitude 5540',
            'numero_serie' => 'SN-123456',
            'numero_inventaire' => 'INV-123456',
            'categorie_id' => $cat->id,
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'Matériels',
            'action' => 'Création',
            'user_name' => $user->name,
        ]);
    }

    public function test_authorized_user_can_access_audit_logs(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'voir_audit_logs',
            'module' => 'Journal d\'Audit',
            'libelle' => 'Consulter le journal d\'audit',
        ]);
        $role = Role::create(['nom_role' => 'Auditeur']);
        $role->permissions()->attach($perm->id);
        $user = User::factory()->create(['role_id' => $role->id]);

        AuditLog::record('Création', 'Test', 'Description test');

        $response = $this->actingAs($user)->get(route('audit-logs.index'));

        $response->assertStatus(200);
    }

    public function test_unauthorized_user_cannot_access_audit_logs(): void
    {
        $role = Role::create(['nom_role' => 'User Sans Log']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user)->get(route('audit-logs.index'));

        $response->assertStatus(403);
    }
}
