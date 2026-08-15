<?php

namespace Tests\Feature;

use App\Models\Achat;
use App\Models\Categorie;
use App\Models\Fournisseur;
use App\Models\Materiel;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class MaterielBulkImportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Fournisseur $fournisseur;
    protected Achat $achat;
    protected Categorie $categorie;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['nom_role' => 'Administrateur']);
        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);

        $this->fournisseur = Fournisseur::create([
            'nom_fournisseur' => 'Dell Maroc',
        ]);

        $this->achat = Achat::create([
            'numero_achat' => 'M-2026/01',
            'objet_achat' => 'Acquisition PC',
            'type_achat' => 'Marché',
            'date_achat' => '2026-01-10',
            'statut' => 'En cours',
            'fournisseur_id' => $this->fournisseur->id,
        ]);

        $this->categorie = Categorie::create([
            'nom_categorie' => 'PC Portable',
        ]);
    }

    public function test_can_download_import_template(): void
    {
        $response = $this->actingAs($this->admin)->get(route('materiels.template'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Disposition', 'attachment; filename="modele_import_materiels.csv"');
    }

    public function test_can_bulk_import_materiels_with_achat_link(): void
    {
        $csvContent = "\xEF\xBB\xBF" .
            "Nom du Materiel;Marque;Modele;Numero de Serie;Numero Inventaire;Categorie;Numero Achat;Caracteristiques\n" .
            "Dell Latitude 5540;Dell;Latitude 5540;SN-BULK-001;INV-BULK-001;PC Portable;M-2026/01;Core i7 16GB\n" .
            "HP EliteBook 840;HP;EliteBook 840;SN-BULK-002;INV-BULK-002;PC Portable;M-2026/01;Core i5 16GB\n";

        $file = UploadedFile::fake()->createWithContent('import.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('materiels.bulk-import'), [
            'file' => $file,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('materiels', [
            'numero_serie' => 'SN-BULK-001',
            'numero_inventaire' => 'INV-BULK-001',
            'achat_id' => $this->achat->id,
        ]);
        $this->assertDatabaseHas('materiels', [
            'numero_serie' => 'SN-BULK-002',
            'numero_inventaire' => 'INV-BULK-002',
            'achat_id' => $this->achat->id,
        ]);
    }

    public function test_bulk_import_skips_duplicates(): void
    {
        Materiel::create([
            'nom' => 'Existant',
            'marque' => 'Dell',
            'modele' => '5520',
            'numero_serie' => 'SN-EXISTING-01',
            'numero_inventaire' => 'INV-EXISTING-01',
            'categorie_id' => $this->categorie->id,
        ]);

        $csvContent = "Nom;Marque;Modele;Numero de Serie;Numero Inventaire;Categorie;Achat;Specs\n" .
            "Nouveau;Dell;5520;SN-NEW-01;INV-NEW-01;PC Portable;;Specs\n" .
            "Doublon;Dell;5520;SN-EXISTING-01;INV-NEW-02;PC Portable;;Specs\n";

        $file = UploadedFile::fake()->createWithContent('import_dups.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('materiels.bulk-import'), [
            'file' => $file,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('materiels', ['numero_serie' => 'SN-NEW-01']);
        // Verify only 1 new was created
        $this->assertEquals(2, Materiel::count());
    }

    public function test_can_create_materiel_with_direct_achat_id(): void
    {
        $response = $this->actingAs($this->admin)->post(route('materiels.store'), [
            'nom' => 'Dell Latitude 5540',
            'marque' => 'Dell',
            'modele' => 'Latitude 5540',
            'numero_serie' => 'SN-SINGLE-001',
            'numero_inventaire' => 'INV-SINGLE-001',
            'categorie_id' => $this->categorie->id,
            'achat_id' => $this->achat->id,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('materiels', [
            'numero_serie' => 'SN-SINGLE-001',
            'achat_id' => $this->achat->id,
        ]);
    }

    public function test_bulk_import_auto_creates_missing_category(): void
    {
        $csvContent = "Nom;Marque;Modele;Numero de Serie;Numero Inventaire;Categorie;Achat;Specs\n" .
            "Serveur PowerEdge R750;Dell;PowerEdge R750;SN-SRV-001;INV-SRV-001;Serveurs & Baies;;Dual Xeon 64GB\n";

        $file = UploadedFile::fake()->createWithContent('import_new_cat.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('materiels.bulk-import'), [
            'file' => $file,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('categories', ['nom_categorie' => 'Serveurs & Baies']);
        $newCategory = Categorie::where('nom_categorie', 'Serveurs & Baies')->first();

        $this->assertDatabaseHas('materiels', [
            'numero_serie' => 'SN-SRV-001',
            'categorie_id' => $newCategory->id,
        ]);
    }
}
