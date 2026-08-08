<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_toggle_user_active_status(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'gerer_structure',
            'module' => 'Structure',
            'libelle' => 'Gestion structure',
        ]);
        $role = Role::create(['nom_role' => 'Admin']);
        $role->permissions()->attach($perm->id);
        $admin = User::factory()->create(['role_id' => $role->id]);

        $user = User::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)->put(route('users.toggle-status', $user->id));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_active' => false,
        ]);
    }

    public function test_deactivated_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'disabled@example.com',
            'password' => bcrypt('password'),
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => 'disabled@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_admin_can_reset_user_password(): void
    {
        $perm = Permission::create([
            'nom_permission' => 'gerer_structure',
            'module' => 'Structure',
            'libelle' => 'Gestion structure',
        ]);
        $role = Role::create(['nom_role' => 'Admin']);
        $role->permissions()->attach($perm->id);
        $admin = User::factory()->create(['role_id' => $role->id]);

        $user = User::factory()->create(['password' => bcrypt('oldpassword')]);

        $response = $this->actingAs($admin)->put(route('users.reset-password', $user->id), [
            'password' => 'newpassword123',
        ]);

        $response->assertSessionHasNoErrors();

        // Attempt login with new password
        $this->post('/login', [
            'email' => $user->email,
            'password' => 'newpassword123',
        ])->assertRedirect('/dashboard');
    }
}
