<?php

namespace Tests\Feature;

use App\Models\Direction;
use App\Models\Departement;
use App\Models\Division;
use App\Models\Service;
use App\Models\Employe;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Role $adminRole;
    protected Role $managerRole;
    protected Employe $employe;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::create(['nom_role' => 'Administrateur']);
        $this->managerRole = Role::create(['nom_role' => 'Gestionnaire SI']);

        $direction = Direction::create(['nom_direction' => 'Direction SI']);
        $dept = Departement::create(['nom_departement' => 'Informatique', 'direction_id' => $direction->id]);
        $division = Division::create(['nom_division' => 'Infrastructure', 'departement_id' => $dept->id]);
        $service = Service::create(['nom_service' => 'Reseaux', 'division_id' => $division->id]);

        $this->employe = Employe::create([
            'matricule' => 'EMP999',
            'nom' => 'Alami',
            'prenom' => 'Hassan',
            'fonction' => 'Chef de projet',
            'service_id' => $service->id,
        ]);

        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role_id' => $this->adminRole->id,
        ]);
    }

    public function test_can_view_users_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('users.index'));
        $response->assertStatus(200);
    }

    public function test_can_create_new_user_with_role_and_employe(): void
    {
        $response = $this->actingAs($this->adminUser)->post(route('users.store'), [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role_id' => $this->managerRole->id,
            'employe_id' => $this->employe->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'role_id' => $this->managerRole->id,
            'employe_id' => $this->employe->id,
        ]);
    }

    public function test_can_update_user_details(): void
    {
        $user = User::create([
            'name' => 'Old Name',
            'email' => 'old@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->actingAs($this->adminUser)->put(route('users.update', $user->id), [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'password' => '',
            'role_id' => $this->managerRole->id,
            'employe_id' => $this->employe->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role_id' => $this->managerRole->id,
            'employe_id' => $this->employe->id,
        ]);
    }

    public function test_can_delete_other_user(): void
    {
        $userToDelete = User::create([
            'name' => 'Delete Me',
            'email' => 'deleteme@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->actingAs($this->adminUser)->delete(route('users.destroy', $userToDelete->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
    }

    public function test_cannot_delete_self(): void
    {
        $response = $this->actingAs($this->adminUser)->delete(route('users.destroy', $this->adminUser->id));
        $response->assertSessionHasErrors('delete');
        $this->assertDatabaseHas('users', ['id' => $this->adminUser->id]);
    }
}
