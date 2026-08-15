<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BordereauMateriel extends Model
{
    use HasFactory;

    protected $table = 'bordereau_materiels';

    protected $fillable = [
        'nom_materiel',
        'caracteristiques',
        'quantite_materiel',
        'garantie_materiel',
        'prix_unitaire_ht',
        'achat_id',
        'categorie_id',
        'modele_id',
    ];

    protected $casts = [
        'prix_unitaire_ht' => 'decimal:2',
        'quantite_materiel' => 'integer',
        'garantie_materiel' => 'integer',
    ];

    public function achat()
    {
        return $this->belongsTo(Achat::class);
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function modele()
    {
        return $this->belongsTo(Modele::class);
    }

    public function livraisons()
    {
        return $this->hasMany(LivraisonStock::class, 'bordereau_materiel_id');
    }

    // Helper: Total quantity delivered so far
    public function getQuantiteLivreeAttribute()
    {
        return $this->livraisons->sum('quantite_livraison');
    }

    // Helper: Remaining quantity to deliver
    public function getQuantiteRestanteAttribute()
    {
        return max(0, $this->quantite_materiel - $this->quantite_livree);
    }
}
