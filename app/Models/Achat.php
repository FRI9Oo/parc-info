<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achat extends Model
{
    use HasFactory;

    protected $fillable = [
        'objet_achat',
        'numero_achat',
        'type_achat',
        'date_achat',
        'statut',
        'fournisseur_id',
    ];

    protected $casts = [
        'date_achat' => 'date:Y-m-d',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function factures()
    {
        return $this->hasMany(Facture::class);
    }

    public function bordereaux()
    {
        return $this->hasMany(BordereauMateriel::class);
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class);
    }

    // Helper: Total HT and TTC based on bordereaux or factures
    public function getTotalHtAttribute()
    {
        return $this->bordereaux->sum(function ($item) {
            return $item->prix_unitaire_ht * $item->quantite_materiel;
        });
    }
}
