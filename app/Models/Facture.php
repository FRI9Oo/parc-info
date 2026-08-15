<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_facture',
        'date_facture',
        'montant_ht',
        'taux_tva',
        'montant_ttc',
        'achat_id',
    ];

    protected $casts = [
        'date_facture' => 'date:Y-m-d',
        'montant_ht' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
    ];

    public function achat()
    {
        return $this->belongsTo(Achat::class);
    }
}
