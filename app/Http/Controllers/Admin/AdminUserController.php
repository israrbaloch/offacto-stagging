<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\Admin\UserStatusChanged;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::with('roles', 'companies');

        // Exclude admin users from the list
        $query->whereDoesntHave('roles', function ($q) {
            $q->where('name', 'admin');
        });

        // Filter by active status
        if ($request->has('status') && $request->status !== '') {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->inactive();
            }
        }

        // Filter by role
        if ($request->has('role') && $request->role !== '') {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Search by name or email
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();
        
        // Exclude admin role from the roles dropdown
        $roles = Role::where('name', '!=', 'admin')->get();

        return view('admin.users.index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        // Prevent viewing admin users
        if ($user->hasRole('admin')) {
            abort(403, 'You cannot view admin users.');
        }

        $user->load([
            'roles',
            'companies.services.statusRelation',
            'companies.customers',
            'companies.offers.statusRelation',
            'companies.invoices.statusRelation',
        ]);

        return view('admin.users.show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        // Prevent editing admin users
        if ($user->hasRole('admin')) {
            abort(403, 'You cannot edit admin users.');
        }

        $user->load('roles');
        
        // Exclude admin role from the roles dropdown
        $roles = Role::where('name', '!=', 'admin')->get();

        return view('admin.users.edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($validated);

        return redirect()
            ->route('admin.users.show', $user)
            ->with('status', 'user-updated');
    }

    /**
     * Toggle the active status of the specified user.
     */
    public function toggleActive(User $user)
    {
        // Prevent actions on admin users
        if ($user->hasRole('admin')) {
            abort(403, 'You cannot modify admin users.');
        }

        // Prevent deactivating yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $wasActive = $user->isActive();
        
        if ($wasActive) {
            $user->deactivate();
        } else {
            $user->activate();
        }

        // Send notification email
        try {
            Mail::to($user->email)->send(new UserStatusChanged($user, !$wasActive));
        } catch (\Exception $e) {
            // Log the error but don't fail the request
            \Log::error('Failed to send user status change email: ' . $e->getMessage());
        }

        $status = $wasActive ? 'user-deactivated' : 'user-activated';

        return back()->with('status', $status);
    }

    /**
     * Assign a role to the specified user.
     */
    public function assignRole(Request $request, User $user)
    {
        // Prevent actions on admin users
        if ($user->hasRole('admin')) {
            abort(403, 'You cannot modify admin users.');
        }

        $validated = $request->validate([
            'role' => ['required', 'exists:roles,id'],
        ]);

        // Prevent assigning admin role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole && $validated['role'] == $adminRole->id) {
            return back()->with('error', 'You cannot assign the admin role.');
        }

        $role = Role::findOrFail($validated['role']);
        
        // Sync the role (replace existing roles)
        $user->roles()->sync([$role->id]);

        return back()->with('status', 'role-updated');
    }
}
