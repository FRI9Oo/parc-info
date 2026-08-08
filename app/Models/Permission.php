<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['nom_permission', 'module', 'libelle', 'description_permission'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }
}