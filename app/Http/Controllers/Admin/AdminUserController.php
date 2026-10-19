<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'role' => ['nullable', 'string', Rule::exists('roles', 'name')],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'all'])],
            'verified' => ['nullable', Rule::in(['yes', 'no', 'all'])],
        ]);

        $query = User::query()->with('roles:id,name');

        if ($search = trim($filters['q'] ?? '')) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['role'])) {
            $query->whereHas('roles', fn ($q) => $q->where('name', $filters['role']));
        }

        $status = $filters['status'] ?? 'all';
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $verified = $filters['verified'] ?? 'all';
        if ($verified === 'yes') {
            $query->whereNotNull('email_verified_at');
        } elseif ($verified === 'no') {
            $query->whereNull('email_verified_at');
        }

        $users = $query
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user) => $this->userListRow($user));

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'q' => $filters['q'] ?? '',
                'role' => $filters['role'] ?? '',
                'status' => $status,
                'verified' => $verified,
            ],
            'roles' => Role::query()->orderBy('name')->pluck('name'),
        ]);
    }

    public function show(User $user): Response
    {
        $user->load([
            'roles:id,name',
            'roles.permissions:id,name',
            'companies:id,user_id,company_name,subscription_plan,is_active,status',
            'companies.statusRelation:id,name',
        ]);

        $activity = ActivityLog::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere(function ($inner) use ($user) {
                        $inner->where('subject_type', $user->getMorphClass())
                            ->where('subject_id', $user->id);
                    });
            })
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (ActivityLog $log) => $this->logRow($log));

        $security = SecurityEvent::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('email', $user->email);
            })
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (SecurityEvent $event) => $this->securityRow($event));

        return Inertia::render('Admin/Users/Show', [
            'profile' => $this->userProfile($user),
            'allRoles' => Role::query()->orderBy('name')->get(['id', 'name']),
            'activity' => $activity,
            'security' => $security,
            'sessions' => $this->sessionRows($user),
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load('roles:id,name');

        return Inertia::render('Admin/Users/Edit', [
            'profile' => $this->userProfile($user),
            'roles' => Role::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'billing_reminders_enabled' => ['sometimes', 'boolean'],
        ]);

        $user->update($data);

        ActivityLog::record('admin.user.updated', subject: $user, metadata: [
            'fields' => array_keys($data),
        ]);

        return redirect()->route('admin.users.show', $user)->with('status', 'user-saved');
    }

    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $actor = Auth::user();

        if ($actor && $actor->id === $user->id) {
            return back()->with('error', 'You cannot change your own active status.');
        }

        if ($user->isActive() && $user->hasRole('admin') && $this->activeAdminCount() <= 1) {
            return back()->with('error', 'At least one active platform admin is required.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        ActivityLog::record(
            $user->is_active ? 'admin.user.reactivated' : 'admin.user.suspended',
            subject: $user,
            metadata: filled($data['reason'] ?? null) ? ['reason' => $data['reason']] : null,
        );

        return back()->with('status', $user->is_active ? 'user-reactivated' : 'user-suspended');
    }

    public function sendPasswordReset(User $user): RedirectResponse
    {
        app(EmailOtpService::class)->issue($user, EmailOtpService::PURPOSE_PASSWORD_RESET);

        ActivityLog::record('admin.user.password_reset_sent', subject: $user);

        return back()->with('status', 'password-reset-sent');
    }

    public function verifyEmail(User $user): RedirectResponse
    {
        if ($user->email_verified_at) {
            return back()->with('status', 'user-already-verified');
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        ActivityLog::record('admin.user.email_verified', subject: $user);

        return back()->with('status', 'user-email-verified');
    }

    public function unverifyEmail(User $user): RedirectResponse
    {
        $user->forceFill(['email_verified_at' => null])->save();

        ActivityLog::record('admin.user.email_unverified', subject: $user);

        return back()->with('status', 'user-email-unverified');
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->forceFill(['password' => $data['password']])->save();

        ActivityLog::record('admin.user.password_set', subject: $user);

        return back()->with('status', 'user-password-updated');
    }

    public function revokeSessions(User $user): RedirectResponse
    {
        $deleted = DB::table('sessions')->where('user_id', $user->id)->delete();

        ActivityLog::record('admin.user.sessions_revoked', subject: $user, metadata: [
            'count' => $deleted,
        ]);

        return back()->with('status', 'user-sessions-revoked');
    }

    public function toggleBillingReminders(User $user): RedirectResponse
    {
        $user->update([
            'billing_reminders_enabled' => ! $user->billing_reminders_enabled,
        ]);

        ActivityLog::record('admin.user.billing_reminders_toggled', subject: $user, metadata: [
            'enabled' => (bool) $user->billing_reminders_enabled,
        ]);

        return back()->with('status', 'user-billing-reminders-updated');
    }

    public function syncRoles(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'role_ids' => ['required', 'array'],
            'role_ids.*' => ['integer', Rule::exists('roles', 'id')],
        ]);

        $roleIds = collect($data['role_ids'])->unique()->values()->all();
        $roles = Role::query()->whereIn('id', $roleIds)->pluck('name');

        $actor = Auth::user();
        $removingAdmin = $user->hasRole('admin') && ! $roles->contains('admin');

        if ($removingAdmin) {
            if ($actor && $actor->id === $user->id) {
                return back()->with('error', 'You cannot remove the admin role from yourself.');
            }
            if ($this->activeAdminCount() <= 1 && $user->isActive()) {
                return back()->with('error', 'At least one active platform admin is required.');
            }
        }

        $user->roles()->sync($roleIds);

        ActivityLog::record('admin.user.roles_updated', subject: $user, metadata: [
            'roles' => $roles->values()->all(),
        ]);

        return back()->with('status', 'user-roles-saved');
    }

    protected function activeAdminCount(): int
    {
        return User::query()
            ->where('is_active', true)
            ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
            ->count();
    }

    /**
     * @return array<string, mixed>
     */
    protected function userListRow(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_active' => (bool) $user->is_active,
            'email_verified' => (bool) $user->email_verified_at,
            'roles' => $user->roles->pluck('name')->values()->all(),
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function userProfile(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_active' => (bool) $user->is_active,
            'billing_reminders_enabled' => (bool) $user->billing_reminders_enabled,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'updated_at' => $user->updated_at?->toIso8601String(),
            'permissions' => $user->getPermissions()->values()->all(),
            'roles' => $user->roles->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
            ])->values()->all(),
            'companies' => $user->companies->map(fn ($company) => [
                'id' => $company->id,
                'name' => $company->company_name,
                'subscription_plan' => $company->subscription_plan,
                'is_active' => (bool) $company->is_active,
                'approval_status' => $company->statusRelation?->name,
            ])->values()->all(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function sessionRows(User $user): array
    {
        return DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->limit(15)
            ->get()
            ->map(function ($row) {
                return [
                    'id' => $row->id,
                    'ip_address' => $row->ip_address,
                    'user_agent' => $row->user_agent ? substr($row->user_agent, 0, 120) : null,
                    'last_activity' => $row->last_activity
                        ? Carbon::createFromTimestamp((int) $row->last_activity)->toIso8601String()
                        : null,
                ];
            })
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    protected function logRow(ActivityLog $log): array
    {
        return [
            'id' => $log->id,
            'action' => $log->action,
            'outcome' => $log->outcome,
            'ip_address' => $log->ip_address,
            'created_at' => $log->created_at?->toIso8601String(),
            'metadata' => $log->metadata,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function securityRow(SecurityEvent $event): array
    {
        return [
            'id' => $event->id,
            'event_type' => $event->event_type,
            'outcome' => $event->outcome,
            'ip_address' => $event->ip_address,
            'created_at' => $event->created_at?->toIso8601String(),
            'metadata' => $event->metadata,
        ];
    }
}
