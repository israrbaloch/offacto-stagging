<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GovConfigChangeLog extends Model
{
    protected $fillable = [
        'setting_key',
        'section_id',
        'old_value',
        'new_value',
        'changed_by_user_id',
        'reason',
    ];

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
