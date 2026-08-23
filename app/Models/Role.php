<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the permissions for the role.
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    /**
     * Get the users that have this role.
     */
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Check if the role has a specific permission.
     *
     * @param  string  $permission
     * @return bool
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions->contains('name', $permission);
    }

    /**
     * Give a permission to the role.
     *
     * @param  string|Permission  $permission
     * @return void
     */
    public function givePermission($permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        if (!$this->hasPermission($permission->name)) {
            $this->permissions()->attach($permission);
        }
    }

    /**
     * Revoke a permission from the role.
     *
     * @param  string|Permission  $permission
     * @return void
     */
    public function revokePermission($permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->detach($permission);
    }
}
