<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_fournisseur',
        'adresse_fournisseur',
        'telephone_fournisseur',
        'contact_personne',
    ];

    public function achats()
    {
        return $this->hasMany(Achat::class);
    }
}
