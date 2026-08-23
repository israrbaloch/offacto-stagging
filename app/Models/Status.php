<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $table = 'status';
    protected $fillable = [
        'name',
        'for',
    ];

    /**
     * Get the services for this status.
     */
    public function services()
    {
        return $this->hasMany(Service::class, 'status');
    }

    /**
     * Scope a query to only include statuses for a specific table/model.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $for
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForTable($query, string $for)
    {
        return $query->where('for', $for);
    }

    /**
     * Get statuses for a specific table/model.
     *
     * @param string $for
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function forTable(string $for)
    {
        return static::where('for', $for)->get();
    }
}
