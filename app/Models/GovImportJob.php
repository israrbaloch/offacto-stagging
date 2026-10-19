<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GovImportJob extends Model
{
    protected $fillable = [
        'reference',
        'import_type',
        'status',
        'field_mapping',
        'stats',
        'error_report',
        'requested_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'field_mapping' => 'array',
            'stats' => 'array',
            'error_report' => 'array',
        ];
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }
}
