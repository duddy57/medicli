<?php

declare(strict_types = 1);

use App\Models\Clinica;
use App\Models\Employee;
use App\Models\Patient;
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
        Schema::create('appointments', function (Blueprint $table): void {
            $table->id();

            $table->timestamp('occurs_at')->useCurrent();
            $table->string('observation')->nullable();
            $table->string('status')->nullable();
            $table->string('reason')->nullable();
            $table->string('notes')->nullable();

            $table->decimal('price', 10, 2)->nullable();
            $table->string('payment_status')->nullable();
            $table->string('payment_method')->nullable();

            $table->foreignIdFor(Patient::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Employee::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Specialty::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Clinica::class)->constrained()->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
