<?php

declare(strict_types = 1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

#[Fillable([
    'occurs_at',
    'observation',
    'status',
    'reason',
    'notes',
    'payment_status',
    'payment_method',
    'patient_id',
    'employee_id',
    'specialty_id',
    'clinica_id',
])]
class Appointment extends Model
{
    /** @use HasFactory<\Database\Factories\AppointmentFactory> */
    use HasFactory;

    /**
     * Get the clinica this appointment belongs to.
     */
    public function clinica(): BelongsTo
    {
        return $this->belongsTo(Clinica::class);
    }

    /**
     * Get the employee assigned to this appointment.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the services associated with this appointment.
     *
     * @return BelongsToMany<Service, $this>
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class)
            ->withPivot(['quantity'])
            ->withTimestamps();
    }

    /**
     * Calculate the total value of this appointment based on its services.
     */
    public function calculateTotal(): float
    {
        $total = $this->services()
            ->selectRaw('SUM(services.price * appointment_service.quantity) as total')
            ->value('total');

        return (float) ($total ?? 0);
    }

    /**
     * Sync services for this appointment and recalculate total.
     *
     * @param array<int, array{service_id: int, quantity: int}> $services
     */
    public function syncServices(array $services): void
    {
        DB::transaction(function () use ($services): void {
            $this->services()->sync(
                collect($services)->mapWithKeys(
                    fn (array $item): array => [$item['service_id'] => ['quantity' => $item['quantity'] ?? 1]],
                )->toArray(),
            );
        });
    }
}
