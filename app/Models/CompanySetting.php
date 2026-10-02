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
        'integrations_mode',
        'mollie_test_key',
        'mollie_live_key',
        'postbode_test_token',
        'postbode_live_token',
        'postbode_mailbox_code',
        'postbode_envelope_uuid',
        'postbode_v1_mailbox_id',
        'postbode_v1_envelope_id',
        'postbode_default_country',
        'postbode_registered',
        'postbode_send_immediately',
        'postbode_api_version',
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
            'mollie_test_key' => 'encrypted',
            'mollie_live_key' => 'encrypted',
            'postbode_test_token' => 'encrypted',
            'postbode_live_token' => 'encrypted',
            'postbode_registered' => 'boolean',
            'postbode_send_immediately' => 'boolean',
            'postbode_v1_mailbox_id' => 'integer',
            'postbode_v1_envelope_id' => 'integer',
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
