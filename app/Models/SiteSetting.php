<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class SiteSetting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
    ];

    /**
     * Cache key for settings.
     */
    protected const CACHE_KEY = 'site_settings';

    /**
     * Get a setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        try {
            if (! Schema::hasTable((new static)->getTable())) {
                return $default;
            }

            $setting = static::where('key', $key)->first();
        } catch (QueryException) {
            return $default;
        }

        if (!$setting) {
            return $default;
        }

        return static::castValue($setting->value, $setting->type);
    }

    /**
     * Set a setting value.
     *
     * @param string $key
     * @param mixed $value
     * @param string $type
     * @return static
     */
    public static function set(string $key, $value, string $type = 'string'): static
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            ['value' => (string) $value, 'type' => $type]
        );

        Cache::forget(static::CACHE_KEY);

        return $setting;
    }

    /**
     * Get a boolean setting value.
     *
     * @param string $key
     * @param bool $default
     * @return bool
     */
    public static function getBoolean(string $key, bool $default = false): bool
    {
        $value = static::get($key, $default);
        
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Get an integer setting value.
     *
     * @param string $key
     * @param int $default
     * @return int
     */
    public static function getInteger(string $key, int $default = 0): int
    {
        return (int) static::get($key, $default);
    }

    /**
     * Get all settings as an array.
     *
     * @return array
     */
    public static function getAllSettings(): array
    {
        return Cache::remember(static::CACHE_KEY, 3600, function () {
            return static::query()->pluck('value', 'key')->toArray();
        });
    }

    /**
     * Get all settings grouped by their group.
     *
     * @return \Illuminate\Support\Collection
     */
    public static function allGrouped()
    {
        return static::query()->get()->groupBy('group');
    }

    /**
     * Cast the value to its proper type.
     *
     * @param mixed $value
     * @param string $type
     * @return mixed
     */
    protected static function castValue($value, string $type)
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Clear the settings cache.
     *
     * @return void
     */
    public static function clearCache(): void
    {
        Cache::forget(static::CACHE_KEY);
    }
}
