<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Modele extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_modele',
        'marque_id',
    ];

    public function marque()
    {
        return $this->belongsTo(Marque::class);
    }

    public function bordereaux()
    {
        return $this->hasMany(BordereauMateriel::class);
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class);
    }
}
