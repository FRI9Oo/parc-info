<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role_id', 'employe_id', 'is_active', 'avatar', 'fonction', 'telephone', 'bio'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function hasRole(string $roleName): bool
    {
        return $this->role?->nom_role === $roleName;
    }

    public function hasPermission(string $permissionName): bool
    {
        if (! $this->role) {
            return false;
        }

        if ($this->hasRole('Administrateur')) {
            return true;
        }

        if ($this->role->permissions->contains('nom_permission', $permissionName)) {
            return true;
        }

        // Parent Master Permission -> Child Permissions fallback mapping
        $masterMapping = [
            'voir_affectations' => 'gerer_affectations',
            'creer_affectation' => 'gerer_affectations',
            'modifier_affectation' => 'gerer_affectations',
            'imprimer_affectation' => 'gerer_affectations',
            'voir_materiels' => 'gerer_materiels',
            'creer_materiel' => 'gerer_materiels',
            'modifier_materiel' => 'gerer_materiels',
            'supprimer_materiel' => 'gerer_materiels',
            'voir_employes' => 'gerer_employes',
            'creer_employe' => 'gerer_employes',
            'modifier_employe' => 'gerer_employes',
            'supprimer_employe' => 'gerer_employes',

            // Generic Structure
            'voir_structure' => 'gerer_structure',
            'modifier_structure' => 'gerer_structure',
            'supprimer_structure' => 'gerer_structure',

            // Per-Layer Structure: Directions
            'voir_directions' => ['gerer_directions', 'voir_structure', 'gerer_structure'],
            'creer_direction' => ['gerer_directions', 'modifier_structure', 'gerer_structure'],
            'modifier_direction' => ['gerer_directions', 'modifier_structure', 'gerer_structure'],
            'supprimer_direction' => ['gerer_directions', 'supprimer_structure', 'gerer_structure'],
            'gerer_directions' => ['gerer_structure'],

            // Per-Layer Structure: Départements
            'voir_departements' => ['gerer_departements', 'voir_structure', 'gerer_structure'],
            'creer_departement' => ['gerer_departements', 'modifier_structure', 'gerer_structure'],
            'modifier_departement' => ['gerer_departements', 'modifier_structure', 'gerer_structure'],
            'supprimer_departement' => ['gerer_departements', 'supprimer_structure', 'gerer_structure'],
            'gerer_departements' => ['gerer_structure'],

            // Per-Layer Structure: Divisions
            'voir_divisions' => ['gerer_divisions', 'voir_structure', 'gerer_structure'],
            'creer_division' => ['gerer_divisions', 'modifier_structure', 'gerer_structure'],
            'modifier_division' => ['gerer_divisions', 'modifier_structure', 'gerer_structure'],
            'supprimer_division' => ['gerer_divisions', 'supprimer_structure', 'gerer_structure'],
            'gerer_divisions' => ['gerer_structure'],

            // Per-Layer Structure: Services
            'voir_services' => ['gerer_services', 'voir_structure', 'gerer_structure'],
            'creer_service' => ['gerer_services', 'modifier_structure', 'gerer_structure'],
            'modifier_service' => ['gerer_services', 'modifier_structure', 'gerer_structure'],
            'supprimer_service' => ['gerer_services', 'supprimer_structure', 'gerer_structure'],
            'gerer_services' => ['gerer_structure'],

            // Fournisseurs
            'voir_fournisseurs' => 'gerer_fournisseurs',
            'creer_fournisseur' => 'gerer_fournisseurs',
            'modifier_fournisseur' => 'gerer_fournisseurs',
            'supprimer_fournisseur' => 'gerer_fournisseurs',

            // Achats & Marchés
            'voir_achats' => 'gerer_achats',
            'creer_achat' => 'gerer_achats',
            'modifier_achat' => 'gerer_achats',
            'supprimer_achat' => 'gerer_achats',

            // Factures
            'voir_factures' => 'gerer_factures',
            'creer_facture' => 'gerer_factures',
            'modifier_facture' => 'gerer_factures',
            'supprimer_facture' => 'gerer_factures',

            // Livraisons & Stocks
            'voir_livraisons' => 'gerer_livraisons',
            'creer_livraison' => 'gerer_livraisons',
            'supprimer_livraison' => 'gerer_livraisons',

            // Marques & Modèles
            'voir_marques_modeles' => 'gerer_marques_modeles',
            'creer_marque_modele' => 'gerer_marques_modeles',
            'modifier_marque_modele' => 'gerer_marques_modeles',
            'supprimer_marque_modele' => 'gerer_marques_modeles',
        ];

        if (isset($masterMapping[$permissionName])) {
            $parents = (array) $masterMapping[$permissionName];
            foreach ($parents as $parentPerm) {
                if ($this->role->permissions->contains('nom_permission', $parentPerm)) {
                    return true;
                }
            }
        }

        return false;
    }
}