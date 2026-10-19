<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\SiteSetting;
use App\Support\PlatformSettingsRegistry;
use App\Support\PublicStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PlatformSettingsService
{
    public function valuesForSection(string $sectionId, string $registry = PlatformSettingsRegistry::class): array
    {
        $def = $registry::definition($sectionId);
        if (! $def) {
            abort(404);
        }

        $values = [];
        foreach ($def['fields'] as $field) {
            $key = $field['key'];
            $default = $field['default'] ?? null;
            $fieldType = $field['type'] ?? 'string';

            if ($fieldType === 'upload') {
                $path = SiteSetting::get($key) ?: SiteSetting::get($key.'_path');
                if (! filled($path) && $key === 'platform_logo') {
                    $legacy = SiteSetting::get('platform_logo_url');
                    $values[$key.'_preview_url'] = filled($legacy) ? $legacy : null;
                } else {
                    $values[$key.'_preview_url'] = PublicStorage::url($path);
                }
                $values[$key] = $path ?? '';

                continue;
            }

            $type = $this->storageType($fieldType);
            $values[$key] = match ($type) {
                'boolean' => SiteSetting::getBoolean($key, (bool) $default),
                'integer' => SiteSetting::getInteger($key, (int) ($default ?? 0)),
                'json' => $this->readJson($key, $default),
                default => SiteSetting::get($key, $default ?? ''),
            };
        }

        if ($sectionId === 'payment-gateway') {
            $values['payment_mollie_test_key'] = '';
            $values['payment_mollie_live_key'] = '';
            $values['payment_mollie_test_key_set'] = filled(SiteSetting::get('payment_mollie_test_key'));
            $values['payment_mollie_live_key_set'] = filled(SiteSetting::get('payment_mollie_live_key'));
        }

        return $values;
    }

    /**
     * @return array<string, mixed>
     */
    public function validateSection(string $sectionId, Request $request, string $registry = PlatformSettingsRegistry::class): array
    {
        $def = $registry::definition($sectionId);
        if (! $def) {
            abort(404);
        }

        $rules = [];
        foreach ($def['fields'] as $field) {
            $key = $field['key'];
            $fieldType = $field['type'] ?? 'string';
            if ($fieldType === 'upload') {
                continue;
            }
            if ($fieldType === 'password' && empty($request->input($key))) {
                continue;
            }
            $rules[$key] = $this->rulesForField($field);
        }

        return Validator::make($request->all(), $rules)->validate();
    }

    public function persistSection(string $sectionId, array $data, string $registry = PlatformSettingsRegistry::class, string $auditAction = 'admin.settings.updated'): void
    {
        $def = $registry::definition($sectionId);
        if (! $def) {
            abort(404);
        }

        foreach ($def['fields'] as $field) {
            $key = $field['key'];
            $fieldType = $field['type'] ?? 'string';
            if ($fieldType === 'upload') {
                continue;
            }
            if ($fieldType === 'password') {
                if (! filled($data[$key] ?? null)) {
                    continue;
                }
            }
            if (! array_key_exists($key, $data)) {
                continue;
            }

            $type = $this->storageType($field['type']);
            $value = $data[$key];

            if ($type === 'json' && is_array($value)) {
                SiteSetting::set($key, json_encode($value), 'json');
            } elseif ($type === 'boolean') {
                SiteSetting::set($key, $value ? '1' : '0', 'boolean');
            } elseif ($type === 'integer') {
                SiteSetting::set($key, (string) (int) $value, 'integer');
            } else {
                SiteSetting::set($key, (string) $value);
            }
        }

        SiteSetting::clearCache();

        ActivityLog::record($auditAction, metadata: [
            'section' => $sectionId,
            'keys' => array_keys($data),
        ]);
    }

    public function handleUploads(string $sectionId, Request $request, string $registry = PlatformSettingsRegistry::class): void
    {
        $def = $registry::definition($sectionId);
        if (! $def) {
            return;
        }

        foreach ($def['fields'] as $field) {
            if (($field['type'] ?? '') !== 'upload') {
                continue;
            }
            $key = $field['key'];
            if (! $request->hasFile($key)) {
                continue;
            }

            $mimes = ($field['accept'] ?? 'image') === 'favicon'
                ? 'jpeg,png,jpg,gif,svg,webp,ico,x-icon'
                : 'jpeg,png,jpg,gif,svg,webp';

            $request->validate([
                $key => ['file', 'mimes:'.$mimes, 'max:2048'],
            ]);

            $old = SiteSetting::get($key);
            if (filled($old)) {
                Storage::disk('public')->delete($old);
            }

            $path = $request->file($key)->store('platform/'.str_replace('_', '-', $key), 'public');
            SiteSetting::set($key, $path);
        }

        SiteSetting::clearCache();
    }

    public function resetSection(string $sectionId, string $registry = PlatformSettingsRegistry::class, string $auditResetAction = 'admin.settings.reset'): void
    {
        $def = $registry::definition($sectionId);
        if (! $def) {
            abort(404);
        }

        foreach ($def['fields'] as $field) {
            if (($field['type'] ?? '') === 'upload') {
                $key = $field['key'];
                $old = SiteSetting::get($key);
                if (filled($old)) {
                    Storage::disk('public')->delete($old);
                }
                SiteSetting::set($key, '');
            }
        }

        $defaults = [];
        foreach ($def['fields'] as $field) {
            if (in_array($field['type'] ?? '', ['password', 'upload'], true)) {
                continue;
            }
            $defaults[$field['key']] = $field['default'] ?? null;
        }

        $this->persistSection($sectionId, $defaults, $registry, $auditResetAction);
    }

    protected function readJson(string $key, mixed $default): mixed
    {
        $val = SiteSetting::get($key, null);
        if (is_array($val)) {
            return $val;
        }
        if (is_string($val) && $val !== '') {
            $decoded = json_decode($val, true);

            return is_array($decoded) ? $decoded : ($default ?? []);
        }

        return $default ?? [];
    }

    protected function storageType(string $fieldType): string
    {
        return match ($fieldType) {
            'boolean' => 'boolean',
            'integer' => 'integer',
            'json' => 'json',
            'structured' => 'json',
            default => 'string',
        };
    }

    /**
     * @param  array<string, mixed>  $field
     * @return list<string|\Illuminate\Contracts\Validation\ValidationRule>
     */
    protected function rulesForField(array $field): array
    {
        $type = $field['type'] ?? 'string';
        $optional = (bool) ($field['optional'] ?? false);

        return match ($type) {
            'boolean' => [$optional ? 'sometimes' : 'required', 'boolean'],
            'integer' => array_filter([
                $optional ? 'sometimes' : 'required',
                'integer',
                isset($field['min']) ? 'min:'.$field['min'] : null,
                isset($field['max']) ? 'max:'.$field['max'] : null,
            ]),
            'email' => [$optional ? 'sometimes' : 'required', 'email', 'max:255'],
            'json' => [$optional ? 'sometimes' : 'required', 'array'],
            'structured' => [$optional ? 'sometimes' : 'required', 'array'],
            'select' => [
                $optional ? 'sometimes' : 'required',
                Rule::in($field['options'] ?? []),
            ],
            'password' => ['nullable', 'string', 'max:255'],
            'color' => [$optional ? 'sometimes' : 'required', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'textarea' => [$optional ? 'sometimes' : 'required', 'string', 'max:5000'],
            default => array_filter([
                $optional ? 'sometimes' : 'required',
                'string',
                isset($field['max']) ? 'max:'.$field['max'] : 'max:2000',
            ]),
        };
    }
}
