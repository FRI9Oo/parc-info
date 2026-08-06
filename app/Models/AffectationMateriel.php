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
     * Note: this is the administrative status of the record. It's still
     * possible for a "Clôturé" record to represent a matériel that is
     * physically not yet returned — see scopeOccupantMateriel().
     */
    // app/Models/AffectationMateriel.php

    public function getEtatAttribute()
    {
        if (is_null($this->date_restitution)) {
            return 'Affecté';
        }

        // Still considered "Affecté" until the restitution date is actually reached
        return $this->date_restitution->format('Y-m-d') > now()->toDateString()
            ? 'Affecté'
            : 'Clôturé';
    }
    /**
     * Affectations that still hold the matériel today: either never
     * clôturée, or clôturée with a restitution date that hasn't arrived
     * yet. This is the single source of truth for "is this matériel
     * currently unavailable" — used everywhere availability is checked
     * so a matériel can never end up assigned to two employees at once.
     */
    public function scopeOccupantMateriel($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('date_restitution')
              ->orWhereDate('date_restitution', '>', now()->toDateString());
        });
    }
}