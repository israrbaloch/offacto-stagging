<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BriefingQuestion extends Model
{
    public const TYPE_HEADING = 'heading';
    public const TYPE_SHORT_TEXT = 'short_text';
    public const TYPE_LONG_TEXT = 'long_text';
    public const TYPE_YES_NO = 'yes_no';
    public const TYPE_SINGLE_CHOICE = 'single_choice';
    public const TYPE_QUANTITY = 'quantity';

    protected $fillable = [
        'briefing_id',
        'sort_order',
        'type',
        'label',
        'help_text',
        'required',
        'service_id',
        'price_override',
        'options',
    ];

    protected function casts(): array
    {
        return [
            'required' => 'boolean',
            'price_override' => 'decimal:2',
            'options' => 'array',
        ];
    }

    public function briefing()
    {
        return $this->belongsTo(Briefing::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public static function types(): array
    {
        return [
            self::TYPE_HEADING => 'Heading',
            self::TYPE_SHORT_TEXT => 'Short text',
            self::TYPE_LONG_TEXT => 'Long text',
            self::TYPE_YES_NO => 'Yes / No',
            self::TYPE_SINGLE_CHOICE => 'Single choice',
            self::TYPE_QUANTITY => 'Quantity',
        ];
    }
}
