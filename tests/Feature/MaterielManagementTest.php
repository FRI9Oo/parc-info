<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Materiel;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaterielManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected Categorie $categorie;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['nom_role' => 'Administrateur']);

        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id,
        ]);

        $this->categorie = Categorie::create(['nom_categorie' => 'Ordinables Portables']);
    }

    public function test_can_view_materiels_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('materiels.index'));
        $response->assertStatus(200);
    }

    public function test_can_create_new_materiel(): void
    {
        $response = $this->actingAs($this->adminUser)->post(route('materiels.store'), [
            'nom' => 'ThinkPad T14',
            'marque' => 'Lenovo',
            'modele' => 'T14 Gen 4',
            'numero_serie' => 'SN-LNV-999',
            'numero_inventaire' => 'INV-2026-999',
            'caracteristique' => '32GB RAM, 1TB SSD',
            'categorie_id' => $this->categorie->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('materiels', [
            'nom' => 'ThinkPad T14',
            'numero_serie' => 'SN-LNV-999',
            'numero_inventaire' => 'INV-2026-999',
        ]);
    }

    public function test_can_update_materiel(): void
    {
        $materiel = Materiel::create([
            'nom' => 'Dell Laptop',
            'marque' => 'Dell',
            'modele' => 'Latitude',
            'numero_serie' => 'SN-OLD',
            'numero_inventaire' => 'INV-OLD',
            'categorie_id' => $this->categorie->id,
        ]);

        $response = $this->actingAs($this->adminUser)->put(route('materiels.update', $materiel->id), [
            'nom' => 'Dell Laptop Updated',
            'marque' => 'Dell',
            'modele' => 'Latitude 5540',
            'numero_serie' => 'SN-NEW',
            'numero_inventaire' => 'INV-NEW',
            'caracteristique' => 'Core i7',
            'categorie_id' => $this->categorie->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('materiels', [
            'id' => $materiel->id,
            'nom' => 'Dell Laptop Updated',
            'numero_serie' => 'SN-NEW',
        ]);
    }

    public function test_can_delete_materiel_without_affectations(): void
    {
        $materiel = Materiel::create([
            'nom' => 'To Delete',
            'marque' => 'HP',
            'modele' => 'ProBook',
            'numero_serie' => 'SN-DEL',
            'numero_inventaire' => 'INV-DEL',
            'categorie_id' => $this->categorie->id,
        ]);

        $response = $this->actingAs($this->adminUser)->delete(route('materiels.destroy', $materiel->id));
        $response->assertRedirect();
        $this->assertDatabaseMissing('materiels', ['id' => $materiel->id]);
    }
}
