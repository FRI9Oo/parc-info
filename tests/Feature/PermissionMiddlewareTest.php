<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $managerUser;
    protected User $unprivilegedUser;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Admin Role
        $adminRole = Role::create(['nom_role' => 'Administrateur']);

        // 2. Manager Role with gerer_affectations permission only
        $managerRole = Role::create(['nom_role' => 'Gestionnaire Affectations']);
        $permAffectations = Permission::create(['nom_permission' => 'gerer_affectations']);
        $managerRole->permissions()->attach($permAffectations->id);

        // 3. User with no permissions
        $unprivilegedRole = Role::create(['nom_role' => 'Utilisateur Basique']);

        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id,
        ]);

        $this->managerUser = User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => bcrypt('password'),
            'role_id' => $managerRole->id,
        ]);

        $this->unprivilegedUser = User::create([
            'name' => 'Basic User',
            'email' => 'basic@example.com',
            'password' => bcrypt('password'),
            'role_id' => $unprivilegedRole->id,
        ]);
    }

    public function test_unprivileged_user_cannot_access_protected_routes(): void
    {
        // Unprivileged user trying to access /affectations (requires gerer_affectations)
        $response = $this->actingAs($this->unprivilegedUser)->get(route('affectations.index'));
        $response->assertStatus(403);

        // Unprivileged user trying to access /roles (requires gerer_structure)
        $rolesResponse = $this->actingAs($this->unprivilegedUser)->get(route('roles.index'));
        $rolesResponse->assertStatus(403);
    }

    public function test_user_with_permission_can_access_their_route(): void
    {
        // Manager with gerer_affectations permission can access /affectations
        $response = $this->actingAs($this->managerUser)->get(route('affectations.index'));
        $response->assertStatus(200);

        // But manager cannot access /roles (requires gerer_structure)
        $rolesResponse = $this->actingAs($this->managerUser)->get(route('roles.index'));
        $rolesResponse->assertStatus(403);
    }

    public function test_admin_can_access_all_routes(): void
    {
        // Admin can access /affectations
        $response = $this->actingAs($this->adminUser)->get(route('affectations.index'));
        $response->assertStatus(200);

        // Admin can access /roles
        $rolesResponse = $this->actingAs($this->adminUser)->get(route('roles.index'));
        $rolesResponse->assertStatus(200);

        // Admin can access /employes
        $empResponse = $this->actingAs($this->adminUser)->get(route('employes.index'));
        $empResponse->assertStatus(200);
    }
}
