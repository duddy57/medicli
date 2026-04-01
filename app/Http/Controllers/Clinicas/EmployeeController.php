<?php

declare(strict_types=1);

namespace App\Http\Controllers\Clinicas;

use App\Http\Controllers\Controller;
use App\Models\Clinica;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request, Clinica $currentClinica)
    {
        Gate::authorize('view', $currentClinica);

        return Inertia::render('clinicas/employees/index', [
            'clinica'   => $currentClinica,
            'employees' => $currentClinica->employees()->with('user')->get(),
            'users'     => User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request, Clinica $currentClinica)
    {
        Gate::authorize('update', $currentClinica);

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role'    => ['required', 'in:owner,admin,doctor,member'],
        ]);

        $currentClinica->employees()->create($validated);

        return back()->with('success', 'Funcionário criado.');
    }

    public function update(Request $request, Clinica $currentClinica, Employee $employee)
    {
        Gate::authorize('update', $currentClinica);
        abort_unless($employee->clinica_id === $currentClinica->id, 404);

        $validated = $request->validate([
            'role' => ['required', 'in:owner,admin,doctor,member'],
        ]);

        $employee->update($validated);

        return back()->with('success', 'Funcionário atualizado.');
    }

    public function destroy(Clinica $currentClinica, Employee $employee)
    {
        Gate::authorize('update', $currentClinica);
        abort_unless($employee->clinica_id === $currentClinica->id, 404);

        $employee->delete();

        return back()->with('success', 'Funcionário removido.');
    }
}