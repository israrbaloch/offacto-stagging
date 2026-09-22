<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'invoice_logo',
        'logo_in_emails',
        'theme',
        'numbering_series',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'theme' => 'array',
            'logo_in_emails' => 'boolean',
        ];
    }

    /**
     * Get the company that owns the settings.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the numbering series for the settings.
     */
    public function numberingSeriesRelation()
    {
        return $this->belongsTo(NumberingSeries::class, 'numbering_series');
    }
}
