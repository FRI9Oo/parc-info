<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['nom_service', 'division_id'];

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function employes()
    {
        return $this->hasMany(Employe::class);
    }
}
