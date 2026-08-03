<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AffectationMateriel extends Model
{
    protected $fillable = [
        'date_affectation', 'date_restitution', 'employe_id', 'materiel_id',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    public function materiel()
    {
        return $this->belongsTo(Materiel::class);
    }
}