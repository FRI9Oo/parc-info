<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $fillable = ['nom_categorie'];

    public function materiels()
    {
        return $this->hasMany(Materiel::class);
    }
}