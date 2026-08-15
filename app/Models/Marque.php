<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Marque extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_marque',
    ];

    public function modeles()
    {
        return $this->hasMany(Modele::class);
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class);
    }
}
