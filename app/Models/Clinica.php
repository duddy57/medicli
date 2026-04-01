<?php

declare(strict_types = 1);

namespace App\Models;

use App\Concerns\GeneratesUniqueClinicaSlugs;
use App\Enums\ClinicaRole;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'slug', 'is_personal', 'public_id', 'owner_id'])]
class Clinica extends Model
{
    use GeneratesUniqueClinicaSlugs;
    use HasFactory;
    use SoftDeletes;

    /**
     * Bootstrap the model and its traits.
     */
    #[\Override]
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Clinica $clinica): void {
            if (empty($clinica->slug)) {
                $clinica->slug = self::generateUniqueClinicaSlug($clinica->name);
            }

            if (empty($clinica->public_id)) {
                $clinica->public_id = (string) \Illuminate\Support\Str::uuid();
            }
        });

        static::updating(function (Clinica $clinica): void {
            if ($clinica->isDirty('name')) {
                $clinica->slug = self::generateUniqueClinicaSlug($clinica->name, $clinica->id);
            }
        });
    }

    /**
     * Get the Clinica owner.
     */
    public function owner(): ?Model
    {
        return $this->members()
            ->wherePivot('role', ClinicaRole::Owner->value)
            ->first();
    }

    /**
     * Get all members of this Clinica.
     *
     * @return BelongsToMany<Model, $this>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'clinica_members', 'clinica_id', 'user_id')
            ->using(Membership::class)
            ->withPivot(['role'])
            ->withTimestamps();
    }

    /**
     * Get all memberships for this Clinica.
     *
     * @return HasMany<Membership, $this>
     */
    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    /**
     * Get all invitations for this Clinica.
     *
     * @return HasMany<ClinicaInvitation, $this>
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(ClinicaInvitation::class);
    }

    public function specialties(): HasMany
    {
        return $this->hasMany(Specialty::class);
    }

    /**
     * Get all employees for this Clinica.
     *
     * @return HasMany<Employee, $this>
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * Get all services for this Clinica.
     *
     * @return HasMany<Service, $this>
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get all appointments for this Clinica.
     *
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    #[\Override]
    protected function casts(): array
    {
        return [
            'is_personal' => 'boolean',
        ];
    }

    /**
     * Get the route key for the model.
     */
    #[\Override]
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
