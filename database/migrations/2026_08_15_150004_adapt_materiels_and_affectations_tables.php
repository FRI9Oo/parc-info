<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materiels', function (Blueprint $table) {
            $table->foreignId('livraison_stock_id')->nullable()->after('categorie_id')->constrained('livraison_stocks')->onDelete('set null');
            $table->foreignId('modele_id')->nullable()->after('livraison_stock_id')->constrained('modeles')->onDelete('set null');
            $table->foreignId('marque_id')->nullable()->after('modele_id')->constrained('marques')->onDelete('set null');
        });

        Schema::table('affectation_materiels', function (Blueprint $table) {
            $table->foreignId('direction_id')->nullable()->after('materiel_id')->constrained('directions')->onDelete('set null');
            $table->foreignId('departement_id')->nullable()->after('direction_id')->constrained('departements')->onDelete('set null');
            $table->foreignId('division_id')->nullable()->after('departement_id')->constrained('divisions')->onDelete('set null');
            $table->foreignId('service_id')->nullable()->after('division_id')->constrained('services')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('affectation_materiels', function (Blueprint $table) {
            $table->dropForeign(['direction_id']);
            $table->dropForeign(['departement_id']);
            $table->dropForeign(['division_id']);
            $table->dropForeign(['service_id']);
            $table->dropColumn(['direction_id', 'departement_id', 'division_id', 'service_id']);
        });

        Schema::table('materiels', function (Blueprint $table) {
            $table->dropForeign(['livraison_stock_id']);
            $table->dropForeign(['modele_id']);
            $table->dropForeign(['marque_id']);
            $table->dropColumn(['livraison_stock_id', 'modele_id', 'marque_id']);
        });
    }
};
