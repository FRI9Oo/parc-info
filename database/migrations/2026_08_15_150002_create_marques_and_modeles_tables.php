<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marques', function (Blueprint $table) {
            $table->id();
            $table->string('nom_marque')->unique();
            $table->timestamps();
        });

        Schema::create('modeles', function (Blueprint $table) {
            $table->id();
            $table->string('nom_modele');
            $table->foreignId('marque_id')->constrained('marques')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modeles');
        Schema::dropIfExists('marques');
    }
};
