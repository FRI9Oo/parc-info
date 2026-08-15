<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LivraisonStock extends Model
{
    use HasFactory;

    protected $table = 'livraison_stocks';

    protected $fillable = [
        'quantite_livraison',
        'date_livraison',
        'reference_livraison',
        'bordereau_materiel_id',
    ];

    protected $casts = [
        'date_livraison' => 'date:Y-m-d',
        'quantite_livraison' => 'integer',
    ];

    public function bordereau()
    {
        return $this->belongsTo(BordereauMateriel::class, 'bordereau_materiel_id');
    }

    public function materiels()
    {
        return $this->hasMany(Materiel::class, 'livraison_stock_id');
    }
}
