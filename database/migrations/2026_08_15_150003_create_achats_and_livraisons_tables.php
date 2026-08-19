<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achats', function (Blueprint $table) {
            $table->id();
            $table->string('objet_achat');
            $table->string('numero_achat')->unique();
            $table->string('type_achat')->default('Marché'); // Marché, Bon de commande
            $table->date('date_achat');
            $table->string('statut')->default('En cours'); // En cours, Validé, Livré partiellement, Soldé, Annulé
            $table->foreignId('fournisseur_id')->constrained('fournisseurs')->onDelete('restrict');
            $table->timestamps();
        });

        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->string('numero_facture')->unique();
            $table->date('date_facture');
            $table->decimal('montant_ht', 15, 2)->default(0);
            $table->integer('taux_tva')->default(20);
            $table->decimal('montant_ttc', 15, 2)->default(0);
            $table->foreignId('achat_id')->constrained('achats')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('bordereau_materiels', function (Blueprint $table) {
            $table->id();
            $table->string('nom_materiel');
            $table->text('caracteristiques')->nullable();
            $table->integer('quantite_materiel')->default(1);
            $table->integer('garantie_materiel')->default(12); // en mois
            $table->decimal('prix_unitaire_ht', 15, 2)->default(0);
            $table->foreignId('achat_id')->constrained('achats')->onDelete('cascade');
            $table->foreignId('categorie_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('modele_id')->nullable()->constrained('modeles')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('livraison_stocks', function (Blueprint $table) {
            $table->id();
            $table->integer('quantite_livraison')->default(1);
            $table->date('date_livraison');
            $table->string('reference_livraison'); // ex: BL-2026-001
            $table->foreignId('bordereau_materiel_id')->constrained('bordereau_materiels')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livraison_stocks');
        Schema::dropIfExists('bordereau_materiels');
        Schema::dropIfExists('factures');
        Schema::dropIfExists('achats');
    }
};
