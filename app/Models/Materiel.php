<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materiel extends Model
{
    protected $fillable = [
        'nom', 'marque', 'modele', 'numero_serie',
        'numero_inventaire', 'caracteristique', 'categorie_id',
    ];

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function affectations()
    {
        return $this->hasMany(AffectationMateriel::class);
    }
}
