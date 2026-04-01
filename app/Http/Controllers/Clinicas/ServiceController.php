<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Clinicas;

use App\Http\Controllers\Controller;
use App\Models\Clinica;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of the services for the clinica.
     */
    public function index(Request $request, Clinica $currentClinica)
    {
        Gate::authorize('view', $currentClinica);

        return Inertia::render('clinicas/services/index', [
            'clinica'     => $currentClinica,
            'services'    => $currentClinica->services()->with('specialty')->latest()->get(),
            'specialties' => $currentClinica->specialties()->get(['id', 'title'])->values(),
        ]);
    }

    /**
     * Store a newly created service.
     */
    public function store(Request $request, Clinica $currentClinica)
    {
        Gate::authorize('update', $currentClinica);

        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'price'        => ['required', 'numeric', 'min:0'],
            'specialty_id' => ['nullable', 'exists:specialties,id'],
        ]);

        $currentClinica->services()->create($validated);

        return back()->with('success', 'Serviço criado com sucesso.');
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Clinica $currentClinica, Service $service)
    {
        Gate::authorize('update', $currentClinica);
        abort_unless($service->clinica_id === $currentClinica->id, 404);

        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'price'        => ['required', 'numeric', 'min:0'],
            'specialty_id' => ['nullable', 'exists:specialties,id'],
        ]);

        $service->update($validated);

        return back()->with('success', 'Serviço atualizado com sucesso.');
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Clinica $currentClinica, Service $service)
    {
        Gate::authorize('update', $currentClinica);
        abort_unless($service->clinica_id === $currentClinica->id, 404);

        $service->delete();

        return back()->with('success', 'Serviço excluído com sucesso.');
    }
}
