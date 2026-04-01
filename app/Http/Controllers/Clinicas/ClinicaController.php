<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Clinicas;

use App\Actions\Clinica\CreateClinica;
use App\Enums\ClinicaRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Clinicas\DeleteClinicaRequest;
use App\Http\Requests\Clinicas\SaveClinicaRequest;
use App\Models\Clinica;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClinicaController extends Controller
{
    /**
     * Display a listing of the user's clinicas.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('clinicas/index', [
            'clinicas' => $user->toUserClinicas(includeCurrent: true),
        ]);
    }

    /**
     * Store a newly created clinica.
     */
    public function store(SaveClinicaRequest $request, CreateClinica $createClinica): RedirectResponse
    {
        $clinica = $createClinica->handle($request->user(), $request->validated());

        return to_route('clinicas.edit', ['clinica' => $clinica->slug]);
    }

    /**
     * Show the clinica edit page.
     */
    public function edit(Request $request, Clinica $clinica): Response
    {
        $user = $request->user();

        return Inertia::render('clinicas/edit', [
            'clinica' => [
                'id'         => $clinica->id,
                'name'       => $clinica->name,
                'slug'       => $clinica->slug,
                'isPersonal' => $clinica->is_personal,
                'publicId'   => $clinica->public_id,
            ],
            'members' => $clinica->members()->get()->map(fn ($member): array => [
                'id'         => $member->id,
                'name'       => $member->name,
                'email'      => $member->email,
                'avatar'     => $member->avatar ?? null,
                'role'       => $member->pivot->role->value,
                'role_label' => $member->pivot->role?->label(),
            ]),
            'invitations' => $clinica->invitations()
                ->whereNull('accepted_at')
                ->get()
                ->map(fn ($invitation): array => [
                    'code'       => $invitation->code,
                    'email'      => $invitation->email,
                    'role'       => $invitation->role->value,
                    'role_label' => $invitation->role->label(),
                    'created_at' => $invitation->created_at->toISOString(),
                ]),
            'permissions'    => $user->toClinicaPermissions($clinica),
            'availableRoles' => ClinicaRole::assignable(),
        ]);
    }

    /**
     * Update the specified clinica.
     */
    public function update(SaveClinicaRequest $request, Clinica $clinica): RedirectResponse
    {
        Gate::authorize('update', $clinica);

        $clinica = DB::transaction(function () use ($request, $clinica) {
            $clinica = Clinica::whereKey($clinica->id)->lockForUpdate()->firstOrFail();

            $clinica->update(['name' => $request->validated('name')]);

            return $clinica;
        });

        return to_route('clinicas.edit', ['clinica' => $clinica->slug]);
    }

    /**
     * Switch the user's current clinica.
     */
    public function switch(Request $request, Clinica $clinica): RedirectResponse
    {
        abort_unless($request->user()->belongsToClinica($clinica), 403);

        $request->user()->switchClinica($clinica);

        return back();
    }

    /**
     * Delete the specified clinica.
     */
    public function destroy(DeleteClinicaRequest $request, Clinica $clinica): RedirectResponse
    {
        $user            = $request->user();
        $fallbackClinica = $user->isCurrentClinica($clinica)
            ? $user->fallbackClinica($clinica)
            : null;

        DB::transaction(function () use ($user, $clinica): void {
            User::where('current_clinica_id', $clinica->id)
                ->where('id', '!=', $user->id)
                ->each(fn (User $affectedUser): bool => $affectedUser->switchClinica($affectedUser->personalClinica()));

            $clinica->invitations()->delete();
            $clinica->memberships()->delete();
            $clinica->delete();
        });

        if ($fallbackClinica) {
            $user->switchClinica($fallbackClinica);
        }

        return to_route('clinicas.index');
    }
}
