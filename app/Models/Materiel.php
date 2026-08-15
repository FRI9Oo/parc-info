<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materiel extends Model
{
    protected $fillable = [
        'nom', 'marque', 'modele', 'numero_serie',
        'numero_inventaire', 'caracteristique', 'categorie_id',
        'achat_id', 'livraison_stock_id', 'modele_id', 'marque_id',
    ];

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function achat()
    {
        return $this->belongsTo(Achat::class, 'achat_id');
    }

    public function livraisonStock()
    {
        return $this->belongsTo(LivraisonStock::class, 'livraison_stock_id');
    }

    public function modeleRel()
    {
        return $this->belongsTo(Modele::class, 'modele_id');
    }

    public function marqueRel()
    {
        return $this->belongsTo(Marque::class, 'marque_id');
    }

    public function affectations()
    {
        return $this->hasMany(AffectationMateriel::class);
    }
}
