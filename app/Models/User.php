<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * Check if the user has a specific role.
     *
     * @param  string  $role
     * @return bool
     */
    public function hasRole(string $role): bool
    {
        return $this->roles->contains('name', $role);
    }

    /**
     * Check if the user has any of the given roles.
     *
     * @param  array|string  $roles
     * @return bool
     */
    public function hasAnyRole($roles): bool
    {
        if (is_string($roles)) {
            $roles = explode('|', $roles);
        }

        foreach ($roles as $role) {
            if ($this->hasRole(trim($role))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the user has all of the given roles.
     *
     * @param  array|string  $roles
     * @return bool
     */
    public function hasAllRoles($roles): bool
    {
        if (is_string($roles)) {
            $roles = explode('|', $roles);
        }

        foreach ($roles as $role) {
            if (!$this->hasRole(trim($role))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all permissions for the user through their roles.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getPermissions()
    {
        return $this->roles->flatMap->permissions->pluck('name')->unique();
    }

    /**
     * Check if the user has a specific permission.
     *
     * @param  string  $permission
     * @return bool
     */
    public function hasPermission(string $permission): bool
    {
        return $this->getPermissions()->contains($permission);
    }

    /**
     * Check if the user has any of the given permissions.
     *
     * @param  array|string  $permissions
     * @return bool
     */
    public function hasAnyPermission($permissions): bool
    {
        if (is_string($permissions)) {
            $permissions = explode('|', $permissions);
        }

        foreach ($permissions as $permission) {
            if ($this->hasPermission(trim($permission))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the user has all of the given permissions.
     *
     * @param  array|string  $permissions
     * @return bool
     */
    public function hasAllPermissions($permissions): bool
    {
        if (is_string($permissions)) {
            $permissions = explode('|', $permissions);
        }

        foreach ($permissions as $permission) {
            if (!$this->hasPermission(trim($permission))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the companies for the user.
     */
    public function companies()
    {
        return $this->hasMany(Company::class);
    }

    /**
     * Get the user's primary (first) company.
     *
     * @return Company|null
     */
    public function primaryCompany()
    {
        return $this->companies()->first();
    }

    /**
     * Get the user's active company.
     * Checks session for selected company, falls back to primary company.
     *
     * @return Company|null
     */
    public function activeCompany()
    {
        $activeCompanyId = $this->getActiveCompanyId();
        
        if ($activeCompanyId) {
            $company = $this->companies()->find($activeCompanyId);
            if ($company) {
                return $company;
            }
        }
        
        // Fall back to primary company
        return $this->primaryCompany();
    }

    /**
     * Get the active company ID from session.
     *
     * @return int|null
     */
    public function getActiveCompanyId(): ?int
    {
        return session('active_company_id');
    }

    /**
     * Set the active company ID in session.
     *
     * @param int $companyId
     * @return void
     */
    public function setActiveCompanyId(int $companyId): void
    {
        // Validate that the company belongs to this user
        if ($this->companies()->where('id', $companyId)->exists()) {
            session(['active_company_id' => $companyId]);
        }
    }

    /**
     * Get company settings through the active company.
     *
     * @return CompanySetting|null
     */
    public function companySettings()
    {
        $company = $this->activeCompany();
        return $company ? $company->companySetting : null;
    }

    /**
     * Scope a query to only include active users.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include inactive users.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Activate the user.
     *
     * @return bool
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the user.
     *
     * @return bool
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Check if the user is active.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    /**
     * Check if the user has at least one active (approved) company.
     * Treats companies with is_active=true and status=null as active (legacy / no approval workflow).
     *
     * @return bool
     */
    public function hasActiveCompany(): bool
    {
        $approvedStatus = \App\Models\Status::where('name', 'Approved')->where('for', 'companies')->first();
        $query = $this->companies()->where('is_active', true);
        if ($approvedStatus) {
            $query->where(function ($q) use ($approvedStatus) {
                $q->where('status', $approvedStatus->id)->orWhereNull('status');
            });
        }
        return $query->exists();
    }

}
