<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('materiels', function (Blueprint $table) {
        $table->id();
        $table->string('nom');
        $table->string('marque');
        $table->string('modele');
        $table->string('numero_serie')->unique();
        $table->string('numero_inventaire')->unique();
        $table->text('caracteristique')->nullable();
        $table->foreignId('categorie_id')->constrained('categories')->cascadeOnDelete();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materiels');
    }
};
