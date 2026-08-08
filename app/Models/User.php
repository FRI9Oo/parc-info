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
            'voir_structure' => 'gerer_structure',
            'modifier_structure' => 'gerer_structure',
            'supprimer_structure' => 'gerer_structure',
        ];

        if (isset($masterMapping[$permissionName])) {
            return $this->role->permissions->contains('nom_permission', $masterMapping[$permissionName]);
        }

        return false;
    }
}