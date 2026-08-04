<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AffectationMateriel extends Model
{
    protected $fillable = [
        'date_affectation', 'date_restitution', 'employe_id', 'materiel_id',
    ];

    protected $casts = [
        'date_affectation' => 'date:Y-m-d',
        'date_restitution' => 'date:Y-m-d',
    ];

    // Automatically included when the model is serialized to Inertia/JSON
    protected $appends = ['etat'];

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    public function materiel()
    {
        return $this->belongsTo(Materiel::class);
    }

    /**
     * "Affecté" while date_restitution is null, "Clôturé" once it's set.
     */
    public function getEtatAttribute()
    {
        return is_null($this->date_restitution) ? 'Affecté' : 'Clôturé';
    }
}