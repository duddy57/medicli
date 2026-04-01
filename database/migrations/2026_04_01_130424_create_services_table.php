<?php

declare(strict_types = 1);

use App\Models\Clinica;
use App\Models\Specialty;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table): void {
            $table->id();

            $table->string('name');
            $table->string('description');

            $table->decimal('price', 10, 2);

            $table->foreignIdFor(Clinica::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Specialty::class)->nullable()->constrained()->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
