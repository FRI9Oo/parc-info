<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Permission $perm1;
    protected Permission $perm2;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['nom_role' => 'Administrateur']);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id,
        ]);

        $this->perm1 = Permission::create([
            'nom_permission' => 'gerer_materiels',
            'description_permission' => 'Gestion des équipements',
        ]);

        $this->perm2 = Permission::create([
            'nom_permission' => 'gerer_affectations',
            'description_permission' => 'Gestion des affectations',
        ]);
    }

    public function test_can_view_roles_and_permissions_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('roles.index'));
        $response->assertStatus(200);

        $userResponse = $this->actingAs($this->admin)->get(route('users.index'));
        $userResponse->assertStatus(200);
    }

    public function test_can_create_role_with_permissions(): void
    {
        $response = $this->actingAs($this->admin)->post(route('roles.store'), [
            'nom_role' => 'Technicien SI',
            'description_role' => 'Gestion du support',
            'permission_ids' => [$this->perm1->id, $this->perm2->id],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', ['nom_role' => 'Technicien SI']);

        $role = Role::where('nom_role', 'Technicien SI')->first();
        $this->assertCount(2, $role->permissions);
    }

    public function test_can_update_role_permissions(): void
    {
        $role = Role::create(['nom_role' => 'Gestionnaire']);
        $role->permissions()->attach([$this->perm1->id]);

        $response = $this->actingAs($this->admin)->put(route('roles.update', $role->id), [
            'nom_role' => 'Gestionnaire Senior',
            'description_role' => 'Description mise à jour',
            'permission_ids' => [$this->perm2->id],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', ['nom_role' => 'Gestionnaire Senior']);

        $role->refresh();
        $this->assertCount(1, $role->permissions);
        $this->assertEquals('gerer_affectations', $role->permissions->first()->nom_permission);
    }

    public function test_cannot_delete_role_assigned_to_user(): void
    {
        $role = Role::create(['nom_role' => 'Stagiaire']);
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('roles.destroy', $role->id));
        $response->assertSessionHasErrors('delete');
        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    public function test_can_assign_role_to_user(): void
    {
        $role = Role::create(['nom_role' => 'Superviser']);
        $targetUser = User::create([
            'name' => 'Target User',
            'email' => 'target@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->actingAs($this->admin)->put(route('users.update-role', $targetUser->id), [
            'role_id' => $role->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'role_id' => $role->id,
        ]);
    }

    public function test_viewer_role_can_access_pages_without_gerer_permission(): void
    {
        $viewerRole = Role::create(['nom_role' => 'Consultant Viewer']);

        $voirEmployes = Permission::create(['nom_permission' => 'voir_employes', 'module' => 'Employés']);
        $voirMateriels = Permission::create(['nom_permission' => 'voir_materiels', 'module' => 'Matériels']);
        $voirAffectations = Permission::create(['nom_permission' => 'voir_affectations', 'module' => 'Affectations']);
        $voirStructure = Permission::create(['nom_permission' => 'voir_structure', 'module' => 'Structure']);

        $viewerRole->permissions()->attach([$voirEmployes->id, $voirMateriels->id, $voirAffectations->id, $voirStructure->id]);

        $viewerUser = User::create([
            'name' => 'Viewer User',
            'email' => 'viewer@example.com',
            'password' => bcrypt('password'),
            'role_id' => $viewerRole->id,
        ]);

        // GET pages should return 200 OK for viewer user without requiring gerer_X master permission
        $this->actingAs($viewerUser)->get(route('employes.index'))->assertStatus(200);
        $this->actingAs($viewerUser)->get(route('materiels.index'))->assertStatus(200);
        $this->actingAs($viewerUser)->get(route('affectations.index'))->assertStatus(200);
        $this->actingAs($viewerUser)->get(route('services.index'))->assertStatus(200);

        // POST mutation should be forbidden (403) for pure viewer user
        $this->actingAs($viewerUser)->post(route('employes.store'), [
            'matricule' => 'EMP999',
            'nom' => 'Test',
            'prenom' => 'User',
        ])->assertStatus(403);
    }
}
