<?php

namespace App\Support;

use App\Models\GovConfigChangeLog;
use Illuminate\Support\Facades\Schema;

final class GovernanceConfigLogger
{
    public static function logChange(
        string $settingKey,
        mixed $oldValue,
        mixed $newValue,
        ?string $sectionId = null,
        ?int $userId = null,
        ?string $reason = null,
        bool $sensitive = false,
    ): void {
        if (! Schema::hasTable('gov_config_change_logs')) {
            return;
        }

        $normalize = static function (mixed $value) use ($sensitive): ?string {
            if ($sensitive) {
                return filled($value) ? '[REDACTED]' : null;
            }
            if (is_array($value)) {
                return json_encode($value);
            }

            return $value === null ? null : (string) $value;
        };

        $old = $normalize($oldValue);
        $new = $normalize($newValue);

        if ($old === $new) {
            return;
        }

        GovConfigChangeLog::create([
            'setting_key' => $settingKey,
            'section_id' => $sectionId,
            'old_value' => $old,
            'new_value' => $new,
            'changed_by_user_id' => $userId ?? auth()->id(),
            'reason' => $reason,
        ]);
    }
}
