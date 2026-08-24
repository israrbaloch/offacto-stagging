<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BriefingAnswer extends Model
{
    protected $fillable = [
        'response_id',
        'question_id',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    public function response()
    {
        return $this->belongsTo(BriefingResponse::class, 'response_id');
    }

    public function question()
    {
        return $this->belongsTo(BriefingQuestion::class, 'question_id');
    }

    public function textValue(): string
    {
        $value = $this->value;
        if (is_array($value)) {
            return (string) ($value['text'] ?? $value['label'] ?? $value['value'] ?? '');
        }

        return (string) $value;
    }
}
