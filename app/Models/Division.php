<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    protected $fillable = ['nom_division', 'departement_id'];

    public function departement()
    {
        return $this->belongsTo(Departement::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
