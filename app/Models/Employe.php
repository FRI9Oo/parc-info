<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    protected $fillable = ['matricule', 'prenom', 'nom', 'fonction', 'service_id'];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function affectations()
    {
        return $this->hasMany(AffectationMateriel::class);
    }
}
