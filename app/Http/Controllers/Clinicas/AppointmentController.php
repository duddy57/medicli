<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Clinicas;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Clinica;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the appointments for the clinica.
     */
    public function index(Request $request, Clinica $currentClinica)
    {
        Gate::authorize('view', $currentClinica);

        $appointments = $currentClinica->appointments()
            ->with(['employee.user', 'specialty', 'services'])
            ->latest('occurs_at')
            ->get()
            ->map(fn (Appointment $appointment): array => [
                'id'             => $appointment->id,
                'occurs_at'      => $appointment->occurs_at,
                'observation'    => $appointment->observation,
                'status'         => $appointment->status,
                'reason'         => $appointment->reason,
                'notes'          => $appointment->notes,
                'payment_status' => $appointment->payment_status,
                'payment_method' => $appointment->payment_method,
                'total'          => $appointment->calculateTotal(),
                'employee'       => $appointment->employee?->user ? [
                    'id'   => $appointment->employee->user->id,
                    'name' => $appointment->employee->user->name,
                ] : null,
                'specialty' => $appointment->specialty ? [
                    'id'    => $appointment->specialty->id,
                    'title' => $appointment->specialty->title,
                ] : null,
                'services' => $appointment->services->map(fn ($service): array => [
                    'id'       => $service->id,
                    'name'     => $service->name,
                    'price'    => (float) $service->price,
                    'quantity' => $service->pivot->quantity,
                    'subtotal' => (float) $service->price * $service->pivot->quantity,
                ])->values(),
            ]);

        return Inertia::render('clinicas/appointments/index', [
            'clinica'      => $currentClinica,
            'appointments' => $appointments,
            'employees'    => $currentClinica->employees()->with('user')->get()->map(fn ($employee): array => [
                'id'   => $employee->id,
                'name' => $employee->user->name,
            ])->values(),
            'specialties' => $currentClinica->specialties()->get()->map(fn (Specialty $specialty): array => [
                'id'    => $specialty->id,
                'title' => $specialty->title,
            ])->values(),
            'services' => $currentClinica->services()->get()->map(fn (\App\Models\Service $service): array => [
                'id'    => $service->id,
                'name'  => $service->name,
                'price' => (float) $service->price,
            ])->values(),
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request, Clinica $currentClinica)
    {
        Gate::authorize('update', $currentClinica);

        $validated = $request->validate([
            'occurs_at'             => ['required', 'date'],
            'observation'           => ['nullable', 'string'],
            'status'                => ['nullable', 'string', 'max:255'],
            'reason'                => ['nullable', 'string', 'max:255'],
            'notes'                 => ['nullable', 'string'],
            'payment_status'        => ['nullable', 'string', 'max:255'],
            'payment_method'        => ['nullable', 'string', 'max:255'],
            'employee_id'           => ['nullable', 'exists:employees,id'],
            'specialty_id'          => ['nullable', 'exists:specialties,id'],
            'services'              => ['required', 'array', 'min:1'],
            'services.*.service_id' => ['required', 'integer', 'exists:services,id'],
            'services.*.quantity'   => ['required', 'integer', 'min:1'],
        ]);

        $services = $validated['services'];
        unset($validated['services']);

        $validated['clinica_id'] = $currentClinica->id;

        $appointment = $currentClinica->appointments()->create($validated);
        $appointment->syncServices($services);

        return back()->with('success', 'Atendimento criado com sucesso.');
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, Clinica $currentClinica, Appointment $appointment)
    {
        Gate::authorize('update', $currentClinica);
        abort_unless($appointment->clinica_id === $currentClinica->id, 404);

        $validated = $request->validate([
            'occurs_at'             => ['required', 'date'],
            'observation'           => ['nullable', 'string'],
            'status'                => ['nullable', 'string', 'max:255'],
            'reason'                => ['nullable', 'string', 'max:255'],
            'notes'                 => ['nullable', 'string'],
            'payment_status'        => ['nullable', 'string', 'max:255'],
            'payment_method'        => ['nullable', 'string', 'max:255'],
            'employee_id'           => ['nullable', 'exists:employees,id'],
            'specialty_id'          => ['nullable', 'exists:specialties,id'],
            'services'              => ['required', 'array', 'min:1'],
            'services.*.service_id' => ['required', 'integer', 'exists:services,id'],
            'services.*.quantity'   => ['required', 'integer', 'min:1'],
        ]);

        $services = $validated['services'];
        unset($validated['services']);

        $appointment->update($validated);
        $appointment->syncServices($services);

        return back()->with('success', 'Atendimento atualizado com sucesso.');
    }

    /**
     * Remove the specified appointment.
     */
    public function destroy(Clinica $currentClinica, Appointment $appointment)
    {
        Gate::authorize('update', $currentClinica);
        abort_unless($appointment->clinica_id === $currentClinica->id, 404);

        $appointment->delete();

        return back()->with('success', 'Atendimento excluído com sucesso.');
    }
}
