<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class AffectationMateriel extends Model
{
    protected $fillable = [
        'date_affectation', 'date_restitution', 'employe_id', 'materiel_id',
    ];

    protected $casts = [
        'date_affectation' => 'date:Y-m-d',
        'date_restitution' => 'date:Y-m-d',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    public function materiel()
    {
        return $this->belongsTo(Materiel::class);
    }

    // Check if affectation is pending (future affectation date)
    public function isPending()
    {
        return $this->date_affectation->gt(now());
    }

    // Check if restitution is completed (past date)
    public function isCompleted()
    {
        return !is_null($this->date_restitution) && $this->date_restitution->lte(now());
    }

    // Check if currently active (affectation date passed, no restitution or future restitution)
    public function isActive()
    {
        return $this->date_affectation->lte(now()) && 
               (is_null($this->date_restitution) || $this->date_restitution->gt(now()));
    }

    // Get status label
    public function getStatusAttribute()
    {
        if ($this->isPending()) {
            return 'En attente';
        }
        
        if ($this->isCompleted()) {
            return 'Restitué';
        }
        
        return 'En cours';
    }

    // Get status color class
    public function getStatusColorAttribute()
    {
        if ($this->isPending()) {
            return 'text-blue-700 bg-blue-50';
        }
        
        if ($this->isCompleted()) {
            return 'text-gray-500 bg-gray-100';
        }
        
        return 'text-green-700 bg-green-50';
    }

    // Scope for pending affectations
    public function scopePending(Builder $query)
    {
        return $query->where('date_affectation', '>', Carbon::today());
    }

    // Scope for currently active affectations
    public function scopeActive(Builder $query)
    {
        return $query->where('date_affectation', '<=', Carbon::today())
                    ->where(function ($q) {
                        $q->whereNull('date_restitution')
                          ->orWhere('date_restitution', '>', Carbon::today());
                    });
    }

    // Scope for completed affectations
    public function scopeCompleted(Builder $query)
    {
        return $query->where('date_restitution', '<=', Carbon::today());
    }
}