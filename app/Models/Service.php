<?php

declare(strict_types = 1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'name',
    'description',
    'price',
    'clinica_id',
    'specialty_id',
])]
class Service extends Model
{
    /** @use HasFactory<\Database\Factories\ServiceFactory> */
    use HasFactory;

    /**
     * Get the clinica this service belongs to.
     */
    public function clinica(): BelongsTo
    {
        return $this->belongsTo(Clinica::class);
    }

    /**
     * Get the specialty this service belongs to.
     */
    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }

    /**
     * Get all appointments that include this service.
     *
     * @return BelongsToMany<Appointment, $this>
     */
    public function appointments(): BelongsToMany
    {
        return $this->belongsToMany(Appointment::class)
            ->withPivot(['quantity'])
            ->withTimestamps();
    }
}
