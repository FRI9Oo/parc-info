<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departement extends Model
{
    protected $fillable = ['nom_departement', 'direction_id'];

    public function direction()
    {
        return $this->belongsTo(Direction::class);
    }

    public function divisions()
    {
        return $this->hasMany(Division::class);
    }
}
