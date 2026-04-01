<?php

declare(strict_types = 1);

use App\Http\Controllers\Clinicas\AppointmentController;
use App\Http\Controllers\Clinicas\ClinicaInvitationController;
use App\Http\Controllers\Clinicas\EmployeeController;
use App\Http\Controllers\Clinicas\ServiceController;
use App\Http\Controllers\Clinicas\SpecialtyController;
use App\Http\Middleware\EnsureClinicaMembership;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::prefix('{current_clinica}')
    ->middleware(['auth', 'verified', EnsureClinicaMembership::class])
    ->group(function (): void {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');

        Route::prefix('specialties')->name('specialties.')->group(function (): void {
            Route::get('/', [SpecialtyController::class, 'index'])->name('index');
            Route::post('/', [SpecialtyController::class, 'store'])->name('store');
            Route::patch('{specialty}', [SpecialtyController::class, 'update'])->name('update');
            Route::delete('{specialty}', [SpecialtyController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('employees')->name('employees.')->group(function (): void {
            Route::get('/', [EmployeeController::class, 'index'])->name('index');
            Route::post('/', [EmployeeController::class, 'store'])->name('store');
            Route::patch('{employee}', [EmployeeController::class, 'update'])->name('update');
            Route::delete('{employee}', [EmployeeController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('services')->name('services.')->group(function (): void {
            Route::get('/', [ServiceController::class, 'index'])->name('index');
            Route::post('/', [ServiceController::class, 'store'])->name('store');
            Route::patch('{service}', [ServiceController::class, 'update'])->name('update');
            Route::delete('{service}', [ServiceController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('appointments')->name('appointments.')->group(function (): void {
            Route::get('/', [AppointmentController::class, 'index'])->name('index');
            Route::post('/', [AppointmentController::class, 'store'])->name('store');
            Route::patch('{appointment}', [AppointmentController::class, 'update'])->name('update');
            Route::delete('{appointment}', [AppointmentController::class, 'destroy'])->name('destroy');
        });
    });

Route::middleware(['auth'])->group(function (): void {
    Route::get('invitations/{invitation}/accept', [ClinicaInvitationController::class, 'accept'])->name('invitations.accept');
});

require __DIR__ . '/settings.php';
