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
    Schema::create('affectation_materiels', function (Blueprint $table) {
        $table->id();
        $table->date('date_affectation');
        $table->date('date_restitution')->nullable();
        $table->foreignId('employe_id')->constrained('employes')->cascadeOnDelete();
        $table->foreignId('materiel_id')->constrained('materiels')->cascadeOnDelete();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affectation_materiels');
    }
};
